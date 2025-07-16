from flask import Blueprint, request, make_response, jsonify
from ..model.user import User
from ..service.relation_service import RelationService

relation_bp = Blueprint('relation', __name__, url_prefix="/relation")

@relation_bp.route('/get-all', methods=['GET'])
def get_all():
    source_type = request.args.get('source_type')
    source_id = request.args.get('source_id')
    target_type = request.args.get('target_type')
    target_id = request.args.get('target_id')
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
        relations = RelationService.get_all(source_type, source_id, target_type, target_id)
        responseObject = {
                'status': 'success',
                'data': relations
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401

@relation_bp.route('/get-node-information', methods=['GET'])
def get_node_information():
    source_type = request.args.get('source_type')
    source_id = request.args.get('source_id')
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
        node = RelationService.get_node_information(source_type, source_id)
        responseObject = {
                'status': 'success',
                'data': node
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401

@relation_bp.route('/get-expanded-node-information', methods=['GET'])
def get_expanded_node_information():
    node_id = request.args.get('node_id')
    node_type = request.args.get('node_type')
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
        result = RelationService.get_expanded_node_information(node_id, node_type)
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


