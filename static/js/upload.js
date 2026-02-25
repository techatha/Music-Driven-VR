const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const loading = document.getElementById('loading');
const loadingText = document.getElementById('loading-text');
const resultSection = document.getElementById('result-section');
const errorMsg = document.getElementById('error-msg');
const confirmBtn = document.getElementById('confirm-btn');

let currentJobId = null; // Store this globally for the confirm button

// --- Drag & Drop Handlers ---
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', () => {
    if (fileInput.files.length) handleFile(fileInput.files[0]);
});

function handleFile(file) {
    appState.setFile(file)
    // Reset UI
    resultSection.style.display = 'none';
    errorMsg.style.display = 'none';
    confirmBtn.style.display = 'none';

    loading.style.display = 'block';
    loadingText.textContent = "Analyzing... Extracting metadata and finding lyrics...";

    const formData = new FormData();
    formData.append('file', file);

    fetch('/api/analyze', { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            pollJobStatus(data.job_id);
        })
        .catch(err => {
            loading.style.display = 'none';
            showError("Network or Server Error: " + err.message);
        });
}

function pollJobStatus(jobId) {
    currentJobId = jobId;
    fetch(`/api/status/${jobId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'done') {
                fetchFinalResult(jobId);
            }
            else if (data.status === 'awaiting_user_confirmation') {
                // PHASE 1 DONE! Fetch lyrics and pause for the user
                fetchIntermediateSongInfo(jobId);
            }
            else if (data.status === 'error') {
                loading.style.display = 'none';
                showError("The backend encountered an error while processing the music.");
            }
            else {
                // --- NEW: Update loading text based on exact backend status ---
                const statusMessages = {
                    'queued_lyrics': 'Waiting in queue to extract lyrics...',
                    'running_lyrics': 'Analyzing audio... Extracting metadata and Shazam tags...',
                    'queued_analysis': 'Lyrics confirmed! Waiting in queue for NLP analysis...',
                    'running_analysis': 'Running Deep NLP & calculating rhythm features...'
                };

                // If the status matches one of our keys, update the text.
                // Otherwise, show a generic fallback.
                if (statusMessages[data.status]) {
                    loadingText.textContent = statusMessages[data.status];
                } else {
                    loadingText.textContent = `Processing (${data.status})...`;
                }

                // Wait 2 seconds and ask again
                setTimeout(() => pollJobStatus(jobId), 2000);
            }
        })
        .catch(err => {
            loading.style.display = 'none';
            showError("Polling Error: " + err.message);
        });
}

function fetchIntermediateSongInfo(jobId) {
    fetch(`/api/getSongInfo/${jobId}`)
        .then(response => response.json())
        .then(songInfo => {
            loading.style.display = 'none';

            // Populate the UI with Phase 1 data
            document.getElementById('track-title').textContent = songInfo.title || "Unknown Title";
            document.getElementById('track-artist').textContent = songInfo.artist || "Unknown Artist";
            document.getElementById('track-album').textContent = songInfo.album || "-";
            document.getElementById('cover-art').src = songInfo.cover_art || 'https://via.placeholder.com/150?text=No+Cover';

            // Put lyrics inside the editable textarea
            document.getElementById('lyrics-box').value = songInfo.lyrics || "";

            resultSection.style.display = 'block';
            confirmBtn.style.display = 'block'; // Show the "Play" button
        })
        .catch(err => showError("Error fetching song info: " + err.message));
}

// --- Trigger Phase 2 ---
confirmBtn.addEventListener('click', () => {
    const editedLyrics = document.getElementById('lyrics-box').value;

    confirmBtn.style.display = 'none';
    loading.style.display = 'block';
    loadingText.textContent = "Running Deep NLP & Generating VR Scene...";

    fetch(`/api/startAnalyze/${currentJobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lyrics: editedLyrics })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) throw new Error(data.error);
        pollJobStatus(currentJobId); // Resume polling for Phase 2!
    })
    .catch(err => {
        loading.style.display = 'none';
        showError("Failed to start analysis: " + err.message);
    });
});

function fetchFinalResult(jobId) {
    // Route corrected to match Flask backend!
    fetch(`/api/result/${jobId}`)
        .then(response => response.json())
        .then(data => {
            loading.style.display = 'none';
            if (data.error) throw new Error(data.error);

            console.log("FINAL VR DATA:", data);

            // At this point, the data is completely ready!
            // You can trigger the transition to your A-Frame scene here.
            alert("Analysis Complete! Check the console for the final JSON payload.");
            appState.setAnalysisData(data);
            appState.startVR();

        })
        .catch(err => {
            loading.style.display = 'none';
            showError("Result Fetch Error: " + err.message);
        });
}

function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
}