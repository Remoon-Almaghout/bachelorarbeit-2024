from flask import Blueprint, make_response, request, jsonify
from ..service.journey_service import JourneyService
from ..model.user import User
from ..service.user_service import UserService

user_bp = Blueprint('user', __name__, url_prefix="/user")

# Remoon
# This API allows users to enroll in a journey.
@user_bp.route('/enroll_in_journey', methods=['POST']) 
def enroll_user():
    bearer_token = request.headers.get('Authorization')
    token = bearer_token.split(" ")[1]
    user_id = None
    journey_id = request.json.get("journey_id")  

    try:
        user_id = User.decode_auth_token(token)
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': '401 Unauthorized.'
        }
        return make_response(jsonify(responseObject)), 401
    try:

        success = UserService.enroll_user_in_journey(user_id, journey_id)
        return success
        
    except Exception as ex:
        return jsonify({"message": "Internal Server Error"}), 500
    

# Remoon 
# This API retrieves the journeys that a user is enrolled in.   
@user_bp.route('/journeys', methods=['GET']) 
def get_enrolled_journeys():
    bearer_token = request.headers.get('Authorization')
    token = bearer_token.split(" ")[1]
    user_id = None
    try:
        user_id = User.decode_auth_token(token)
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': '401 Unauthorized.'
        }
        return make_response(jsonify(responseObject)), 401
    try:
        enrolled_journeys = UserService.get_enrolled_journeys(user_id)
        responseObject = {
                'status': 'success',
                'data': enrolled_journeys
            }
        return jsonify(responseObject), 200
    except Exception as ex:
        return jsonify({"message": "Internal Server Error"}), 500


# Remoon
# This API allows users to mark an OER as completed.
@user_bp.route('/complete_oer', methods=['POST']) 
def complete_oer():
    bearer_token = request.headers.get('Authorization')
    token = bearer_token.split(" ")[1]
    user_id = None
    oer_id = request.json.get("oer_id")  

    try:
        user_id = User.decode_auth_token(token)
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': '401 Unauthorized.'
        }
        return make_response(jsonify(responseObject)), 401
    try:
        success = UserService.user_complete_oer(user_id, oer_id)
        return success
       
    except Exception as ex:
        return jsonify({"message": "Internal Server Error", 'error':ex}), 500
    

# Remoon
    # this api for update user current site
@user_bp.route('/update-current-site', methods=['POST'])
def update_current_site():
    bearer_token = request.headers.get('Authorization')
    token = bearer_token.split(" ")[1]
    user_id = None

    try:
        user_id = User.decode_auth_token(token)
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': '401 Unauthorized.'
        }
        return make_response(jsonify(responseObject)), 401
    try:
        new_current_site = request.json.get('new_current_site')

        # Validate that user_id and new_current_site are provided
        if not user_id or not new_current_site:
            raise ValueError("Both user_id and new_current_site are required.")
        # Update the current_site attribute using the UserService
        UserService.update_current_site(user_id, new_current_site)

        return jsonify({'status': 'success', 'message': 'current_site updated successfully'}), 200

    except Exception as e:
        return jsonify({'status': 'fail', 'message': str(e)}), 400
    
@user_bp.route('/get-current-site', methods=['GET'])
def get_current_site():
    bearer_token = request.headers.get('Authorization')
    token = bearer_token.split(" ")[1]
    user_id = None

    try:
        user_id = User.decode_auth_token(token)
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': '401 Unauthorized.'
        }
        return make_response(jsonify(responseObject)), 401
    try:
        current_site = UserService.get_current_site(user_id)
        if current_site == None:
            return jsonify({'status':'success', 'current_site':1})
        return jsonify({'status': 'success', 'current_site': current_site}), 200

    except Exception as e:
        return jsonify({'status': 'fail', 'message': str(e)}), 400
    

# Remoon
    # this api for set last journey
@user_bp.route('/set-last-journey', methods=['POST'])
def set_last_journey():
    journey_id = request.json.get("journey_id")
    bearer_token = request.headers.get('Authorization')
    token = bearer_token.split(" ")[1]
    user_id = None

    try:
        user_id = User.decode_auth_token(token)
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': '401 Unauthorized.'
        }
        return make_response(jsonify(responseObject)), 401
    try:
        if not user_id or not journey_id:
            raise ValueError("Both user_id and journey_id are required.")
        UserService.set_last_journey(user_id, journey_id)

        return jsonify({'status': 'success', 'message': 'journey set successfully'}), 200

    except Exception as e:
        return jsonify({'status': 'fail', 'message': str(e)}), 400
    
@user_bp.route('/get-last-journey', methods=['GET'])
def get_last_journey():
    bearer_token = request.headers.get('Authorization')
    token = bearer_token.split(" ")[1]
    user_id = None

    try:
        user_id = User.decode_auth_token(token)
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': '401 Unauthorized.'
        }
        return make_response(jsonify(responseObject)), 401
    try:
        journey_id = UserService.get_last_journey(user_id)
        if journey_id == None:
            return jsonify({'message':'no journey set for user', 'journey_id':0})
        journey_details = JourneyService.get_one(journey_id, user_id)
        return jsonify({'status': 'success', 'journey_id': journey_details}), 200

    except Exception as e:
        return jsonify({'status': 'fail', 'message': str(e)}), 400
    


@user_bp.route('/get-user-id', methods=['GET'])
def get_user_id():
    bearer_token = request.headers.get('Authorization')
    token = bearer_token.split(" ")[1]
    user_id = None

    try:
        user_id = User.decode_auth_token(token)
        return jsonify({'status': 'success', 'user_id': user_id}), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': '401 Unauthorized.'
        }
        return make_response(jsonify(responseObject)), 401
   