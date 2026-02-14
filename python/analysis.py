import uuid
import threading
import time

jobs = {}


def init_job(file):
    """Initializing job"""
    job_id = str(uuid.uuid4())

    # Initialize job state
    jobs[job_id] = {'status': 'queued', 'result': None}

    # Start the thread (non-blocking)
    thread = threading.Thread(target=background_analysis, args=(job_id, file.read()))
    thread.start()

    return job_id


def background_analysis(job_id, file_data):
    """The heavy lifting happens here."""
    try:
        jobs[job_id]['status'] = 'running'

        # --- YOUR ANALYSIS LOGIC HERE ---
        # e.g., Run your k-clustering or audio feature extraction
        # --------------------------------

        time.sleep(10)  # Simulating long process

        analysis_result = {
            "bpm": 120,
            "segments": ["intro", "chorus", "outro"],
            "clusters": [1, 0, 2]  # Example lyric clusters
        }
        # --------------------------------

        jobs[job_id]['result'] = analysis_result
        jobs[job_id]['status'] = 'done'
    except Exception as e:
        jobs[job_id]['status'] = 'error'
        jobs[job_id]['error'] = str(e)

