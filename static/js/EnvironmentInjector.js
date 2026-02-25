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
            this.loadUrban();
        } else if (basePreset.includes('ocean')) {
            this.loadOcean();
        } else if (basePreset.includes('forest')) {
            this.loadForest();
        } else if (basePreset.includes('room')) {
            this.loadRoom();
        } else {
            console.warn(`Unknown preset: ${presetString}, defaulting to room.`);
            this.loadRoom();
        }
    }

    loadUrban() {
        this.rootElement.innerHTML = `
            <a-sky color="#87CEEB"></a-sky>
            <a-light type="ambient" color="#FFF" intensity="0.5"></a-light>
            <a-light type="directional" position="-1 1 0" intensity="0.5"></a-light>
            <a-entity id="urban-placeholder" geometry="primitive: box; width: 10; height: 10; depth: 10" material="color: #444" position="0 5 -15"></a-entity>
        `;
    }

    loadOcean() {
        this.rootElement.innerHTML = `
            <a-sky color="#050510"></a-sky>
            <a-light type="ambient" color="#222"></a-light>
            <a-light type="point" position="0 5 0" color="#ffaa00" intensity="0.5"></a-light>
            <a-entity id="ocean-placeholder" geometry="primitive: plane; width: 100; height: 100" material="color: #006994" rotation="-90 0 0"></a-entity>
        `;
    }

    loadForest() {
        this.rootElement.innerHTML = `
            <a-sky color="#0a1a0f"></a-sky>
            <a-light type="ambient" color="#4a5a4f" intensity="0.6"></a-light>
            <a-light type="directional" position="1 1 -1" color="#aaccff" intensity="0.3"></a-light>
            <a-entity id="forest-placeholder" geometry="primitive: cylinder; radius: 0.5; height: 5" material="color: #3b2f2f" position="0 2.5 -5"></a-entity>
        `;
    }

    loadRoom() {
        this.rootElement.innerHTML = `
            <a-sky color="#050510"></a-sky>
            <a-light type="ambient" color="#FFF" intensity="0.3"></a-light>
            <a-light type="point" position="0 4 0" color="#FFA500" intensity="0.5"></a-light>
            <a-entity id="room-placeholder" geometry="primitive: box; width: 8; height: 0.2; depth: 8" material="color: #800000" position="0 0 0"></a-entity>
        `;
    }
}

// Instantiate globally
const envInjector = new EnvironmentInjector();
