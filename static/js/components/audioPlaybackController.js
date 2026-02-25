/**
 * Audio Playback Controller
 * =========================
 * Self-contained audio player overlay for VR environment pages.
 *
 * Usage (from any environment page):
 *   1. Include the CSS:  <link rel="stylesheet" href="...audioPlaybackController.css">
 *   2. Include this JS:  <script src="...audioPlaybackController.js"></script>
 *   3. Load a track:     AudioPlayback.loadTrack(url, 'Song Title', 'Artist Name');
 *
 * Public API — window.AudioPlayback
 *   .loadTrack(url, title?, artist?)  — load and optionally auto-play
 *   .play()   / .pause()  / .toggle()
 *   .setVolume(0–1)
 *   .isPlaying           — boolean getter
 */

(function () {
    'use strict';

    /* ========== 1. Build DOM ========== */

    function createPlayerBar() {
        const bar = document.createElement('div');
        bar.id = 'audio-player-bar';
        bar.classList.add('hidden');          // hidden until a track is loaded

        bar.innerHTML = `
            <!-- Play / Pause -->
            <button id="ap-play-btn" aria-label="Play / Pause">
                <span id="ap-play-icon">▶</span>
            </button>

            <!-- Track Info -->
            <div id="ap-track-info">
                <div id="ap-track-title">No track loaded</div>
                <div id="ap-track-artist"></div>
            </div>

            <!-- Seek -->
            <div id="ap-seek-section">
                <div id="ap-time-row">
                    <span id="ap-time-current">0:00</span>
                    <span id="ap-time-duration">0:00</span>
                </div>
                <div id="ap-seek-bar">
                    <div id="ap-seek-fill"></div>
                </div>
            </div>

            <!-- Volume -->
            <div id="ap-volume-section">
                <span id="ap-volume-icon">🔊</span>
                <input id="ap-volume-slider" type="range" min="0" max="1" step="0.01" value="0.8">
            </div>
        `;

        document.body.appendChild(bar);
        return bar;
    }

    /* ========== 2. Helpers ========== */

    function formatTime(seconds) {
        if (!isFinite(seconds) || seconds < 0) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    /* ========== 3. Controller Logic ========== */

    let bar, audio;
    let playBtn, playIcon;
    let titleEl, artistEl;
    let timeCurrent, timeDuration;
    let seekBar, seekFill;
    let volumeSlider, volumeIcon;
    let rafId = null;
    let isSeeking = false;

    function init() {
        bar = createPlayerBar();
        audio = new Audio();
        audio.preload = 'metadata';
        audio.volume = 0.8;

        // Cache elements
        playBtn = document.getElementById('ap-play-btn');
        playIcon = document.getElementById('ap-play-icon');
        titleEl = document.getElementById('ap-track-title');
        artistEl = document.getElementById('ap-track-artist');
        timeCurrent = document.getElementById('ap-time-current');
        timeDuration = document.getElementById('ap-time-duration');
        seekBar = document.getElementById('ap-seek-bar');
        seekFill = document.getElementById('ap-seek-fill');
        volumeSlider = document.getElementById('ap-volume-slider');
        volumeIcon = document.getElementById('ap-volume-icon');

        /* --- Event Listeners --- */

        // Play / Pause
        playBtn.addEventListener('click', toggle);

        // Audio events
        audio.addEventListener('loadedmetadata', function () {
            timeDuration.textContent = formatTime(audio.duration);
        });

        audio.addEventListener('ended', function () {
            playIcon.textContent = '▶';
            cancelAnimationFrame(rafId);
        });

        // Seek bar click
        seekBar.addEventListener('mousedown', startSeek);
        seekBar.addEventListener('touchstart', startSeek, { passive: true });

        // Volume
        volumeSlider.addEventListener('input', function () {
            audio.volume = parseFloat(volumeSlider.value);
            updateVolumeIcon();
        });

        volumeIcon.addEventListener('click', function () {
            audio.muted = !audio.muted;
            updateVolumeIcon();
        });

        // Keyboard — Space to toggle (only when body/scene is focused, not input fields)
        document.addEventListener('keydown', function (e) {
            if (e.code === 'Space' && !isInputFocused()) {
                e.preventDefault();
                toggle();
            }
        });
    }

    function isInputFocused() {
        var tag = (document.activeElement && document.activeElement.tagName) || '';
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    }

    /* --- Seek logic --- */

    function startSeek(e) {
        isSeeking = true;
        doSeek(e);

        var moveEvt = e.type === 'touchstart' ? 'touchmove' : 'mousemove';
        var endEvt = e.type === 'touchstart' ? 'touchend' : 'mouseup';

        function onMove(ev) { doSeek(ev); }
        function onEnd() {
            isSeeking = false;
            document.removeEventListener(moveEvt, onMove);
            document.removeEventListener(endEvt, onEnd);
        }
        document.addEventListener(moveEvt, onMove);
        document.addEventListener(endEvt, onEnd);
    }

    function doSeek(e) {
        var rect = seekBar.getBoundingClientRect();
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        if (isFinite(audio.duration)) {
            audio.currentTime = ratio * audio.duration;
        }
        seekFill.style.width = (ratio * 100) + '%';
    }

    /* --- Playback RAF loop --- */

    function tick() {
        if (!isSeeking && isFinite(audio.duration) && audio.duration > 0) {
            var pct = (audio.currentTime / audio.duration) * 100;
            seekFill.style.width = pct + '%';
            timeCurrent.textContent = formatTime(audio.currentTime);
        }
        rafId = requestAnimationFrame(tick);
    }

    /* --- Volume icon helper --- */

    function updateVolumeIcon() {
        if (audio.muted || audio.volume === 0) {
            volumeIcon.textContent = '🔇';
        } else if (audio.volume < 0.5) {
            volumeIcon.textContent = '🔉';
        } else {
            volumeIcon.textContent = '🔊';
        }
    }

    /* --- Public API --- */

    function loadTrack(url, title, artist) {
        audio.src = url;
        audio.load();
        titleEl.textContent = title || 'Unknown Title';
        artistEl.textContent = artist || '';
        bar.classList.remove('hidden');

        // Reset UI
        seekFill.style.width = '0%';
        timeCurrent.textContent = '0:00';
        timeDuration.textContent = '0:00';
        playIcon.textContent = '▶';

        // Auto-play when ready
        audio.addEventListener('canplay', function onCanPlay() {
            audio.removeEventListener('canplay', onCanPlay);
            play();
        });
    }

    function play() {
        var p = audio.play();
        if (p && p.catch) p.catch(function () { /* autoplay blocked */ });
        playIcon.textContent = '⏸';
        cancelAnimationFrame(rafId);
        tick();
    }

    function pause() {
        audio.pause();
        playIcon.textContent = '▶';
        cancelAnimationFrame(rafId);
    }

    function toggle() {
        if (audio.paused) { play(); } else { pause(); }
    }

    /* ========== 4. Initialise on DOM ready ========== */

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* ========== 5. Expose Global API ========== */

    window.AudioPlayback = {
        loadTrack: loadTrack,
        play: play,
        pause: pause,
        toggle: toggle,
        setVolume: function (v) {
            audio.volume = Math.max(0, Math.min(1, v));
            volumeSlider.value = audio.volume;
            updateVolumeIcon();
        },
        get isPlaying() {
            return audio && !audio.paused;
        },
        /** Direct access to the underlying HTMLAudioElement if needed */
        get audioElement() {
            return audio;
        }
    };

})();
