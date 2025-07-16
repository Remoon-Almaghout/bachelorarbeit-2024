from flask import Blueprint, request, make_response, jsonify
from ..model.user import User
from ..service.oer_service import OERService
from ..service.eductional_package_service import EducationalPackageService

oer_bp = Blueprint('oer', __name__, url_prefix="/oer")

# Remoon
# get all oers
@oer_bp.route('/get', methods=['GET'])
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
        oer = OERService.get_oers(user_id)
        responseObject = {
                'status': 'success',
                'data': oer
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
#    • This endpoint returns details of a single OER identified by its ID.
#    • The classification field provides information about the classification of the OER's URL.
#    • The completed field indicates whether the authenticated user has completed the OER.
@oer_bp.route('/get-one', methods=['GET'])
def get_one():
    oer_id = request.args.get('oer_id')
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
        oer = OERService.get_one(oer_id,user_id)
        # Classify the URL
        url_classification = classify_url(oer['url'])
        responseObject = {
                'status': 'success',
                'classification':url_classification,
                'data': oer
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401

# Remoon
#    • This endpoint returns a list of OERs associated with the specified educational package.
#    • Each OER in the response includes its details and classification based on its URL.
#    • The progress field indicates the number of completed OERs out of the total number of OERs in the package.
#    • The completed field indicates whether all OERs in the package are completed, which triggers the completion of the educational package.

@oer_bp.route('/get-by-educational-package', methods=['GET'])
def get_by_educational_package():
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
        oers = OERService.get_oers_by_educational_package(educational_package_id,user_id)
        # Classify the URL
        classified_oers = []
        completed_oers_count = 0
        completed = False

        for oer in oers:
            # Classify the URL for each OER
            url_classification = classify_url(oer['url'])
            if oer['completed']:
                completed_oers_count += 1
            classified_oer = {
                'oer': oer,
                'classification': url_classification
            }
            classified_oers.append(classified_oer)
        if completed_oers_count == len(oers):
            completed = True
        responseObject = {
            'status': 'success',
            'data': classified_oers,
            'progress':f"{completed_oers_count}/{len(oers)}",
            "completed":completed
        }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.',
        }
        return make_response(jsonify(responseObject)), 401


# get oers and education packages by topic id
@oer_bp.route('/get-and-educational-packages-by-topic', methods=['GET'])
def get_and_educational_packages_by_topic():
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
        # Get education packages
        educational_packages = EducationalPackageService.get_by_topic(topic_id, user_id)

        # Build response with OERs and progress for each educational package
        response_educational_packages = []

        for ep in educational_packages:
            # Get OERs for this educational package
            oers = OERService.get_oers_by_educational_package(ep['ID'], user_id)

            # Classify URLs for each OER
            classified_oers = []
            completed_oers_count = 0

            for oer in oers:
                url_classification = classify_url(oer['url'])
                if oer['completed']:
                    completed_oers_count += 1
                classified_oer = {
                    'oer': oer,
                    'classification': url_classification
                }
                classified_oers.append(classified_oer)

            # Calculate progress for this educational package
            progress = f"{completed_oers_count}/{len(oers)}"
            completed = completed_oers_count == len(oers) 

            # Include OERs and progress inside educational package
            response_educational_package = {
                'ID': ep['ID'],
                'completed': completed,
                'created_at': str(ep['created_at']),
                'description': ep['description'],
                'title': ep['title'],
                'oers': classified_oers,
                'progress': progress
            }

            response_educational_packages.append(response_educational_package)

        responseObject = {
            'status': 'success',
            'educational_packages': response_educational_packages,
            'completed': all(ep['completed'] for ep in response_educational_packages)
        }

        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.',
            'error': str(e)
        }
        return make_response(jsonify(responseObject)), 401

@oer_bp.route('/get-related-oers', methods=['GET'])
def get_related_oers():
    oer_name = request.args.get('oer_name')

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
        oers = OERService.get_related_oers(oer_name)
        responseObject = {
                'status': 'success',
                'data': oers
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401

# Remoon
    # classify for oer's url
def classify_url(url):
    if 'youtube.com' in url or 'youtu.be' in url:
        return 'Youtube'
    elif 'tiktok.com' in url:
        return 'Tiktok'
    elif url.endswith('.pdf'):
        return 'PDF'
    elif url.endswith('.mp4'):
        return 'Local Video'
    else:
        return 'Other'


# Add feedback for a specific OER 
@oer_bp.route('/add-feedback', methods=['POST'])
def add_feedback():
    oer_id = request.json.get('oer_id')
    text = request.json.get('text')
    rating = request.json.get('rating')
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
        if user_id is not None and isinstance(user_id, int):
            success = OERService.add_feedback(user_id, oer_id, text, rating)

            if success:
                responseObject = {
                    'status': 'success',
                    'message': 'Feedback added successfully.'
                }
                return make_response(jsonify(responseObject)), 200
            else:
                responseObject = {
                    'status': 'fail',
                    'message': 'Failed to add Feedback. Please try again.'
                }
                return make_response(jsonify(responseObject)), 500
        else:
            responseObject = {
                'status': 'fail',
                'message': 'Invalid user ID. Please try again.'
            }
            return make_response(jsonify(responseObject)), 401
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 500
    

# Get feedback and ratings for a specific OER (Open Educational Resource).
@oer_bp.route('/get-feedback', methods=['GET'])
def get_feedback():
    oer_id = request.args.get('oer_id')
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
        feedback_data = OERService.get_feedback(oer_id, user_id)

        responseObject = {
            'status': 'success',
            'data': feedback_data
        }
        return make_response(jsonify(responseObject)), 200

    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 500



# Edit a comment provided by a user for a specific OER.
@oer_bp.route('/edit-comment', methods=['POST'])
def edit_comment():
    try:
        oer_id = request.json.get('oer_id')
        new_text = request.json.get('new_text')
        new_rating = request.json.get('new_rating')
        feedback_id = request.json.get('feedback_id')
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

        success = OERService.edit_comment(user_id, oer_id, feedback_id, new_text, new_rating)

        if success:
            responseObject = {
                'status': 'success',
                'message': 'Comment edited successfully.'
            }
            return make_response(jsonify(responseObject)), 200
        else:
            responseObject = {
                'status': 'fail',
                'message': 'Failed to edit comment. Please try again.',
            }
            return make_response(jsonify(responseObject)), 500

    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.',
            'e':e
        }
        return make_response(jsonify(responseObject)), 500


# Get the most recent feedback for a specific OER
@oer_bp.route('/get-last-comment', methods=['GET'])
def get_last_comment():
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
        oer_id = request.args.get('oer_id')
        feedback_data = OERService.get_last_comment(oer_id, user_id)

        if feedback_data:
            responseObject = {
                'status': 'success',
                'data': feedback_data
            }
            return make_response(jsonify(responseObject)), 200
        else:
            responseObject = {
                'status': 'fail',
                'message': 'No feedback with comments found.'
            }
            return make_response(jsonify(responseObject)), 404

    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 500

    # get last rating for OER
@oer_bp.route('/get-last-rating', methods=['GET'])
def get_last_rating():
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
        oer_id = request.args.get('oer_id')
        feedback_data = OERService.get_last_rating(oer_id, user_id)

        if feedback_data:
            responseObject = {
                'status': 'success',
                'data': feedback_data
            }
            return make_response(jsonify(responseObject)), 200
        else:
            responseObject = {
                'status': 'fail',
                'message': 'No feedback with rating found.'
            }
            return make_response(jsonify(responseObject)), 404

    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 500

    # get OERs by journey_id
@oer_bp.route('/get-by-journey', methods=['GET'])
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
        oers = OERService.get_by_journey(journey_id, user_id)
        responseObject = {
                'status': 'success',
                'data': oers,
            }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 500