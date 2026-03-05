class EnvironmentInjector {
    constructor() {
        this.rootElement = document.getElementById('environment-root');
    }

    inject(presetString) {
        if (!this.rootElement) {
            this.rootElement = document.getElementById('environment-root');
            if (!this.rootElement) {
                console.error('EnvironmentInjector: #environment-root not found!');
                return;
            }
        }

        // Clear existing environment
        this.rootElement.innerHTML = '';

        console.log(`Injecting environment preset: ${presetString}`);

        // Extract base preset if needed (handling something like room_evening_dark)
        let basePreset = presetString.toLowerCase();
        if (basePreset.includes('urban')) {
            if (typeof injectUrbanEnvironment === 'function') injectUrbanEnvironment(this.rootElement);
            else console.error("injectUrbanEnvironment not found");
        } else if (basePreset.includes('ocean')) {
            if (typeof injectOceanEnvironment === 'function') injectOceanEnvironment(this.rootElement);
            else console.error("injectOceanEnvironment not found");
        } else if (basePreset.includes('forest') || basePreset.includes('sky')) {
            if (typeof injectForestEnvironment === 'function') injectForestEnvironment(this.rootElement);
            else console.error("injectForestEnvironment not found");
        } else if (basePreset.includes('room')) {
            if (typeof injectRoomEnvironment === 'function') injectRoomEnvironment(this.rootElement);
            else console.error("injectRoomEnvironment not found");
        } else {
            console.warn(`Unknown preset: ${presetString}, defaulting to room.`);
            if (typeof injectRoomEnvironment === 'function') injectRoomEnvironment(this.rootElement);
            else console.error("injectRoomEnvironment not found");
        }

        // --- NEW: Reapply the active Sky & Floor theme after the new environment DOM loads ---
        setTimeout(() => {
            if (window.sceneTheme) {
                console.log("EnvironmentInjector: Reapplying saved Sky and Floor themes...");
                window.sceneTheme.reapplyTheme();
            }
        }, 200); // 200ms gives A-Frame time to parse the newly injected HTML and attach components
    }
}

// Instantiate globally
const envInjector = new EnvironmentInjector();
