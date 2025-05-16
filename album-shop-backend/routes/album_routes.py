from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.app import db, Album, User
from datetime import datetime

album_bp = Blueprint('album_bp', __name__, url_prefix='/albums')

# Helper: check admin role
def is_admin(username):
    user = User.query.filter_by(username=username).first()
    return user and user.role == 'admin'

# Create Album (Admin Only)
@album_bp.route('/', methods=['POST'])
@jwt_required()
def create_album():
    current_user = get_jwt_identity()
    if not is_admin(current_user):
        return jsonify({'error': 'Admins only'}), 403

    data = request.get_json()
    try:
        album = Album(
            title=data['title'],
            artist=data['artist'],
            release_date=datetime.strptime(data['release_date'], '%Y-%m-%d'),
            genre=data['genre'],
            price=float(data['price']),
            quantity=int(data['quantity']),
            image_url=data.get('image_url')  # ✅ NEW
        )
        db.session.add(album)
        db.session.commit()
        return jsonify({
            'message': 'Album created successfully',
            'album': {
                'id': album.id,
                'title': album.title,
                'image_url': album.image_url  # ✅ NEW
            }
        }), 201
    except Exception as e:
        return jsonify({'error': 'Invalid input or server error', 'details': str(e)}), 400

# Read All Albums (Public)
@album_bp.route('/', methods=['GET'])
def get_albums():
    albums = Album.query.all()
    return jsonify([{
        'id': album.id,
        'title': album.title,
        'artist': album.artist,
        'release_date': album.release_date.isoformat(),
        'genre': album.genre,
        'price': album.price,
        'quantity': album.quantity,
        'image_url': album.image_url  # ✅ NEW
    } for album in albums]), 200

# Read Single Album (Public)
@album_bp.route('/<int:album_id>', methods=['GET'])
def get_album(album_id):
    album = Album.query.get(album_id)
    if not album:
        return jsonify({'error': 'Album not found'}), 404

    return jsonify({
        'id': album.id,
        'title': album.title,
        'artist': album.artist,
        'release_date': album.release_date.isoformat(),
        'genre': album.genre,
        'price': album.price,
        'quantity': album.quantity,
        'image_url': album.image_url  # ✅ NEW
    }), 200

# Update Album (Admin Only)
@album_bp.route('/<int:album_id>', methods=['PUT'])
@jwt_required()
def update_album(album_id):
    current_user = get_jwt_identity()
    if not is_admin(current_user):
        return jsonify({'error': 'Admins only'}), 403

    data = request.get_json()
    album = Album.query.get(album_id)
    if not album:
        return jsonify({'error': 'Album not found'}), 404

    try:
        album.title = data.get('title', album.title)
        album.artist = data.get('artist', album.artist)
        album.release_date = datetime.strptime(
            data.get('release_date', album.release_date.strftime('%Y-%m-%d')),
            '%Y-%m-%d'
        )
        album.genre = data.get('genre', album.genre)
        album.price = float(data.get('price', album.price))
        album.quantity = int(data.get('quantity', album.quantity))
        album.image_url = data.get('image_url', album.image_url)  # ✅ NEW
        db.session.commit()
        return jsonify({'message': 'Album updated'}), 200
    except Exception as e:
        return jsonify({'error': 'Update failed', 'details': str(e)}), 400

# Delete Album (Admin Only)
@album_bp.route('/<int:album_id>', methods=['DELETE'])
@jwt_required()
def delete_album(album_id):
    current_user = get_jwt_identity()
    if not is_admin(current_user):
        return jsonify({'error': 'Admins only'}), 403

    album = Album.query.get(album_id)
    if not album:
        return jsonify({'error': 'Album not found'}), 404

    db.session.delete(album)
    db.session.commit()
    return jsonify({'message': 'Album deleted successfully'}), 200
