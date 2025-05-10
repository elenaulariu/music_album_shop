from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.app import db, Order, User, Album

orders_bp = Blueprint('orders', __name__, url_prefix='/orders')

# Create Order
@orders_bp.route('/', methods=['POST'])
@jwt_required()
def create_order():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    album_id = data.get('album_id')
    quantity = data.get('quantity')

    if not album_id or not quantity:
        return jsonify({'error': 'Missing album_id or quantity'}), 400

    album = Album.query.get(album_id)
    if not album:
        return jsonify({'error': 'Album not found'}), 404

    if album.quantity < quantity:
        return jsonify({'error': 'Not enough stock', 'available': album.quantity}), 400

    total_price = album.price * quantity
    order = Order(
        user_id=user.id,
        album_id=album_id,
        quantity=quantity,
        total_price=total_price
    )

    album.quantity -= quantity  # Decrease stock

    db.session.add(order)
    db.session.commit()

    return jsonify({
        'message': 'Order created successfully',
        'order': {
            'id': order.id,
            'album_id': album.id,
            'quantity': order.quantity,
            'total_price': order.total_price
        }
    }), 201

# Get All Orders (Admin only)
@orders_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_orders():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()

    if user.role != 'admin':
        return jsonify({'error': 'Admins only'}), 403

    orders = Order.query.all()
    return jsonify([{
        'id': o.id,
        'user_id': o.user_id,
        'album_id': o.album_id,
        'quantity': o.quantity,
        'total_price': o.total_price,
        'order_date': o.order_date.isoformat()
    } for o in orders]), 200

# Get Orders by Current User
@orders_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_orders():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()

    orders = Order.query.filter_by(user_id=user.id).all()
    return jsonify([{
        'id': o.id,
        'album_id': o.album_id,
        'quantity': o.quantity,
        'total_price': o.total_price,
        'order_date': o.order_date.isoformat()
    } for o in orders]), 200

# Delete Order (by ID - user can only delete their own)
@orders_bp.route('/<int:order_id>', methods=['DELETE'])
@jwt_required()
def delete_order(order_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    order = Order.query.get(order_id)

    if not order:
        return jsonify({'error': 'Order not found'}), 404

    if user.id != order.user_id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized to delete this order'}), 403

    db.session.delete(order)
    db.session.commit()

    return jsonify({'message': f'Order {order_id} deleted'}), 200
