import os
import uuid
from concurrent.futures import ThreadPoolExecutor
from python.lyric_finding_service import find_song_info
from python.nlp_lyric_analyzer import nlp_find_main_preset
from python.rhythm_analyzer import analyze_rhythm

# State: queued_lyrics => running_lyrics => awaiting_user_confirmation => running_analysis => done
executor = ThreadPoolExecutor(max_workers=4)
jobs = {}


def scraping_lyric_job(temp_path):
    job_id = str(uuid.uuid4())

    # We now store the temp_path in the job dictionary so we can use it in Phase 2
    jobs[job_id] = {
        'status': 'queued_lyrics',
        'temp_path': temp_path,
        'song_info': None,
        'result': None
    }

    def phase1_task():
        try:
            jobs[job_id]['status'] = 'running_lyrics'

            # 1. Just get the song info and lyrics
            song_info = find_song_info(temp_path)
            jobs[job_id]['song_info'] = song_info

            # 2. Change status to tell the frontend we are ready for the user
            jobs[job_id]['status'] = 'awaiting_user_confirmation'

            # NOTE: We DO NOT delete the temp_path here! We need it for Phase 2.

        except Exception as e:
            jobs[job_id]['status'] = 'error'
            jobs[job_id]['error'] = f"Phase 1 Error: {str(e)}"
            # If it fails early, clean up the file
            if os.path.exists(temp_path):
                os.remove(temp_path)

    executor.submit(phase1_task)
    return job_id


def analysis_job(job_id, confirmed_lyrics):
    if job_id not in jobs or jobs[job_id]['status'] != 'awaiting_user_confirmation':
        return False, "Job not ready or not found."

    jobs[job_id]['status'] = 'queued_analysis'

    def phase2_task():
        temp_path = jobs[job_id]['temp_path']
        try:
            jobs[job_id]['status'] = 'running_analysis'

            # 1. Update lyrics from the frontend
            song_info = jobs[job_id]['song_info']
            song_info['lyrics'] = confirmed_lyrics

            # 2. Run NLP to find the main VR environment preset (ocean, urban, etc.)
            main_world = nlp_find_main_preset(confirmed_lyrics)

            # 3. --- NEW: Run the Rhythm Analysis ---
            # This extracts the beats, onsets, and 30fps energy curves
            rhythm_data = analyze_rhythm(temp_path)

            # 4. Compile the final massive VR payload!
            result = {
                "songInfo": song_info,
                "mainEnvironment": main_world,

                # --- NEW: Injecting the rhythm data ---
                "duration": rhythm_data["duration"],
                "tempo": rhythm_data["tempo"],
                "beats": rhythm_data["beats"],
                "onsets": rhythm_data["onsets"],
                "energyCurve": rhythm_data["energy_curve"],
                "spectralCentroid": rhythm_data["spectral_centroid_curve"],
                "audioSegments": rhythm_data["segments"],

                # Placeholders for future lyric timing logic
                "lyricSegments": [],
                "semanticCues": [],
            }

            jobs[job_id]['result'] = result
            jobs[job_id]['status'] = 'done'

        except Exception as e:
            jobs[job_id]['status'] = 'error'
            jobs[job_id]['error'] = f"Phase 2 Error: {str(e)}"
            print(f"Phase 2 Error: {e}")

        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    executor.submit(phase2_task)
    return True, "Analysis started"


# ==========================================
# LOCAL TESTING BLOCK
# ==========================================
if __name__ == "__main__":
    import sys
    import json
    import time
    import shutil
    import tempfile

    # Default test file
    mp3_file = '../dataset/test_shazam_chandelier.mp3'
    if len(sys.argv) > 1:
        mp3_file = sys.argv[1]

    if os.path.exists(mp3_file):
        print(f"Preparing to analyze: {mp3_file}")

        # CRITICAL SAFETY STEP:
        # Make a temporary copy so phase2_task doesn't delete your original dataset file!
        temp_dir = tempfile.gettempdir()
        safe_temp_path = os.path.join(temp_dir, "TEST_COPY_" + os.path.basename(mp3_file))
        shutil.copy(mp3_file, safe_temp_path)

        try:
            # --- PHASE 1 ---
            print("\n[1/2] Starting Phase 1 (Metadata & Lyrics)...")
            job_id = scraping_lyric_job(safe_temp_path)

            # Simulate frontend polling
            while jobs[job_id]['status'] not in ['awaiting_user_confirmation', 'error']:
                print(f"  Status: {jobs[job_id]['status']}...")
                time.sleep(1.5)

            if jobs[job_id]['status'] == 'error':
                print(f"Phase 1 Error: {jobs[job_id]['error']}")
                sys.exit(1)

            print("\nPhase 1 Complete! Found Song Info:")
            print(json.dumps(jobs[job_id]['song_info'], indent=2))

            # --- PHASE 2 ---
            print("\n[2/2] Simulating user clicking 'Confirm Lyrics'...")
            # We just pass the scraped lyrics back in as if the user didn't edit them
            test_lyrics = jobs[job_id]['song_info'].get('lyrics') or ""

            analysis_job(job_id, test_lyrics)

            # Simulate frontend polling again
            while jobs[job_id]['status'] not in ['done', 'error']:
                print(f"  Status: {jobs[job_id]['status']}...")
                time.sleep(1.5)

            if jobs[job_id]['status'] == 'error':
                print(f"Phase 2 Error: {jobs[job_id]['error']}")
            else:
                print("\nPhase 2 Complete! 🎉")

                # Fetch final result
                final_result = jobs[job_id]['result']

                # TIP: The rhythm arrays are thousands of items long.
                # Let's truncate them just for the printout so your terminal doesn't freeze.
                safe_print_result = final_result.copy()
                safe_print_result['beats'] = f"[{len(final_result['beats'])} items]"
                safe_print_result['onsets'] = f"[{len(final_result['onsets'])} items]"
                safe_print_result['energyCurve'] = f"[{len(final_result['energyCurve'])} items]"
                safe_print_result['spectralCentroid'] = f"[{len(final_result['spectralCentroid'])} items]"

                print("\nFinal Payload Summary:")
                print(json.dumps(safe_print_result, indent=2))

        except Exception as e:
            print(f"Execution error: {e}")

    else:
        print(f"File not found: {mp3_file}")
        print("Usage: python job_manager.py <path_to_mp3>")

