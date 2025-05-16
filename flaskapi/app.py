from flask import Flask
from flask_cors import CORS
from db_config import db
from routes.user_routes import user_bp
from routes.customer_routes import customer_bp
from routes.trip_routes import trip_bp
from routes.stop_routes import stop_bp
import os
from flask_migrate import Migrate
from routes.stop_routes import stop_bp
from routes.feedback_routes import feedback_bp  

def create_app():
    app = Flask(__name__)
    CORS(app)  # Important for React Native integration
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'dev-fallback-key'
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or \
        'mysql+pymysql://root:1234@localhost/GuzelyurtCepte'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    migrate = Migrate(app, db)
    # Initialize database
    db.init_app(app)

    

  
    # Register blueprints
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(customer_bp, url_prefix='/api/customers')
    app.register_blueprint(trip_bp, url_prefix='/api/trips')
    app.register_blueprint(stop_bp, url_prefix='/api/stops')
    app.register_blueprint(feedback_bp, url_prefix='/api/feedback')
    
    return app

if __name__ == '__main__':
    app = create_app()
    print(app.url_map)
    app.run(debug=True)
    
