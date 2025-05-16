from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.app import db, Review, User, Album

from datetime import datetime

reviews_bp = Blueprint('reviews', __name__, url_prefix='/reviews')


# Create a review
@reviews_bp.route('/', methods=['POST'])
@jwt_required()
def create_review():
    data = request.get_json()
    current_user = get_jwt_identity()

    user = User.query.filter_by(username=current_user).first()
    album = Album.query.get(data.get('album_id'))

    if not user or not album:
        return jsonify({'error': 'Invalid user or album'}), 400

    try:
        review = Review(
            rating=data['rating'],
            comment=data.get('comment'),
            album_id=album.id,
            user_id=user.id
        )
        db.session.add(review)
        db.session.commit()

        return jsonify({'message': 'Review added successfully'}), 201
    except Exception as e:
        return jsonify({'error': 'Invalid input or server error', 'details': str(e)}), 500

# Get all reviews (admin only)
@reviews_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_reviews():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()

    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    reviews = Review.query.all()
    return jsonify([
        {
            'id': r.id,
            'album_id': r.album_id,
            'user_id': r.user_id,
            'rating': r.rating,
            'comment': r.comment,
            'created_at': r.created_at.isoformat() if r.created_at else None,
            'updated_at': r.updated_at.isoformat() if r.updated_at else None
        }
        for r in reviews
    ])

# Get all reviews for a specific album
@reviews_bp.route('/album/<int:album_id>', methods=['GET'])
def get_reviews_for_album(album_id):
    reviews = Review.query.filter_by(album_id=album_id).all()
    return jsonify([
        {
            'id': r.id,
            'user_id': r.user_id,
            'rating': r.rating,
            'comment': r.comment,
            'created_at': r.created_at.isoformat(),
            'updated_at': r.updated_at.isoformat()
        } for r in reviews
    ])

# Get all reviews written by a specific user
@reviews_bp.route('/user/<int:user_id>', methods=['GET'])
def get_reviews_by_user(user_id):
    reviews = Review.query.filter_by(user_id=user_id).all()
    return jsonify([
        {
            'id': r.id,
            'album_id': r.album_id,
            'rating': r.rating,
            'comment': r.comment,
            'created_at': r.created_at.isoformat(),
            'updated_at': r.updated_at.isoformat()
        } for r in reviews
    ])

# Update a review
@reviews_bp.route('/<int:review_id>', methods=['PUT'])
@jwt_required()
def update_review(review_id):
    data = request.get_json()
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()

    review = Review.query.get(review_id)

    if not review or review.user_id != user.id:
        return jsonify({'error': 'Not authorized to edit this review'}), 403

    if 'rating' in data:
        review.rating = data['rating']
    if 'comment' in data:
        review.comment = data['comment']

    db.session.commit()
    return jsonify({'message': 'Review updated successfully'}), 200

# Delete a review
@reviews_bp.route('/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(review_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    review = Review.query.get(review_id)

    if not review:
        return jsonify({'error': 'Review not found'}), 404

    if review.user_id != user.id and user.role != 'admin':
        return jsonify({'error': 'Not authorized to delete this review'}), 403
    
    db.session.delete(review)
    db.session.commit()
    return jsonify({'message': 'Review deleted successfully'}), 200
