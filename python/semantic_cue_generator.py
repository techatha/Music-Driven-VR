import numpy as np

def generate_dynamic_cues(rhythm_data):
    """
    Takes the rhythm analysis and outputs an array of semantic cues 
    timed to the energy segments of the song.
    """
    cues = []
    
    energy_curve = rhythm_data.get("energy_curve", [])
    centroid_curve = rhythm_data.get("spectral_centroid_curve", [])
    segments = rhythm_data.get("segments", [])
    
    for seg in segments:
        start_time = seg["start"]
        end_time = seg["end"]
        
        # Filter the curves for just this segment's time window
        seg_energies = [e["energy"] for e in energy_curve if start_time <= e["time"] <= end_time]
        seg_centroids = [c["centroid"] for c in centroid_curve if start_time <= c["time"] <= end_time]
        
        # Calculate the averages for this specific segment
        avg_energy = np.mean(seg_energies) if seg_energies else 0
        avg_centroid = np.mean(seg_centroids) if seg_centroids else 0
        
        # Map to Russell's Quadrants using dynamic thresholds
        is_high_energy = avg_energy > 0.5 
        is_bright = avg_centroid > 0.5
        
        # Translate Quadrant to Russell's Circumplex Model Emotion
        if is_high_energy and is_bright:
            preset = "Euphoria" 
        elif is_high_energy and not is_bright:
            preset = "Tension"
        elif not is_high_energy and not is_bright:
            preset = "Melancholy"
        else:
            preset = "Serenity"
            
        cues.append({
            "time": round(start_time + 0.5, 2), 
            "preset": preset
        })
        
    return cues
