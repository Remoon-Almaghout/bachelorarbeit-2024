from flask import Blueprint, request, make_response, jsonify
from ..model.user import User
from ..service.file_service import FileService

file_bp = Blueprint('file', __name__, url_prefix="/file")

@file_bp.route('/get', methods=['GET'])
def get():

    try:

        fileId = request.args.get('fileId')
        return FileService.get_file(fileId)

    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401

@file_bp.route('/upload', methods=['POST'])
def upload():
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

        if 'image' in request.files:
            responseObject = FileService.store_image(user_id, request.files)
            return make_response(jsonify(responseObject)), 200
        
        if 'doc' in request.files:
            responseObject = FileService.store_docs(user_id, request.files)
            return make_response(jsonify(responseObject)), 200
        
        responseObject = {
            'status': 'fail',
            'message': 'No file found.'
        }
        return make_response(jsonify(responseObject)), 401

    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401