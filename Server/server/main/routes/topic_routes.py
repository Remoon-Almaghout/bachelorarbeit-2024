from flask import Blueprint, request, make_response, jsonify
from ..model.user import User
from ..service.topic_service import TopicService
from ..service.course_service import CourseService

topic_bp = Blueprint('topic', __name__, url_prefix="/topic")

@topic_bp.route('/get', methods=['GET'])
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
        topics = TopicService.get_topics(user_id)
        responseObject = {
                'status': 'success',
                'data': topics
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401

#    • This endpoint returns details of a single topic identified by its ID
#    • The completed field indicates whether the authenticated user has completed the topic.
@topic_bp.route('/get-one', methods=['GET'])
def get_one():
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
        topic = TopicService.get_one(topic_id, user_id)
        responseObject = {
                'status': 'success',
                'data': topic
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401


#    • This endpoint returns a list of topics associated with the specified course.
#    • The progress field indicates the number of completed topics out of the total number of topics.
#    • The completed field indicates whether all topics related to the course are completed, which triggers the completion of the course.

@topic_bp.route('/get-by-course', methods=['GET'])
def get_by_course():
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
        topics = TopicService.get_by_course(course_id, user_id)
        completed_topics_count = 0
        completed = False
        for topic in topics:
            if topic['completed']:
                completed_topics_count += 1      
        if completed_topics_count == len(topics):
            completed = True
        responseObject = {
                'status': 'success',
                'data': topics,
                'progress':f"{completed_topics_count}/{len(topics)}",
                "completed":completed
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401
        

@topic_bp.route('/get-related-topics', methods=['GET'])
def get_related_courses():
    topic_name = request.args.get('topic_name')

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
        topics = TopicService.get_related_topics(topic_name)
        responseObject = {
                'status': 'success',
                'data': topics
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401
    


#    • This endpoint returns a list of topics associated with the specified journey.
#    • The progress field indicates the number of completed topics out of the total number of topics.
#    • The completed field indicates whether all topics related to the course are completed, which triggers the completion of the course.

@topic_bp.route('/get-by-journey', methods=['GET'])
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
        topics = TopicService.get_by_journey(journey_id, user_id)
        responseObject = {
                'status': 'success',
                'data': topics,
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401

@topic_bp.route('/get-next-topic', methods=['GET'])
def get_next_topic():
    current_topic_id = request.args.get('current_topic_id')
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
        next_topic = TopicService.get_next_topic(current_topic_id, user_id)

        if next_topic is not None:
            responseObject = {
                'status': 'success',
                'data': next_topic
            }
            return make_response(jsonify(responseObject)), 200
        else:
            responseObject = {
                'status': 'success',
                'message': 'No next topic found.'
            }
            return make_response(jsonify(responseObject)), 200

    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.',
            'e':e
        }
        return make_response(jsonify(responseObject)), 401