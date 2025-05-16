from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime

db = SQLAlchemy()
bcrypt = Bcrypt()

# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(10), default='user', nullable=False)  # 'user' or 'admin'

    def __init__(self, username, email, password, role='user'):
        self.username = username
        self.email = email
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        self.role = role

# Blacklisted Tokens Model
class BlacklistToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(128), unique=True, nullable=False)  # JWT Token Identifier
    created_at = db.Column(db.DateTime, server_default=db.func.now())  # Timestamp

    def __init__(self, jti):
        self.jti = jti

# Album Model
class Album(db.Model):
    __tablename__ = 'album'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    artist = db.Column(db.String(120), nullable=False)
    release_date = db.Column(db.Date, nullable=False)
    genre = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    image_url = db.Column(db.String(255))  # ✅ NEW: Image URL

    def __init__(self, title, artist, release_date, genre, price, quantity, image_url=None):
        self.title = title
        self.artist = artist
        self.release_date = release_date
        self.genre = genre
        self.price = price
        self.quantity = quantity
        self.image_url = image_url

#Review Model
class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)
    album_id = db.Column(db.Integer, db.ForeignKey('album.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, rating, comment, album_id, user_id):
        self.rating = rating
        self.comment = comment
        self.album_id = album_id
        self.user_id = user_id

# Order Model
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    album_id = db.Column(db.Integer, db.ForeignKey('album.id'), nullable=False)
    order_date = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float, nullable=False)

    # Relationship with User and Album
    user = db.relationship('User', backref=db.backref('orders', lazy=True))
    album = db.relationship('Album', backref=db.backref('orders', lazy=True))

    def __init__(self, user_id, album_id, quantity, total_price):
        self.user_id = user_id
        self.album_id = album_id
        self.quantity = quantity
        self.total_price = total_price

