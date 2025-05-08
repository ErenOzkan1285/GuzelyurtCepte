from flask import Blueprint, request, jsonify
from db_config import db
from models.models import Stop

stop_bp = Blueprint('stop_bp', __name__, url_prefix='/stops')

# Get all stops
@stop_bp.route('/', methods=['GET'])
def get_stops():
    stops = Stop.query.all()
    return jsonify([{
        'name': s.name,
        'longitude': s.longitude,
        'latitude': s.latitude
    } for s in stops])

# Get a single stop by name
@stop_bp.route('/<string:name>', methods=['GET'])
def get_stop(name):
    stop = Stop.query.get_or_404(name)
    return jsonify({
        'name': stop.name,
        'longitude': stop.longitude,
        'latitude': stop.latitude
    })

# Create a new stop
@stop_bp.route('/', methods=['POST'])
def create_stop():
    data = request.json
    new_stop = Stop(
        name=data['name'],
        longitude=data['longitude'],
        latitude=data['latitude']
    )
    db.session.add(new_stop)
    db.session.commit()
    return jsonify({'message': 'Stop created'}), 201

# Update an existing stop
@stop_bp.route('/<string:name>', methods=['PUT'])
def update_stop(name):
    stop = Stop.query.get_or_404(name)
    data = request.json
    stop.longitude = data.get('longitude', stop.longitude)
    stop.latitude = data.get('latitude', stop.latitude)
    db.session.commit()
    return jsonify({'message': 'Stop updated'})

# Delete a stop
@stop_bp.route('/<string:name>', methods=['DELETE'])
def delete_stop(name):
    stop = Stop.query.get_or_404(name)
    db.session.delete(stop)
    db.session.commit()
    return jsonify({'message': 'Stop deleted'})
