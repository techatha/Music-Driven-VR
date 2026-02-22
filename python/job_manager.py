import os
import uuid
from concurrent.futures import ThreadPoolExecutor
from python.lyric_finding_service import find_song_info

# Import the heavy lifting function from your second file
from python.nlp_lyric_analyzer import nlp_find_main_preset

executor = ThreadPoolExecutor(max_workers=4)
jobs = {}


def init_job(temp_path):
    job_id = str(uuid.uuid4())

    # Initialize job state
    jobs[job_id] = {'status': 'queued', 'result': None}

    # Create a small wrapper function to handle the jobs dictionary updates
    def task_wrapper():
        try:
            jobs[job_id]['status'] = 'running'

            # RUN THE FUNCTION FROM THE SECOND FILE HERE
            song_info = find_song_info(temp_path)
            main_world = nlp_find_main_preset(song_info.get('lyrics'))

            result = {
                "songInfo": song_info,
                "duration": 10,
                "mainEnvironment": main_world,
                "beats": [],
                "onsets": [],
                "energy": {
                    "hop": 10,
                    "values": [],
                },
                "lyricSegments": [],  # {start: , end: , text: }
                "semanticCues": [],  # {time: , preset: , confidence: , params: }
            }
            jobs[job_id]['result'] = result
            jobs[job_id]['status'] = 'done'
        except Exception as e:
            jobs[job_id]['status'] = 'error'
            jobs[job_id]['error'] = str(e)
            print(e)

        finally:
            # 3. Clean up the temporary MP3 file, so it doesn't waste space!
            if os.path.exists(temp_path):
                os.remove(temp_path)

    # Submit the wrapper to the thread pool
    executor.submit(task_wrapper)

    return job_id

