from flask import Blueprint, request, make_response, jsonify
from ..model.user import User
from ..service.user_service import UserService
from ..service.validation_service import ValidationService


auth_bp = Blueprint('auth', __name__, url_prefix="/auth")

@auth_bp.route('/register', methods=['POST'])
def register():
    body  = request.json
    email = body['email']
    password = body['password']

    # check if email and password was sent in request
    if not email or not password:
        responseObject = {
            'status': 'error',
            'message': 'Please fill out all required fields.',
        }
        return make_response(jsonify(responseObject)), 401

    new_user = User(email, password)

    # check if user already exists
    if (UserService.user_exists(new_user.email)):
        responseObject = {
            'status': 'error',
            'message': 'User already exists. Please Log in.',
        }
        return make_response(jsonify(responseObject)), 400


    # validation
   # if (ValidationService.validate_password(new_user.password) is None or ValidationService.validate_email(new_user.email) is None):
    #    responseObject = {
    #        'status': 'error',
    #        'message': 'Please fill out all required fields.',
    #    }
    #    return make_response(jsonify(responseObject)), 400

    # create new user and send valid token in response
    try:
        UserService.create_user(new_user)
        auth_token = new_user.encode_auth_token()

        responseObject = {
            'status': 'success',
            'message': 'Successfully registered.',
            'auth_token': auth_token
        }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401


@auth_bp.route('/login', methods=['POST'])
def login():
    body  = request.json
    email = body['email']
    password = body['password']

    # check if email and password was sent in request
    if not email or not password:
        responseObject = {
            'status': 'error',
            'message': 'Invalid credentials',
        }
        return make_response(jsonify(responseObject)), 401

    # load user from db with matching email
    result = UserService.find_one_by_email(email)

    if(result is None):
        responseObject = {
            'status': 'error',
            'message': 'Invalid credentials',
        }
        return make_response(jsonify(responseObject)), 401
    
    # create user object
    user = User(email, password, result["id"], result["password_hash"].encode('utf-8'))

    # check if password matches
    if(user.check_password(password) is False):
        responseObject = {
            'status': 'error',
            'message': 'Invalid credentials',
        }
        return make_response(jsonify(responseObject)), 401

    # create valid token and send it in response
    try:
        auth_token = user.encode_auth_token()

        responseObject = {
            'status': 'success',
            'message': 'Successfully logged in.',
            'auth_token': auth_token
        }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401
    


