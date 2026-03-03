/**
 * Scene Lighting Controller
 * Centralizes lighting logic for all environments.
 * - Provides a configurable color palette per environment.
 * - Spawns an Ambient light for baseline visibility.
 * - Spawns Directional lights that aggressively flash to the music beats/onsets via music-reactor.
 * - Spawns a Stable Point Light attached directly to the player's camera so it is never completely dark.
 * 
 * Usage:
 * <a-entity scene-lighting="preset: urban"></a-entity>
 */
AFRAME.registerComponent('scene-lighting', {
    schema: {
        preset: { type: 'string', default: 'default' } // 'urban', 'forest', 'ocean', 'room'
    },

    init: function () {
        // Define color palettes based on presets. 
        // You can edit these easily to change the flashing light colors!
        const palettes = {
            urban: { ambient: '#334', dir1: '#ffe0c0', dir2: '#8090ff' },
            ocean: { ambient: '#222', dir1: '#ff9900', dir2: '#331133' },
            forest: { ambient: '#222', dir1: '#aaccff', dir2: '#ffaa00' },
            room: { ambient: '#444', dir1: '#FFF', dir2: '#FFA500' },
            default: { ambient: '#333', dir1: '#ffffff', dir2: '#888888' }
        };

        const p = palettes[this.data.preset] || palettes.default;

        // 1. Ambient Light (Stable baseline visibility for the whole scene, but kept low)
        const ambient = document.createElement('a-light');
        ambient.setAttribute('type', 'ambient');
        ambient.setAttribute('color', p.ambient);
        ambient.setAttribute('intensity', '0.4');
        this.el.appendChild(ambient);

        // 2. Primary Directional Light (flashes to beats)
        const dir1 = document.createElement('a-light');
        dir1.setAttribute('type', 'directional');
        dir1.setAttribute('color', p.dir1);
        dir1.setAttribute('position', '1 3 2');
        // Notice min: 0.1 so it drops low between beats, and max: 1.5 for a bright flash
        dir1.setAttribute('music-reactor', 'property: light.intensity; min: 0.1; max: 1.5; reactive: beat; decay: 0.85');
        this.el.appendChild(dir1);

        // 3. Secondary Directional Light (flashes to onsets/snares)
        const dir2 = document.createElement('a-light');
        dir2.setAttribute('type', 'directional');
        dir2.setAttribute('color', p.dir2);
        dir2.setAttribute('position', '-1 2 -1');
        dir2.setAttribute('music-reactor', 'property: light.intensity; min: 0.1; max: 1.0; reactive: onset; decay: 0.80');
        this.el.appendChild(dir2);

        // 4. Stable Player Light (Attaches to the camera so the player always sees their surroundings)
        // We use a slight timeout to ensure the A-Frame <a-camera> exists in the DOM first
        setTimeout(() => {
            const cameraEl = document.querySelector('a-camera');
            if (cameraEl) {
                const playerLight = document.createElement('a-light');
                playerLight.setAttribute('type', 'point');
                playerLight.setAttribute('color', '#ffffff');
                playerLight.setAttribute('intensity', '0.6'); // Stable personal light so it's not too flashy
                playerLight.setAttribute('distance', '20'); // Illuminates a 20m radius around the player
                playerLight.setAttribute('position', '0 0 0');
                cameraEl.appendChild(playerLight);
            }
        }, 100);
    }
});
