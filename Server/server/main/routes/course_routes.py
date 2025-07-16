from flask import Blueprint, make_response, request, jsonify

from ..model.user import User
from ..service.course_service import CourseService

course_bp = Blueprint('course', __name__, url_prefix="/course")

@course_bp.route('/get', methods=['GET'])
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
        courses = CourseService.get_courses(user_id)
        responseObject = {
                'status': 'success',
                'data': courses
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.',
            "e":e
        }
        return make_response(jsonify(responseObject)), 401

@course_bp.route('/get-related-courses', methods=['GET'])
def get_related_courses():
    course_name = request.args.get('course_name')

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
        courses = CourseService.get_related_courses(course_name)
        responseObject = {
                'status': 'success',
                'data': courses
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401

# Remoon
#    • This endpoint returns a list of courses belonging to a specific journey identified by its ID.
#    • The completed field indicates whether the authenticated user has completed the course.
@course_bp.route('/get-by-journey', methods=['GET'])
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
                'data': courses,
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

# Remoon
#    • This endpoint returns details of a single course identified by its ID.
#    • The completed field indicates whether the authenticated user has completed the course.
@course_bp.route('/get-one', methods=['GET'])
def get_one():
    course_id = request.args.get('course_id')
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
        course = CourseService.get_one(course_id, user_id)
        responseObject = {
                'status': 'success',
                'data': course
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401

