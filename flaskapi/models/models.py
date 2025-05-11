from db_config import db

class User(db.Model):
    __tablename__ = 'USER'
    email = db.Column(db.String(255), primary_key=True)
    name = db.Column(db.String(255))
    sname = db.Column(db.String(255))
    password = db.Column(db.String(255))
    phone = db.Column(db.String(50))
    
    # Relationships
    admin = db.relationship('Admin', back_populates='user', uselist=False, cascade='all, delete-orphan')
    employee = db.relationship('Employee', back_populates='user', uselist=False, cascade='all, delete-orphan')
    customer = db.relationship('Customer', back_populates='user', uselist=False, cascade='all, delete-orphan')

class Admin(db.Model):
    __tablename__ = 'ADMIN'
    email = db.Column(db.String(255), db.ForeignKey('USER.email'), primary_key=True)
    user = db.relationship('User', back_populates='admin')

class Employee(db.Model):
    __tablename__ = 'EMPLOYEE'
    email = db.Column(db.String(255), db.ForeignKey('USER.email'), primary_key=True)
    department = db.Column(db.String(255))
    user = db.relationship('User', back_populates='employee')
    
    # Subtype relationships
    driver = db.relationship('Driver', back_populates='employee', uselist=False, cascade='all, delete-orphan')
    support = db.relationship('Support', back_populates='employee', uselist=False, cascade='all, delete-orphan')

class Customer(db.Model):
    __tablename__ = 'CUSTOMER'
    email = db.Column(db.String(255), db.ForeignKey('USER.email'), primary_key=True)
    balance = db.Column(db.Numeric(10, 2), default=0.00)
    user = db.relationship('User', back_populates='customer')

    # Relationships
    trips = db.relationship('CustomerTrip', back_populates='customer')
    feedbacks = db.relationship('Feedback', back_populates='customer_feedback')  

class Support(db.Model):
    __tablename__ = 'SUPPORT'
    email = db.Column(db.String(255), db.ForeignKey('EMPLOYEE.email'), primary_key=True)
    employee = db.relationship('Employee', back_populates='support')
    
    # Relationships
    feedbacks = db.relationship('Feedback', back_populates='support_feedback')

class Bus(db.Model):
    __tablename__ = 'BUS'
    license_plate = db.Column(db.String(20), primary_key=True)
    model = db.Column(db.String(255))
    capacity = db.Column(db.Integer)
    
    # Updated relationship to use back_populates
    trips = db.relationship('Trip', back_populates='bus')

class Stop(db.Model):
    __tablename__ = 'STOP'
    name = db.Column(db.String(255), primary_key=True)
    longitude = db.Column(db.Float)
    latitude = db.Column(db.Float)
    
    # Relationships
    from_connections = db.relationship('StopConnection', 
                                       foreign_keys='StopConnection.from_stop',
                                       back_populates='from_stop_rel')
    to_connections = db.relationship('StopConnection',
                                     foreign_keys='StopConnection.to_stop',
                                     back_populates='to_stop_rel')
    included_in = db.relationship('Includes', back_populates='stop')

from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

class Trip(db.Model):
    __tablename__ = 'TRIP'
    
    trip_id = db.Column(db.Integer, primary_key=True)
    date_time = db.Column(db.String(25))
    current_capacity = db.Column(db.Integer)
    bus_license_plate = db.Column(db.String(20), ForeignKey('BUS.license_plate'))
    driver_email = db.Column(db.String(255), ForeignKey('DRIVER.email'))
    
    # Relationships - use back_populates instead of backref
    driver = relationship('Driver', back_populates='trips')
    bus = relationship('Bus', back_populates='trips')
    
    includes = db.relationship('Includes', back_populates='trip', cascade='all, delete-orphan')
    customer_trips = db.relationship('CustomerTrip', back_populates='trip')
    feedbacks = db.relationship('Feedback', back_populates='trip')


class Driver(db.Model):
    __tablename__ = 'DRIVER'
    
    email = db.Column(db.String(255), db.ForeignKey('EMPLOYEE.email'), primary_key=True)
    driver_license = db.Column(db.String(255))
    employee = db.relationship('Employee', back_populates='driver')
    
    # Relationships - use back_populates to match Trip model
    trips = db.relationship('Trip', back_populates='driver') # Ensure foreign_keys points to driver_email in Trip

    @property
    def user(self):
        return self.employee.user

class Includes(db.Model):
    __tablename__ = 'INCLUDES'
    trip_id = db.Column(db.Integer, db.ForeignKey('TRIP.trip_id'), primary_key=True)
    name = db.Column(db.String(255), db.ForeignKey('STOP.name'), primary_key=True)
    stop_order = db.Column(db.Integer)

    # Relationships
    trip = db.relationship('Trip', back_populates='includes')
    stop = db.relationship('Stop', back_populates='included_in')


class CustomerTrip(db.Model):
    __tablename__ = 'CUSTOMER_TRIP'
    customer_trip_id = db.Column(db.Integer, primary_key=True)
    cost = db.Column(db.Numeric(10, 2))
    refunded_credit = db.Column(db.Numeric(10, 2), default=0.00)
    trip_id = db.Column(db.Integer, db.ForeignKey('TRIP.trip_id'))
    start_position = db.Column(db.String(255), db.ForeignKey('STOP.name'))
    end_position = db.Column(db.String(255), db.ForeignKey('STOP.name'))
    customer_email = db.Column(db.String(255), db.ForeignKey('CUSTOMER.email'))
    
    # Relationships
    trip = db.relationship('Trip', back_populates='customer_trips')
    start_stop = db.relationship('Stop', foreign_keys=[start_position])
    end_stop = db.relationship('Stop', foreign_keys=[end_position])
    customer = db.relationship('Customer', back_populates='trips')

class Feedback(db.Model):
    __tablename__ = 'FEEDBACK'
    feedback_id = db.Column(db.Integer, primary_key=True)
    comment = db.Column(db.Text)
    response = db.Column(db.Text)
    trip_id = db.Column(db.Integer, db.ForeignKey('TRIP.trip_id'))
    support = db.Column(db.String(255), db.ForeignKey('SUPPORT.email'))
    customer = db.Column(db.String(255), db.ForeignKey('CUSTOMER.email'))
    
    # Relationships
    trip = db.relationship('Trip', back_populates='feedbacks')
    support_feedback = db.relationship('Support', back_populates='feedbacks', foreign_keys=[support])
    customer_feedback = db.relationship('Customer', back_populates='feedbacks', foreign_keys=[customer])

class StopConnection(db.Model):
    __tablename__ = 'STOP_CONNECTION'
    from_stop = db.Column(db.String(255), db.ForeignKey('STOP.name'), primary_key=True)
    to_stop = db.Column(db.String(255), db.ForeignKey('STOP.name'), primary_key=True)
    price = db.Column(db.Numeric(10, 2))
    
    # Relationships
    from_stop_rel = db.relationship('Stop', foreign_keys=[from_stop], back_populates='from_connections')
    to_stop_rel = db.relationship('Stop', foreign_keys=[to_stop], back_populates='to_connections')
