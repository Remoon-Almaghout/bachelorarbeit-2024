from flask import Blueprint, request, make_response, jsonify
from ..model.user import User
from ..service.invite_service import InviteService
from ..service.session_sevice import SessionService

invite_bp = Blueprint('invite', __name__, url_prefix="/invite")

@invite_bp.route('/get', methods=['GET'])
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

        invites = InviteService.get_invites(user_id)
        responseObject = {
            'status': 'success',
            'data': invites
        }
        return make_response(jsonify(responseObject)), 200

    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401

@invite_bp.route('/create', methods=['POST'])
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

        body = request.json
        expertCategory = body['expert_category']
        sessionId = body['session_id']

        responseObject = InviteService.create_invite(user_id, expertCategory, sessionId)

        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401
    
@invite_bp.route('/update', methods=['POST'])
def update():
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

        body = request.json
        inviteId = body['invite_id']
        sessionId = body['session_id']
        status = body['status']

 
        responseObject = InviteService.update_invite(inviteId, status)
        SessionService.update_member_session(sessionId, user_id, status)


        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401