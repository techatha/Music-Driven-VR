/**
 * Scene Theme Controller
 * 
 * A unified controller that manages both the sky (sky-controller)
 * and the floor (multi-color-floor) together.
 * 
 * Usage:
 *   From JS:
 *     sceneTheme.setTheme('day', 'snow');
 *     sceneTheme.setTheme('night', 'void');
 *     sceneTheme.setTheme('evening', 'glass');
 *     sceneTheme.setTheme('morning', 'custom', '#ff6600');
 *     sceneTheme.setSky('day');
 *     sceneTheme.setFloor('snow');
 */
class SceneThemeController {
    constructor() {
        // Cache the currently applied themes
        this.currentSky = null;
        this.currentFloor = null;
        this.currentCustomColor = null;
        this.currentParticlePreset = null;
    }

    _findElements() {
        return {
            skyEl: document.querySelector('[sky-controller]'),
            floorEl: document.querySelector('[multi-color-floor]')
        };
    }

    // ─── Combined ───────────────────────────────────────

    /**
     * Set both sky and floor in one call.
     * @param {'day'|'evening'|'night'|'morning'} sky - Sky time preset
     * @param {'snow'|'glass'|'void'|'custom'} floor - Floor preset
     * @param {string} [customColor] - Hex color for 'custom' floor
     */
    setTheme(sky, floor, customColor) {
        this.setSky(sky);
        this.setFloor(floor, customColor);
    }

    // ─── Sky ────────────────────────────────────────────

    /**
     * Set the sky time.
     * @param {'day'|'evening'|'night'|'morning'} time
     */
    setSky(time) {
        this.currentSky = time; // Save state
        const { skyEl } = this._findElements();
        if (!skyEl) { console.warn('SceneThemeController: sky-controller not found'); return; }

        const eventMap = {
            day: 'set-day',
            evening: 'set-evening',
            night: 'set-night',
            morning: 'set-morning'
        };

        const event = eventMap[time];
        if (event) {
            console.log(`SceneTheme: Sky → ${time}`);
            skyEl.emit(event);
        } else {
            console.warn(`SceneThemeController: Unknown sky preset "${time}". Use: morning, evening, night`);
        }
    }

    // ─── Floor ──────────────────────────────────────────

    /**
     * Set the floor preset.
     * @param {'snow'|'glass'|'void'|'custom'} preset
     * @param {string} [customColor] - Hex color (only for 'custom')
     */
    setFloor(preset, customColor) {
        this.currentFloor = preset; // Save state
        if (preset === 'custom') this.currentCustomColor = customColor;

        const { floorEl } = this._findElements();
        if (!floorEl) { console.warn('SceneThemeController: multi-color-floor not found'); return; }

        const eventMap = {
            snow: 'set-floor-snow',
            glass: 'set-floor-glass',
            void: 'set-floor-void'
        };

        if (preset === 'custom') {
            console.log(`SceneTheme: Floor → custom (${customColor})`);
            floorEl.emit('set-floor-custom', { color: customColor || '#000' });
        } else {
            const event = eventMap[preset];
            if (event) {
                console.log(`SceneTheme: Floor → ${preset}`);
                floorEl.emit(event);
            } else {
                console.warn(`SceneThemeController: Unknown floor preset "${preset}". Use: snow, glass, void, custom`);
            }
        }
    }

    // ─── Particles & Lanterns ───────────────────────────

    /**
     * Set the global particle and lantern state (driven by semantic cues)
     * @param {'Tension'|'Melancholy'|'Serenity'|'Euphoria'|'none'|'clear'} preset 
     */
    setParticles(preset) {
        this.currentParticlePreset = preset; // Save state

        // 1. Control the Particles globally
        const particleSystems = document.querySelectorAll('[custom-particles]');
        particleSystems.forEach(ps => {
            const currentType = ps.getAttribute('custom-particles').type;

            // Don't mess with sparks in the fireplace, they should stay sparks!
            if (currentType === 'sparks') return;

            if (preset === 'Tension') {
                ps.setAttribute('custom-particles', 'type: rain; count: 25000; color: #88ccff');
            } else if (preset === 'Melancholy') {
                // We use 'rain' but color it white so it looks like snow falling
                ps.setAttribute('custom-particles', 'type: rain; count: 30000; color: #ffffff');
            } else if (preset === 'Serenity') {
                ps.setAttribute('custom-particles', 'type: leaves; count: 12000; color: #66cc66');
            } else if (preset === 'Euphoria') {
                ps.setAttribute('custom-particles', 'type: stars; count: 20000; color: #ffeb99');
            } else if (preset === 'none' || preset === 'clear') {
                ps.setAttribute('custom-particles', 'type: none');
            }
        });

        // 2. Control the Lanterns globally
        const lanterns = document.querySelectorAll('[lanterns]');
        lanterns.forEach(lanternSystem => {
            if (preset === 'Tension' || preset === 'Melancholy') {
                lanternSystem.setAttribute('visible', 'true');
            } else if (preset === 'Euphoria' || preset === 'Serenity') {
                lanternSystem.setAttribute('visible', 'false');
            }
        });

        console.log(`SceneTheme: Particles & Lanterns → ${preset}`);
    }

    /**
     * Reapply the highest-priority saved theme to the current DOM elements
     * (Useful after swapping environments)
     */
    reapplyTheme() {
        if (this.currentSky) this.setSky(this.currentSky);
        if (this.currentFloor) this.setFloor(this.currentFloor, this.currentCustomColor);
        if (this.currentParticlePreset) this.setParticles(this.currentParticlePreset);
    }
}

// Global instance
window.sceneTheme = new SceneThemeController();
