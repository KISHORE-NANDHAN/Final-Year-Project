from flask import Flask
from flask_cors import CORS
from routes.communication_routes import communication_bp
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

app.register_blueprint(communication_bp, url_prefix="/api/communication")

if __name__ == "__main__":
    app.run(debug=True)
