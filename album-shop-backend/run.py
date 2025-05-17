from flask_cors import CORS
from auth.app import app
from routes.album_routes import album_bp
from routes.review_routes import reviews_bp
from routes.orders_routes import orders_bp

CORS(app, resources={r"/*": {"origins": "*"}},  supports_credentials=True)

app.register_blueprint(album_bp)
app.register_blueprint(reviews_bp)
app.register_blueprint(orders_bp)

if __name__ == '__main__':
    app.run(debug=True)
