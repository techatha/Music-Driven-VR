from flask import Flask, render_template, jsonify, request
from python.job_manager import jobs, scraping_lyric_job, analysis_job
import os
import tempfile

# Initialize the Flask application
# We explicitly set the template folder, though 'templates' is the default
app = Flask(__name__, template_folder='templates', static_folder='static')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload_v2')
def upload_v2():
    return render_template('index2.html')


@app.route('/urban')
def urban_preset():
    return render_template('environments/urban_environment.html')


@app.route('/ocean')
def ocean_preset():
    return render_template('environments/ocean_environment.html')


@app.route('/forest')
def sky_preset():
    return render_template('environments/forest_environment.html')


@app.route('/room')
def room_preset():
    return render_template('environments/room_environment.html')


# ========== Flask Backend APIs ==========
@app.route('/api/analyze', methods=['POST'])
def analyze_music_api():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Save temp file
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, file.filename)
    file.save(temp_path)

    # Run analysis
    job_id = scraping_lyric_job(temp_path)
    return jsonify({"job_id": job_id, "status": "queued"}), 202


@app.route('/api/startAnalyze/<job_id>', methods=['POST'])
def start_analysis(job_id):
    # Get JSON safely (defaults to empty dict if no JSON is sent)
    data = request.get_json() or {}

    # Grab lyrics if they exist, otherwise default to an empty string
    submitted_lyrics = data.get('lyrics', "").strip()

    # Trigger Phase 2
    success, message = analysis_job(job_id, submitted_lyrics)

    if not success:
        return jsonify({"error": message}), 400

    return jsonify({"status": "queued_analysis", "message": message}), 200


@app.route('/api/getSongInfo/<job_id>', methods=['GET'])
def get_lyrics(job_id):
    job = jobs.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    if job['status'] == 'queued_lyrics':
        return jsonify({"error": "Job is queued but still not processed"}), 400
    if job['status'] == 'running_lyrics':
        return jsonify({"error": "Job is processing"}), 400

    return jsonify(job['song_info']), 200


@app.route('/api/status/<job_id>', methods=['GET'])
def get_status(job_id):
    job = jobs.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify({"status": job['status']})


@app.route('/api/result/<job_id>', methods=['GET'])
def get_analysis_result(job_id):
    job = jobs.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    if job['status'] != 'done':
        return jsonify({"error": "Analysis not complete"}), 400
    return jsonify(job['result'])


if __name__ == '__main__':
    debug = True  # enables the reloader and debugger
    app.run(debug=True, port=8080)
