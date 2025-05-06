from flask import Blueprint, request, jsonify
from db_config import db
from models.models import Customer, User  # Make sure these models exist

customer_bp = Blueprint('customer', __name__)

@customer_bp.route('/', methods=['GET'])
def get_customers():
    customers = Customer.query.all()
    return jsonify([{
        'email': customer.email,
        'balance': customer.balance,
        'name': customer.user.name,  # Accessing related User data
        'sname': customer.user.sname,
        'phone': customer.user.phone
    } for customer in customers])

@customer_bp.route('/', methods=['POST'])
def create_customer():
    data = request.json
    try:
        # Create User first
        user = User(
            email=data['email'],
            name=data['name'],
            sname=data['sname'],
            password=data['password'],  # Remember to hash this in production!
            phone=data['phone']
        )
        db.session.add(user)
        
        # Then create Customer
        customer = Customer(
            email=data['email'],
            balance=data.get('balance', 0.00)
        )
        db.session.add(customer)
        
        db.session.commit()
        return jsonify({'message': 'Customer created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@customer_bp.route('/<email>', methods=['GET'])
def get_customer(email):
    customer = Customer.query.get(email)
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404
    
    return jsonify({
        'email': customer.email,
        'balance': customer.balance,
        'name': customer.user.name,
        'sname': customer.user.sname,
        'phone': customer.user.phone
    })