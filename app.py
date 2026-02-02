from flask import Flask, render_template

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
    

if __name__ == '__main__':
    # debug=True enables the reloader and debugger
    app.run(debug=True, port=5000)
