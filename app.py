from flask import Flask, render_template, jsonify, request
from python.analysis import *
from python.lyric_finding_service import analyze_music
import os
import tempfile

# Initialize the Flask application
# We explicitly set the template folder, though 'templates' is the default
app = Flask(__name__, template_folder='templates', static_folder='static')


@app.route('/')
def index():
    return render_template('index.html')


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


# Flask Backend APIs
@app.route('/api/upload', methods=['POST'])
def upload_music():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    job_id = init_job(file)

    return jsonify({"job_id": job_id}), 202


@app.route('/api/status/<job_id>', methods=['GET'])
def get_status(job_id):
    job = jobs.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify({"status": job['status']})


@app.route('/api/analysis/<job_id>', methods=['GET'])
def get_analysis(job_id):
    job = jobs.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    if job['status'] != 'done':
        return jsonify({"error": "Analysis not complete"}), 400
    return jsonify(job['result'])


@app.route('/upload_v2')
def upload_v2():
    return render_template('index2.html')


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

    try:
        # Run analysis
        result = analyze_music(temp_path)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == '__main__':
    # debug=True enables the reloader and debugger
    app.run(debug=True, port=5000)
