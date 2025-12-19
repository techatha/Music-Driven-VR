from flask import Flask, render_template

# Initialize the Flask application
# We explicitly set the template folder, though 'templates' is the default
app = Flask(__name__, template_folder='templates', static_folder='assets')

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    # debug=True enables the reloader and debugger
    app.run(debug=True, port=5000)
