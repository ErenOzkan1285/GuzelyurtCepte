from flask import Blueprint, request, jsonify
from db_config import db
from models.models import Trip, Bus, Driver  # Ensure these models exist

trip_bp = Blueprint('trip', __name__)

@trip_bp.route('/', methods=['GET'])
def get_trips():
    trips = Trip.query.all()
    trips_data = []
    
    for trip in trips:
        driver_data = {
            'email': trip.driver.email if trip.driver else None,
            'driver_license': trip.driver.driver_license if trip.driver else None,
            'name': trip.driver.user.name if trip.driver and trip.driver.user else None,
        }

        # Ensure the trip_id is inside the trip_data dictionary
        trip_data = {
            'trip_id': trip.trip_id,  # Make sure trip_id is inside the dictionary
            'date_time': trip.date_time,
            'current_capacity': trip.current_capacity,
            'bus_license_plate': trip.bus_license_plate,
            'bus_model': trip.bus.model if trip.bus else None,
            'driver': driver_data,  # Adding the driver data inside the trip dictionary
        }
        trips_data.append(trip_data)
    
    return jsonify(trips_data)



@trip_bp.route('/', methods=['POST'])
def create_trip():
    data = request.json
    
    # Validate required fields
    required_fields = ['trip_id', 'date_time', 'current_capacity', 'bus_license_plate', 'driver']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        # Check if bus exists
        bus = Bus.query.get(data['bus_license_plate'])
        if not bus:
            return jsonify({'error': 'Bus not found'}), 404
        
        # Check if driver exists
        driver = Driver.query.get(data['driver'])
        if not driver:
            return jsonify({'error': 'Driver not found'}), 404
        
        # Create new trip
        new_trip = Trip(
            trip_id=data['trip_id'],
            date_time=data['date_time'],
            current_capacity=data['current_capacity'],
            bus_license_plate=data['bus_license_plate'],
            driver=data['driver']
        )
        
        db.session.add(new_trip)
        db.session.commit()
        
        return jsonify({
            'message': 'Trip created successfully',
            'trip_id': new_trip.trip_id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@trip_bp.route('/<int:trip_id>', methods=['GET'])
def get_trip(trip_id):
    trip = Trip.query.get(trip_id)
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404

    # trip.includes is already ordered by stop_order
    stops_data = []
    for include in trip.includes:
        stop = include.stop
        if not stop:
            continue   # skip any orphan includes
        stops_data.append({
            'name':      stop.name,
            'order':     include.stop_order,
            'longitude': stop.longitude,
            'latitude':  stop.latitude,
        })

    trip_data = {
        'trip_id':           trip.trip_id,
        'date_time':         trip.date_time,
        'current_capacity':  trip.current_capacity,
        'bus_license_plate': trip.bus_license_plate,
        'driver': {
          'email':          trip.driver.email if trip.driver else None,
          'driver_license': trip.driver.driver_license if trip.driver else None,
          'name':           getattr(trip.driver.user, 'name', None)
        },
        'stops': stops_data
    }

    return jsonify(trip_data)

