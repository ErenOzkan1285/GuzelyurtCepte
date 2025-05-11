from flask import Blueprint, request, jsonify
from db_config import db
from models.models import Feedback, User, Trip

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('/', methods=['GET'])
def get_feedbacks():
    try:
        feedbacks = Feedback.query.all()

        feedback_list = []
        for fb in feedbacks:
            customer_user = fb.customer_feedback.user if fb.customer_feedback else None
            support_user = fb.support_feedback.employee.user if fb.support_feedback and fb.support_feedback.employee else None
          
            feedback_list.append({
            'feedback_id': fb.feedback_id,
            'comment' : fb.comment,
            'response': fb.response,
            'trip_id':  fb.trip_id,
            'support' : {
                'email': support_user.email,
                'name' : support_user.name,
                'sname': support_user.sname,
                        }if support_user else None,
            'customer':{
                'email': customer_user.email,
                'name' : customer_user.name,
                'sname': customer_user.sname,
                      }if customer_user else None, 
})

        return jsonify(feedback_list), 200
    
    except Exception as e:
        print("Error:", e)
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/<int:feedback_id>', methods=['PATCH'])
def update_feedback(feedback_id):
    try:
        data = request.get_json()
        response_text = data.get('response')
        support_email = data.get('support')  

        if not response_text:
            return jsonify({'error': 'Missing response text'}), 400

        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404

        feedback.response = response_text
        if support_email:
            feedback.support = support_email  

        db.session.commit()

        return jsonify({'message': 'Feedback updated with response'}), 200

    except Exception as e:
        db.session.rollback()
        print("Error while patching feedback:", e)
        return jsonify({'error': str(e)}), 500