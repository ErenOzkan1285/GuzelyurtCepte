from flask import Blueprint, request, jsonify
from db_config import db
from models.models import Stop, Includes

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

@stop_bp.route('/trip/<int:trip_id>', methods=['GET'])
def get_stops_for_trip(trip_id):
    """
    Return the stops for a given trip, ordered by the stop_order
    defined in the INCLUDES table.
    """
    # join Stop → Includes, filter on trip_id, order by stop_order
    rows = (
        db.session.query(
            Stop.name,
            Stop.longitude,
            Stop.latitude,
            Includes.stop_order
        )
        .join(Includes, Includes.name == Stop.name)
        .filter(Includes.trip_id == trip_id)
        .order_by(Includes.stop_order)
        .all()
    )

    # build JSON array
    stops_data = [
        {
            'name':      name,
            'longitude': longitude,
            'latitude':  latitude,
            'order':     stop_order
        }
        for name, longitude, latitude, stop_order in rows
    ]

    return jsonify(stops_data)
