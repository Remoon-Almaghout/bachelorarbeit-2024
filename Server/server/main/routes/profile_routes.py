from flask import Blueprint, request, make_response, jsonify
from ..model.user import User
from ..service.profile_service import ProfileService

profile_bp = Blueprint('profile', __name__, url_prefix="/user-profile")

@profile_bp.route('/get', methods=['GET'])
def get():
    if request.method == 'GET':
        bearer_token = request.headers.get('Authorization')
        token = bearer_token.split(" ")[1]
        user_id = None

        # TODO: catch error
        # decode auth_token
        try:
            user_id = User.decode_auth_token(token)
        except Exception as e:
            responseObject = {
                'status': 'fail',
                'message': '401 Unauthorized.'
            }
            return make_response(jsonify(responseObject)), 401
        
        # get profile information and send it with response
        try:
            profile = ProfileService.get(user_id)
            responseObject = {
                'status': 'success',
                'data': profile 
            }
            return make_response(jsonify(responseObject)), 200
        except Exception as e:
            responseObject = {
                'status': 'fail',
                'message': 'Some error occurred. Please try again.'
            }
            return make_response(jsonify(responseObject)), 401

    else:
        responseObject = {
            'status': 'fail',
            'message': 'Error 405 Method Not Allowed'
        }
        return make_response(jsonify(responseObject)), 405


@profile_bp.route('/store', methods=['POST'])
def store():
    if request.method == 'POST':
        bearer_token = request.headers.get('Authorization')
        token = bearer_token.split(" ")[1]
        user_id = None
        data = request.json

        # TODO: catch error
        # decode auth_token
        try:
            user_id = User.decode_auth_token(token)
        except Exception as e:
            responseObject = {
                'status': 'fail',
                'message': '401 Unauthorized.'
            }
            return make_response(jsonify(responseObject)), 401

        # store profile information id db
        try:
            ProfileService.store(data, user_id)
            responseObject = {
                'status': 'success',
                'message': 'Changes have been successfully saved.',
            }
            return make_response(jsonify(responseObject)), 200
        except Exception as e:
            responseObject = {
                'status': 'fail',
                'message': 'Some error occurred. Please try again.'
            }
            return make_response(jsonify(responseObject)), 401
    else:
        responseObject = {
            'status': 'fail',
            'message': 'Error 405 Method Not Allowed.'
        }
        return make_response(jsonify(responseObject)), 405