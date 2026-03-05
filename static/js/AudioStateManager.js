class AudioStateManager {
    constructor() {
        this.audioFile = null;      // The actual MP3 File object (Browser RAM)
        this.analysisData = null;   // The massive JSON payload from Phase 2
        this.audioUrl = null;       // The Blob URL for the <audio> tag
    }

    // Step 1: Save the file when the user drops it
    setFile(file) {
        this.audioFile = file;
        console.log("MP3 stored securely in Browser RAM.");
    }

    // Step 2: Save the JSON when Phase 2 finishes
    setAnalysisData(data) {
        this.analysisData = data;
    }

    // Step 3: Launch the VR Scene
    startVR() {
        if (!this.audioFile || !this.analysisData) {
            console.error("Missing file or data!");
            return;
        }

        // Auto-generate Semantic Cues for testing if the API returned an empty array
        if (!this.analysisData.semanticCues || this.analysisData.semanticCues.length === 0) {
            console.log("No semantic cues from backend. Generating fallbacks to test Semantic mode constraints...");
            this.analysisData.semanticCues = [
                { time: 10, preset: "Tension" },
                { time: 25, preset: "Euphoria" },
                { time: 40, preset: "Serenity" },
                { time: 55, preset: "Melancholy" }
            ];
        }

        // Create a temporary, high-speed URL directly from browser RAM
        this.audioUrl = URL.createObjectURL(this.audioFile);

        const preset = this.analysisData.mainEnvironment || "forest_night_dark";
        console.log("🚀 [AudioStateManager] Using preset:", preset);

        // Show loading status in UI
        const loadingText = document.getElementById('loading-text');
        if (loadingText) loadingText.textContent = "Constructing 3D Environment...";

        // Inject the chosen environment
        envInjector.inject(preset);

        // Apply sky and floor theme if preset has at least two parts (e.g. "ocean_morning" or "room_evening_dark")
        const parts = preset.split('_');
        if (parts.length >= 2) {
            const skyTime = parts[1]; // e.g. "evening" or "morning"

            // Map the semantic description from the backend to the exact A-Frame component names
            let floorPreset = null;
            if (parts.length >= 3) {
                const floorDesc = parts[2]; // e.g. "dark"
                if (floorDesc.includes('dark')) floorPreset = 'void';
                else if (floorDesc.includes('snow') || floorDesc.includes('white')) floorPreset = 'snow';
                else if (floorDesc.includes('glass') || floorDesc.includes('reflective')) floorPreset = 'glass';
            }

            // Allow time for A-Frame components to mount before emitting the theme events
            setTimeout(() => {
                console.log("🚀 [AudioStateManager] Setting theme:", skyTime, floorPreset);
                if (window.sceneTheme) {
                    if (floorPreset && floorPreset !== 'null') {
                        window.sceneTheme.setTheme(skyTime, floorPreset);
                    } else {
                        window.sceneTheme.setSky(skyTime);
                        console.log("🚀 [AudioStateManager] Setting sky theme:", skyTime);
                    }
                }
            }, 500);
        }

        const root = document.getElementById('environment-root');

        // Listen for model-loaded event and use 1500ms fallback
        let fallbackTimeout = setTimeout(() => {
            console.warn("VR Environment model-loaded event did not fire (or timeout). Forcing start...");
            this.launchExperience();
        }, 1500);

        if (root) {
            root.addEventListener('model-loaded', () => {
                clearTimeout(fallbackTimeout);
                this.launchExperience();
            }, { once: true });
        }
    }

    launchExperience() {
        // Hide Upload UI, Show VR Scene
        const uiLayer = document.getElementById('ui-layer');
        if (uiLayer) uiLayer.style.display = 'none';

        const vrLayer = document.getElementById('vr-layer');
        if (vrLayer) vrLayer.style.display = 'block';

        // Listen for mid-song semantic environment shifts from music-manager
        const sceneEl = document.querySelector('a-scene');
        if (sceneEl && !this.listeningForCues) {
            sceneEl.addEventListener('audio-semantic-cue', (e) => {
                const cue = e.detail.cue;
                console.log("🎵 Semantic Cue Triggered:", cue.preset);

                const preset = cue.preset;

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
            });
            this.listeningForCues = true;
        }

        // Tell the A-Frame Music Manager to start playing
        const managerEntity = document.querySelector('[music-manager]');
        if (managerEntity && managerEntity.components['music-manager']) {
            managerEntity.components['music-manager'].startExperience(
                this.analysisData,
                this.audioUrl
            );
        } else {
            console.error('music-manager component not found!');
        }
    }

    // Optional: Cleanup if they exit VR
    reset() {
        if (this.audioUrl) {
            URL.revokeObjectURL(this.audioUrl); // Free up browser RAM!
        }
        this.audioFile = null;
        this.analysisData = null;
        this.audioUrl = null;
    }
}

// Instantiate your global state manager
const appState = new AudioStateManager();