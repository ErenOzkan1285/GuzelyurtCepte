from flask import Blueprint, request, jsonify
from models.models import User, db
from db_config import db

user_bp = Blueprint('user', __name__)

@user_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    # Add validation and error handling
    new_user = User(
        email=data['email'],
        name=data['name'],
        sname=data['sname'],
        password=data['password'],
        phone=data['phone']
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201