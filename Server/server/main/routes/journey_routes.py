import logging
from flask import Blueprint, make_response, request, jsonify

from ..model.user import User
from ..service.journey_service import JourneyService 
from ..service.course_service import CourseService

journey_bp = Blueprint('journey', __name__, url_prefix="/journey")


# Remoon
@journey_bp.route('/get', methods=['GET'])
def get_journeys():
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
        journeys = JourneyService.get_journeys(user_id)        
        responseObject = {
            'status': 'success',
            'data': journeys
        }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.',
            'e':e
        }
        return make_response(jsonify(responseObject)), 401
   
# Remoon
#    • This endpoint returns details of a specific journey identified by its ID, including its completion status.
#    • The completed field indicates whether the authenticated user has completed the journey.
#    • The progress field indicates the completion progress of courses within the journey.
@journey_bp.route('/get-one', methods=['GET'])
def get_journey():
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
        journey = JourneyService.get_one(journey_id, user_id)
        courses = CourseService.get_by_journey(journey_id, user_id)
        completed_courses_count = 0
        completed = False
        for course in courses:
            if course['completed']:
                completed_courses_count += 1      
        if completed_courses_count == len(courses):
            completed = True
        responseObject = {
                'status': 'success',
                'data': journey,
                'progress':f"{completed_courses_count}/{len(courses)}",
                "completed":completed
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
            
        }
        return make_response(jsonify(responseObject)), 401