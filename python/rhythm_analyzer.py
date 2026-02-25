import librosa
import numpy as np


def analyze_rhythm(audio_path, sr=22050, hop_length=512):
    """
    Analyze audio file and return timing data for visualization.

    Returns dict with:
      - tempo, duration
      - beats (list of beat times in seconds)
      - onsets (list of onset times)
      - energy_curve (list of {time, energy} at ~30fps)
      - spectral_centroid_curve (list of {time, centroid} normalized 0-1)
      - segments (list of {start, end, label})
    """
    y, sr = librosa.load(audio_path, sr=sr)
    duration = librosa.get_duration(y=y, sr=sr)

    # Tempo and beat detection
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr, hop_length=hop_length)
    beat_times = librosa.frames_to_time(beat_frames, sr=sr, hop_length=hop_length).tolist()

    # Handle tempo as scalar
    if hasattr(tempo, '__len__'):
        tempo = float(tempo[0]) if len(tempo) > 0 else 120.0
    else:
        tempo = float(tempo)

    # Onset detection
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr, hop_length=hop_length)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr, hop_length=hop_length).tolist()

    # RMS energy curve - downsample to ~30fps
    rms = librosa.feature.rms(y=y, hop_length=hop_length)[0]
    rms_times = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop_length)

    # Downsample to ~30fps
    target_fps = 30
    total_frames_target = int(duration * target_fps)
    if total_frames_target < 1:
        total_frames_target = 1

    ds_indices = np.linspace(0, len(rms) - 1, total_frames_target, dtype=int)
    rms_max = rms.max() if rms.max() > 0 else 1.0

    energy_curve = []
    for idx in ds_indices:
        energy_curve.append({
            "time": round(float(rms_times[idx]), 4),
            "energy": round(float(rms[idx] / rms_max), 4),
        })

    # Spectral centroid (normalized 0-1)
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=hop_length)[0]
    centroid_times = librosa.frames_to_time(np.arange(len(centroid)), sr=sr, hop_length=hop_length)
    centroid_max = centroid.max() if centroid.max() > 0 else 1.0

    ds_indices_c = np.linspace(0, len(centroid) - 1, total_frames_target, dtype=int)
    spectral_centroid_curve = []
    for idx in ds_indices_c:
        spectral_centroid_curve.append({
            "time": round(float(centroid_times[idx]), 4),
            "centroid": round(float(centroid[idx] / centroid_max), 4),
        })

    # Simple segmentation based on energy changes
    segments = _segment_by_energy(rms, rms_times, duration)

    return {
        "tempo": round(tempo, 2),
        "duration": round(duration, 3),
        "beats": [round(b, 4) for b in beat_times],
        "onsets": [round(o, 4) for o in onset_times],
        "energy_curve": energy_curve,
        "spectral_centroid_curve": spectral_centroid_curve,
        "segments": segments,
    }


def _segment_by_energy(rms, rms_times, duration, min_segment_sec=10.0):
    """
    Simple segmentation: split into segments where average energy
    changes significantly.
    """
    if len(rms) == 0:
        return [{"start": 0.0, "end": round(duration, 3), "label": "segment_0"}]

    # Use a window and detect energy level shifts
    window_frames = max(1, int(len(rms) / max(1, duration / min_segment_sec)))
    segments = []
    seg_start = 0

    for i in range(window_frames, len(rms), window_frames):
        prev_mean = np.mean(rms[max(0, i - window_frames):i])
        curr_mean = np.mean(rms[i:min(len(rms), i + window_frames)])
        rms_max = rms.max() if rms.max() > 0 else 1.0

        # If relative energy change > 30%, create new segment
        if abs(curr_mean - prev_mean) / rms_max > 0.3:
            seg_time = float(rms_times[i])
            if seg_time - (float(rms_times[seg_start]) if seg_start < len(rms_times) else 0) >= min_segment_sec:
                segments.append({
                    "start": round(float(rms_times[seg_start]), 3),
                    "end": round(seg_time, 3),
                    "label": f"segment_{len(segments)}",
                })
                seg_start = i

    # Final segment
    start_time = float(rms_times[seg_start]) if seg_start < len(rms_times) else 0
    segments.append({
        "start": round(start_time, 3),
        "end": round(duration, 3),
        "label": f"segment_{len(segments)}",
    })

    return segments

