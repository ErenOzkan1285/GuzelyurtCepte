import bcrypt
from flask import Blueprint, request, jsonify
from models.models import User, Customer, Employee, Support, Driver,  db
from db_config import db

user_bp = Blueprint('user', __name__)

@user_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Basic validation
    required_fields = ['email', 'name', 'sname', 'password', 'phone']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 400

    hashed_pw = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

    new_user = User(
        email=data['email'],
        name=data['name'],
        sname=data['sname'],
        password=hashed_pw.decode('utf-8'),
        phone=data['phone'],
    )
    
    db.session.add(new_user)
    
    new_customer = Customer(
        email=data['email'],  
        balance = 0, #by default
    )
    
    db.session.add(new_customer)
    db.session.commit()
    
    return jsonify({'message': 'Customer registered successfully'}), 201

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Verify credentials against User table
    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        return jsonify({'message': 'Invalid credentials'}), 401

    # Determine user role by checking which role-specific table they exist in
    role = 'customer'  # Default role
    
    if Driver.query.filter_by(email=email).first():
        role = 'driver'
    elif Support.query.filter_by(email=email).first():
        role = 'support'
    elif Employee.query.filter_by(email=email).first():
        role = 'employee'
    # Customer check is not needed since it's the default

    return jsonify({
        'message': 'Login successful',
        'user': {
            'email': user.email,
            'name': user.name,        # From User table
            'sname': user.sname,       # From User table
            'phone': user.phone,       # From User table
            'role': role
        }
    }), 200