from flask import Blueprint, request, jsonify
from db_config import db
from models.models import Customer, User  

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
        'email':   customer.email,
        'balance': float(customer.balance),   # ← cast to float
        'name':    customer.user.name,
        'sname':   customer.user.sname,
        'phone':   customer.user.phone,
    })


@customer_bp.route('/<email>', methods=['PUT'])
def update_customer(email):
    data = request.json or {}
    customer = Customer.query.get(email)
    if not customer:
        return jsonify({'error':'Customer not found'}),404

    # let’s update any fields present…
    if 'balance' in data:
        customer.balance = data['balance']
    if 'name' in data or 'sname' in data or 'phone' in data:
        user = customer.user
        if 'name'  in data: user.name  = data['name']
        if 'sname' in data: user.sname = data['sname']
        if 'phone' in data: user.phone = data['phone']
    db.session.commit()

    return jsonify({
      'email':   customer.email,
      'balance': float(customer.balance),
      'name':    customer.user.name,
      'sname':   customer.user.sname,
      'phone':   customer.user.phone
    })

    
@customer_bp.route('/<email>/trips', methods=['GET'])
def get_customer_trips(email):
    customer = Customer.query.get(email)

    trips = []
    for ct in customer.customer_trips:
        # ct.trip gives you the Trip object
        # ct.start_stop and ct.end_stop give Stop objects
        trips.append({
            'trip_id':        ct.trip_id,
            'date_time':      ct.trip.date_time,
            'cost':           float(ct.cost),
            'refunded_credit': float(ct.refunded_credit),
            'start_position': ct.start_stop.name,
            'end_position':   ct.end_stop.name,
        })

    return jsonify(trips)