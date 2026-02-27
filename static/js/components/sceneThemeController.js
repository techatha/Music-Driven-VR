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
        // No caching — elements change when environments are swapped
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
}

// Global instance
window.sceneTheme = new SceneThemeController();
