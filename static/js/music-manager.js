AFRAME.registerComponent('music-manager', {
    init: function () {
        this.audioElement = null;
        this.musicData = null;

        // Rhythmic & Semantic Trackers
        this.currentEnergy = 0;
        this.beatIdx = 0;
        this.onsetIdx = 0;
        this.cueIdx = 0;
    },

    startExperience: function (jsonData, blobUrl) {
        this.musicData = jsonData;
        this.beatIdx = 0;
        this.onsetIdx = 0;
        this.cueIdx = 0; // Reset semantic tracker

        // Use the global AudioPlayback controller if it exists in the HTML
        if (window.AudioPlayback) {
            const title = jsonData?.metadata?.title || jsonData?.title || "Uploaded Track";
            const artist = jsonData?.metadata?.artist || jsonData?.artist || "Unknown Artist";

            console.log("▶️ [music-manager] Sending track to AudioPlayback controller:", title);
            window.AudioPlayback.loadTrack(blobUrl, title, artist);

            this.audioElement = window.AudioPlayback.audioElement;
            console.log("▶️ [music-manager] Successfully mounted AudioPlayback controller in the UI.");
        } else {
            console.warn("⚠️ [music-manager] window.AudioPlayback missing! Falling back to silent background audio...");
            this.audioElement = new Audio(blobUrl);
            this.audioElement.play();
        }
    },

    tick: function (time, timeDelta) {
        if (!this.audioElement || !this.musicData) return;

        // --- 3-Condition Experiment Flag ---
        const conditionEl = document.getElementById('experiment-condition');
        const condition = conditionEl ? conditionEl.value : 'rhythmic';

        if (condition === 'control') {
            // "Control" group gets NO visual reactivity. Scene remains completely static.
            return;
        }

        const t = this.audioElement.currentTime;

        // 1. Calculate Raw Energy Envelope
        if (this.musicData.energy) {
            const hop = this.musicData.energy.hop;
            const idx = Math.floor(t / hop);
            this.currentEnergy = this.musicData.energy.values[idx] || 0;
        }

        // 2. Track Beats (The main loud rhythm)
        let isBeat = false;
        if (this.musicData.beats && this.beatIdx < this.musicData.beats.length) {
            if (t >= this.musicData.beats[this.beatIdx]) {
                isBeat = true;
                this.beatIdx++;
            }
        }
        this.isBeat = isBeat; // Expose to other components that poll

        // 3. Track Onsets (Sharp spikes / snare drums)
        let isOnset = false;
        if (this.musicData.onsets && this.onsetIdx < this.musicData.onsets.length) {
            if (t >= this.musicData.onsets[this.onsetIdx]) {
                isOnset = true;
                this.onsetIdx++;
            }
        }

        // 4. Track Semantic Transitions (Only if in Semantic Mode)
        if (condition === 'semantic' && this.musicData.semanticCues) {
            if (this.cueIdx < this.musicData.semanticCues.length) {
                const cue = this.musicData.semanticCues[this.cueIdx];
                if (t >= cue.time) {
                    this.el.sceneEl.emit('audio-semantic-cue', { cue: cue });
                    this.cueIdx++;
                }
            }
        }

        // Broadcast everything locally up to the <a-scene> exactly once per frame!
        this.el.sceneEl.emit('audio-sync', {
            time: t,
            energy: this.currentEnergy,
            isBeat: isBeat,
            isOnset: isOnset
        });

        // Emitting individual specific events makes it incredibly easy for simple components to listen to
        if (isBeat) this.el.sceneEl.emit('audio-beat', { time: t });
        if (isOnset) this.el.sceneEl.emit('audio-onset', { time: t });
    }
});
