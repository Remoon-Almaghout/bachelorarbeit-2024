from flask import Blueprint, request, make_response, jsonify
from ..model.user import User
from ..service.session_sevice import SessionService

session_bp = Blueprint('session', __name__, url_prefix="/session")

@session_bp.route('/get', methods=['GET'])
def get():
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
        sessions = SessionService.get_sessions(user_id)
        responseObject = {
            'status': 'success',
            'data': sessions
        }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401

@session_bp.route('/create', methods=['POST'])
def create():
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
        result = SessionService.create_session(user_id)
        responseObject = {
            'status': 'success',
            'data': result
        }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401