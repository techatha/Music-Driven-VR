AFRAME.registerComponent('music-manager', {
    init: function () {
        this.audioElement = null;
        this.musicData = null;
        this.currentEnergy = 0;
    },

    startExperience: function (jsonData, blobUrl) {
        this.musicData = jsonData;

        // Use the global AudioPlayback controller if it exists in the HTML
        if (window.AudioPlayback) {
            const title = jsonData?.metadata?.title || jsonData?.title || "Uploaded Track";
            const artist = jsonData?.metadata?.artist || jsonData?.artist || "Unknown Artist";

            console.log("▶️ [music-manager] Sending track to AudioPlayback controller:", title);
            // This loads the audio, shows the player UI at the bottom, and auto-plays
            window.AudioPlayback.loadTrack(blobUrl, title, artist);

            // Grab the underlying audio element from the controller for O(1) syncing
            this.audioElement = window.AudioPlayback.audioElement;
            console.log("▶️ [music-manager] Successfully mounted AudioPlayback controller in the UI.");
        } else {
            console.warn("⚠️ [music-manager] window.AudioPlayback missing! Falling back to silent background audio...");
            // Silent fallback if the controller JS is not in index.html
            this.audioElement = new Audio(blobUrl);
            this.audioElement.play();
        }
    },

    tick: function (time, timeDelta) {
        if (!this.audioElement || !this.musicData) return;

        const t = this.audioElement.currentTime;
        // In case the data is still loading or doesn't have an energy property, add a safe guard
        if (!this.musicData.energy) return;

        const hop = this.musicData.energy.hop;
        const idx = Math.floor(t / hop);

        this.currentEnergy = this.musicData.energy.values[idx] || 0;
    }
});
