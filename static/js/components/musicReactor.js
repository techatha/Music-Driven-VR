/**
 * Music Reactor Component
 * Listens to the 'audio-sync', 'audio-beat', and 'audio-onset' events fired by music-manager
 * 
 * Usage:
 * <a-entity music-reactor="property: scale; min: 1 1 1; max: 1.5 1.5 1.5; reactive: beat"></a-entity>
 */
AFRAME.registerComponent('music-reactor', {
    multiple: true,
    schema: {
        property: { type: 'string', default: 'scale' }, // "scale", "light.intensity", "material.color", "light.color"
        min: { type: 'string', default: '1 1 1' },
        max: { type: 'string', default: '1.2 1.2 1.2' }, // For color, hex like "#ffffff"
        reactive: { type: 'string', default: 'beat' }, // "beat", "onset", "energy"
        decay: { type: 'number', default: 0.9 }, // speed of return to min (lower = faster)
        colors: { type: 'array', default: [] } // E.g., #ff0000,#00ff00
    },

    init: function () {
        this.currentVal = 0; // 0 (min) to 1 (max)
        this.colorIdx = 0;

        // Listeners
        this.onBeat = this.onBeat.bind(this);
        this.onOnset = this.onOnset.bind(this);
        this.onSync = this.onSync.bind(this);
    },

    play: function () {
        this.el.sceneEl.addEventListener('audio-beat', this.onBeat);
        this.el.sceneEl.addEventListener('audio-onset', this.onOnset);
        this.el.sceneEl.addEventListener('audio-sync', this.onSync);
    },

    pause: function () {
        this.el.sceneEl.removeEventListener('audio-beat', this.onBeat);
        this.el.sceneEl.removeEventListener('audio-onset', this.onOnset);
        this.el.sceneEl.removeEventListener('audio-sync', this.onSync);
    },

    onBeat: function () {
        if (this.data.reactive === 'beat') {
            this.currentVal = 1.0; // Spike to max
            this.cycleColor();
        }
    },

    onOnset: function () {
        if (this.data.reactive === 'onset') {
            this.currentVal = 1.0; // Spike to max
            this.cycleColor();
        }
    },

    cycleColor: function () {
        if (this.data.colors && this.data.colors.length > 0) {
            this.colorIdx = (this.colorIdx + 1) % this.data.colors.length;
        }
    },

    onSync: function (evt) {
        if (this.data.reactive === 'energy') {
            // Energy constantly fluxuates between 0 and 1
            this.currentVal = evt.detail.energy;
        }
    },

    tick: function () {
        // If it's a transient spike (beat/onset), decay it naturally back down
        if (this.data.reactive !== 'energy') {
            this.currentVal *= this.data.decay;
            if (this.currentVal < 0.01) this.currentVal = 0;
        }

        // Apply interpolation
        this.applyInterpolation();
    },

    applyInterpolation: function () {
        const prop = this.data.property;

        // Handling Scale directly for massive performance gain over setAttribute
        if (prop === 'scale') {
            const minVec = this.parseVec3(this.data.min);
            const maxVec = this.parseVec3(this.data.max);

            this.el.object3D.scale.set(
                minVec.x + (maxVec.x - minVec.x) * this.currentVal,
                minVec.y + (maxVec.y - minVec.y) * this.currentVal,
                minVec.z + (maxVec.z - minVec.z) * this.currentVal
            );
        }
        else if (prop === 'light.intensity') {
            const minNum = parseFloat(this.data.min);
            const maxNum = parseFloat(this.data.max);
            const inst = minNum + (maxNum - minNum) * this.currentVal;
            this.el.setAttribute('light', 'intensity', inst);
        }
        else if (prop === 'material.color' || prop === 'light.color') {
            let minStr = this.data.min;
            if (this.data.colors && this.data.colors.length > 0) {
                minStr = this.data.colors[this.colorIdx];
            }

            // Simple color lerping (Expects hex like #000000)
            const minCol = new THREE.Color(minStr);
            const maxCol = new THREE.Color(this.data.max);
            const curCol = minCol.clone().lerp(maxCol, this.currentVal);

            // Set safely
            if (prop === 'material.color') {
                if (this.el.getObject3D('mesh')) {
                    const mesh = this.el.getObject3D('mesh');
                    if (mesh.material && mesh.material.color) {
                        mesh.material.color.copy(curCol);
                    }
                } else {
                    this.el.setAttribute('material', 'color', curCol.getStyle());
                }
            } else {
                this.el.setAttribute('light', 'color', curCol.getStyle());
            }
        }
    },

    parseVec3: function (str) {
        const parts = str.split(' ').map(parseFloat);
        return { x: parts[0] || 1, y: parts[1] || 1, z: parts[2] || 1 };
    }
});
