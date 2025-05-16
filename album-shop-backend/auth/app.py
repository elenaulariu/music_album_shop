from flask import Flask, request, jsonify
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
)
from flask_bcrypt import Bcrypt
from db.app import db, User, BlacklistToken
from datetime import timedelta
import os

app = Flask(__name__)

# Configs
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:postgres@localhost/myflaskdb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
app.config['ADMIN_CODE'] = os.getenv('ADMIN_CODE', 'supersecretadmincode')  # Use env var

# Init
db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()

# Register
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400

    existing_user = User.query.filter((User.username == data['username']) | (User.email == data['email'])).first()
    if existing_user:
        return jsonify({'error': 'User already exists'}), 409

    # Default role
    role = 'user'

    # If attempting to register as admin
    if data.get('role') == 'admin':
        if data.get('admin_code') != app.config['ADMIN_CODE']:
            return jsonify({'error': 'Invalid admin code'}), 403
        role = 'admin'

    new_user = User(
        username=data['username'],
        email=data['email'],
        password=data['password'],
        role=role
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': f'{role.capitalize()} registered successfully'}), 201

# Login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or not bcrypt.check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    # Create an access token with only the username as identity
    access_token = create_access_token(identity=user.username)

    return jsonify({'message': 'Login successful', 'access_token': access_token, 'username': user.username}), 200

# Logout
@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']  # Get the JWT ID (unique identifier for the token)
    current_user = get_jwt_identity()  # This will return the username since that's in the token

    # Blacklist the token (invalidate it)
    blacklisted_token = BlacklistToken(jti=jti)
    db.session.add(blacklisted_token)
    db.session.commit()

    return jsonify({'message': f'Logged out successfully, {current_user}'}), 200

# Token Blacklist Check
@jwt.token_in_blocklist_loader
def check_if_token_is_blacklisted(jwt_header, jwt_data):
    jti = jwt_data['jti']
    return db.session.query(BlacklistToken).filter_by(jti=jti).first() is not None

# Protected Route (All Users)
@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()  # Get the username from the token
    return jsonify({
        'message': f"Hello, {current_user}. This is a protected route."
    }), 200

# Admin Only Route
@app.route('/admin-only', methods=['GET'])
@jwt_required()
def admin_only():
    current_user = get_jwt_identity()  # Get the username from the token
    # Assuming `User` has a `role` attribute in the database
    user = User.query.filter_by(username=current_user).first()
    if user.role != 'admin':
        return jsonify({'error': 'Admins only'}), 403
    return jsonify({'message': f"Welcome, admin {current_user}!"}), 200

# View All Users (Admin Only)
@app.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()

    if user.role != 'admin':
        return jsonify({'error': 'Admins only'}), 403

    users = User.query.all()
    result = [{
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'role': u.role
    } for u in users]

    return jsonify({'users': result}), 200

# Delete a Specific User (Admin Only)
@app.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user = get_jwt_identity()
    admin = User.query.filter_by(username=current_user).first()

    if admin.role != 'admin':
        return jsonify({'error': 'Admins only'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': f'User {user.username} deleted successfully'}), 200

# Delete All Users (Admin Only)
@app.route('/users', methods=['DELETE'])
@jwt_required()
def delete_all_users():
    current_user = get_jwt_identity()
    admin = User.query.filter_by(username=current_user).first()

    if admin.role != 'admin':
        return jsonify({'error': 'Admins only'}), 403

    User.query.delete()
    db.session.commit()
    return jsonify({'message': 'All users deleted successfully'}), 200

@app.route('/users/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "role": user.role
    }), 200

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'id': user.id,
        'username': user.username
    }), 200

if __name__ == '__main__':
    app.run(debug=True)
