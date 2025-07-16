from flask import Blueprint, request, make_response, jsonify
from ..model.user import User
from ..service.eductional_package_service import EducationalPackageService

educational_package_bp = Blueprint('educational-package', __name__, url_prefix="/educational-package")

# Remoon
#     • This endpoint returns details of a single educational package identified by its ID.
#     • The completed field indicates whether the authenticated user has completed the educational package.
@educational_package_bp.route('/get-one', methods=['GET'])
def get_one():
    educational_package_id = request.args.get('educational_package_id')
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
        educational_package = EducationalPackageService.get_one(educational_package_id, user_id)
        responseObject = {
                'status': 'success',
                'data': educational_package
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401

# Remoon
#    • This endpoint returns a list of educational packages associated with the specified topic.
#    • The progress field indicates the number of completed educational packages out of the total number of packages.
#    • The completed field indicates whether all educational packages related to the topic are completed, which triggers the completion of the topic.
@educational_package_bp.route('/get-by-topic', methods=['GET'])
def get_by_topic():
    topic_id = request.args.get('topic_id')
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
        educational_packages = EducationalPackageService.get_by_topic(topic_id, user_id)
        completed_ep_count = 0
        completed = False
        for ep in educational_packages:
            if ep['completed']:
                completed_ep_count += 1      
        if completed_ep_count == len(educational_packages):
            completed = True    
        responseObject = {
                'status': 'success',
                'data': educational_packages,
                'progress':f"{completed_ep_count}/{len(educational_packages)}",
                "completed":completed
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401

@educational_package_bp.route('/get-related-educational-packages', methods=['GET'])
def get_related_educational_packages():
    educational_package_name = request.args.get('educational_package_name')

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
        educational_packages = EducationalPackageService.get_related_educational_packages(educational_package_name)
        responseObject = {
                'status': 'success',
                'data': educational_packages
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401

# Remoon
# get all education packages
@educational_package_bp.route('/get', methods=['GET'])
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
        eps = EducationalPackageService.get_education_packages(user_id)
        responseObject = {
                'status': 'success',
                'data': eps
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401
    

# Remoon
    # get Education Packages by joureny_id
@educational_package_bp.route('/get-by-journey', methods=['GET'])
def get_by_journey():
    journey_id = request.args.get('journey_id')
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
        eps = EducationalPackageService.get_by_journey(journey_id, user_id)
        responseObject = {
                'status': 'success',
                'data': eps,
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 500