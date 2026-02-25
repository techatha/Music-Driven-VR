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

        // Create a temporary, high-speed URL directly from browser RAM
        this.audioUrl = URL.createObjectURL(this.audioFile);

        // Hide Upload UI, Show VR Scene
        document.getElementById('ui-layer').style.display = 'none';
        document.getElementById('vr-layer').style.display = 'block';

        const preset = this.analysisData.mainEnvironment || "room_evening_dark";
        envInjector.inject(preset);

        // Tell the A-Frame Music Manager to start playing
        const managerEntity = document.querySelector('[music-manager]');
        managerEntity.components['music-manager'].startExperience(
            this.analysisData,
            this.audioUrl
        );
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