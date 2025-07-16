from flask import Blueprint, request, make_response, jsonify
from ..service.recommendation_service import RecommendationService
from ..model.user import User

recommendation_bp = Blueprint('recommendation', __name__, url_prefix="/recommendation")

@recommendation_bp.route('/get', methods=['POST'])
def get():
    bearer_token = request.headers.get('Authorization')
    token = bearer_token.split(" ")[1]
    user_id = None
    data = request.json
    journey_id = data["journey_id"]
    journey_title = data["journey_title"]

    try:
        user_id = User.decode_auth_token(token)
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': '401 Unauthorized.'
        }
        return make_response(jsonify(responseObject)), 401

    try:
        RecommendationService.store_journey_history(user_id, journey_id, journey_title)

        recommendation = RecommendationService.get(user_id, journey_id)
        responseObject = {
                'status': 'success',
                'data': recommendation
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401

@recommendation_bp.route('/get-all-journies', methods=['GET'])
def get_journey():
    try:
        recommendation = RecommendationService.get_all()
        responseObject = {
                'status': 'success',
                'data': recommendation
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401
 
@recommendation_bp.route('/get-journey-history', methods=['GET'])
def get_journey_history():
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
        journey_history = RecommendationService.get_journey_history(user_id)
        responseObject = {
                'status': 'success',
                'data': journey_history
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401

@recommendation_bp.route('/get-industry-journies', methods=['GET'])
def get_industry_journies():
    industry = request.args.get('industry')

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
        journies = RecommendationService.get_industry_journies(industry)
        responseObject = {
                'status': 'success',
                'data': journies
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401