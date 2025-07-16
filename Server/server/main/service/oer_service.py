from ..connector.neo4j_connector import neo4jConnector
from flask import make_response, jsonify
from datetime import datetime
import logging

class OERService:
    @staticmethod
    def get_one(oer_id,user_id):

        results = neo4jConnector().find_oer_by_id(oer_id)
        result = results[0]["o"]
        completed_status = neo4jConnector().relation_exist(
            "User", "id", user_id,
            "complete",
            "OER", "ID", oer_id
        )
        oer = {
            'ID': result["ID"], 
            'title': result["title"],
            'description': result["description"],
            'created_at': result["created_at"],
            'url': result["url"],
            'completed': completed_status[0].get('Predicate', False) if completed_status else False

            }
    

        return oer

    @staticmethod
    def get_oers_by_educational_package(educational_package_id,user_id):
        results = neo4jConnector().find_oers_by_educational_package(educational_package_id)
        all_oers_completed = True 
        oers = []
        for x in results:
            found_node = x["found_node"]
            completed_status = neo4jConnector().relation_exist(
            "User", "id", user_id,
            "complete",
            "OER", "ID", found_node["ID"]
        )   
            oer_details = {
            'ID': found_node["ID"],
            'title': found_node["title"],
            'description': found_node["description"],
            'created_at': found_node["created_at"],
            'url': found_node["url"],
            'completed': completed_status[0].get('Predicate', False) if completed_status else False
        }
            if not oer_details['completed']:
                 all_oers_completed = False
            
            oers.append(oer_details)

        # Check if the relation between user and educational package already exists
        relation_exists = neo4jConnector().relation_exist(
            "User", "id", user_id,
            "complete",
            "Educational_Package", "ID", educational_package_id
        )
        relation_properties = {
                'created_at': datetime.now().strftime("%d-%m-%Y %H:%M:%S")
            }
        if relation_exists[0]['Predicate'] == False:
            # If all OERs are completed, mark the educational package as completed
            if all_oers_completed:
                neo4jConnector().create_relation(
                    "User", "id", user_id,
                    "Educational_Package", "ID", educational_package_id,
                    "r", "complete", relation_properties
                )
        return oers
    
    def get_related_oers(oer_name):
        results = neo4jConnector().find_connected_oers(oer_name)
        
        oers = []
        for x in results:
            found_node = x["found_node"]
            oers.append({
                'ID': found_node["ID"],
                'title': found_node["title"],
                'description': found_node["description"],
                'url': found_node["url"]
                })

        return oers

    @staticmethod
    def get_oers(user_id):
        results = neo4jConnector().find_all_oers()
        oers = []
        for x in results:
            oer = x['o']
            oer_id = oer["ID"]
            url_classification = classify_url(oer['url'])
            completed_status = neo4jConnector().relation_exist(
            "User", "id", user_id,
            "complete",
            "OER", "ID", oer_id
        )
            oers.append({
                'ID': oer["ID"], 
                'title': oer["title"],
                'description': oer["description"],
                'created_at': oer["created_at"],
                'url': oer["url"],
                "url_classification":url_classification,
                'completed': completed_status[0].get('Predicate', False) if completed_status else False

                })

        return oers
    @staticmethod
    def add_feedback(user_id, oer_id, text, rating):
        max_feedback_id_query = "MATCH (f:Feedback) RETURN COALESCE(MAX(f.ID), 0) AS max_id"
        result = neo4jConnector().run_Cypher_query(max_feedback_id_query)
        max_id = result[0]["max_id"]
        try:
            feedback_properties = {
                'ID': max_id + 1,
                'user_id': user_id, 
                'oer_id': oer_id,
                'created_at': datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
                'updated_at': datetime.now().strftime("%d-%m-%Y %H:%M:%S")
            }
            # Add text if it's provided
            if text:
                feedback_properties['text'] = text

            # Add rating if it's provided
            if rating:
                feedback_properties['rating'] = rating
            
            # Create Feedback node
            neo4jConnector().create_node('f', 'Feedback', feedback_properties)

            # Use the generic create_relation method to establish the relationship
            relation_properties = {
                'created_at': datetime.now().strftime("%d-%m-%Y %H:%M:%S")
            }

            # Create relation between Feedback and OER
            neo4jConnector().create_relation(
                "OER", "ID", oer_id,
                "Feedback",'ID',feedback_properties['ID'],
                "r", "has_feedback", relation_properties
            )
            
            return True  

        except Exception as ex:
            logging.error(ex)
            return False
        
    @staticmethod
    def get_feedback(oer_id, user_id):
        # Query to get comments and ratings for a specific OER
        query = f"""
        MATCH (oer:OER)-[:has_feedback]->(feedback:Feedback)
        WHERE oer.ID = {oer_id} AND feedback.user_id = {user_id}
        RETURN feedback.ID as id, feedback.text AS comment, feedback.user_id AS user_id, feedback.created_at AS timestamp, feedback.rating AS rating
        """

        # Execute the query and process the results
        results = neo4jConnector().run_Cypher_query(query)
        # Convert the results to a list before processing
        results_list = list(results)
        # Process the results and calculate average rating and count
        comments = []
        total_ratings = 0
        num_ratings = 0

        for result in results_list:
            comment_id = result['id']
            comment = result['comment']
            user_id = result['user_id']
            timestamp = result['timestamp']
            rating_str = result['rating']

            if comment:
                comments.append({
                    'ID':comment_id,
                    'comment': comment,
                    'user_id': user_id,
                    'timestamp': timestamp
                })

            if rating_str is not None:
                # Convert the rating to an integer
                rating = int(rating_str)
                total_ratings += rating
                num_ratings += 1

        # Calculate average rating
        average_rating = total_ratings / num_ratings if num_ratings > 0 else None

        return {
            'comments': comments,
            'average_rating': average_rating,
            'num_ratings': num_ratings
        }
    

    @staticmethod
    def edit_comment(user_id, oer_id, feedback_id, new_text, new_rating):
        try:
            # Check if the user has provided feedback for the given OER
            existing_feedback_query = f"MATCH (o:OER)-[:has_feedback]->(f:Feedback) WHERE f.user_id = {user_id} AND o.ID = {oer_id} RETURN f.ID AS feedback_id"
            existing_feedback_result = neo4jConnector().run_Cypher_query(existing_feedback_query)
            existing_feedback_data = list(existing_feedback_result)

            if existing_feedback_data:
                # User has provided feedback, update the comment
                update_comment_query = f"""
                    MATCH (f:Feedback) WHERE f.ID = {feedback_id}
                    SET f.text = '{new_text}', f.rating = '{new_rating}', f.updated_at = '{datetime.now().strftime("%d-%m-%Y %H:%M:%S")}'
                """
                neo4jConnector().run_Cypher_query(update_comment_query)
                return True
            else:
                # User has not provided feedback for the OER
                return False

        except Exception as ex:
            logging.error(ex)
            return False


    @staticmethod
    def get_last_comment(oer_id, user_id):
        try:
            query = f"""
            MATCH (oer:OER)-[:has_feedback]->(feedback:Feedback)
            WHERE oer.ID = {oer_id} AND feedback.user_id = {user_id} AND EXISTS(feedback.text)
            RETURN feedback.text AS comment, feedback.user_id AS user_id, feedback.created_at AS timestamp, feedback.rating AS rating, feedback.ID as id
            ORDER BY feedback.created_at DESC
            LIMIT 1
            """
            result = neo4jConnector().run_Cypher_query(query)
            feedback_data = list(result)

            if feedback_data:
                return {
                    'feedback_id':feedback_data[0]['id'],
                    'comment': feedback_data[0]['comment'],
                    'user_id': feedback_data[0]['user_id'],
                    'timestamp': feedback_data[0]['timestamp'],
                    'rating': feedback_data[0]['rating']
                }
            else:
                return None

        except Exception as ex:
            logging.error(ex)
            return None
    
    @staticmethod
    def get_last_rating(oer_id, user_id):
        try:
            query = f"""
            MATCH (oer:OER)-[:has_feedback]->(feedback:Feedback)
            WHERE oer.ID = {oer_id} AND feedback.user_id = {user_id} AND EXISTS(feedback.rating)
            RETURN feedback.text AS comment, feedback.user_id AS user_id, feedback.created_at AS timestamp, feedback.rating AS rating, feedback.ID as id
            ORDER BY feedback.created_at DESC
            LIMIT 1
            """
            result = neo4jConnector().run_Cypher_query(query)
            feedback_data = list(result)

            if feedback_data:
                return {
                    'feedback_id':feedback_data[0]['id'],
                    'comment': feedback_data[0]['comment'],
                    'user_id': feedback_data[0]['user_id'],
                    'timestamp': feedback_data[0]['timestamp'],
                    'rating': feedback_data[0]['rating']
                }
            else:
                return None

        except Exception as ex:
            logging.error(ex)
            return None
        
    
    @staticmethod
    def get_by_journey(journey_id, user_id):
        results = neo4jConnector().find_oers_of_journey(journey_id)
        oers = []

        for x in results:
            found_node = x["found_node"]
            url_classification = classify_url(found_node['url'])
            completed_status = neo4jConnector().relation_exist(
                "User", "id", user_id,
                "complete",
                "OER", "ID", found_node["ID"]
            )  

            oer_details = {
                'ID': found_node["ID"], 
                'title': found_node["title"],
                'description': found_node["description"],
                'created_at': found_node["created_at"],
                'url': found_node["url"],
                "url_classification":url_classification,
                'completed': completed_status[0].get('Predicate', False) if completed_status else False

            }

            oers.append(oer_details)

        
        return oers

# Remoon
    # classify for oer's url
def classify_url(url):
    if 'youtube.com' in url or 'youtu.be' in url:
        return 'Youtube'
    elif 'tiktok.com' in url:
        return 'Tiktok'
    elif url.endswith('.pdf'):
        return 'PDF'
    elif url.endswith('test.pdf'):
        return 'PDF Test'
    elif url.endswith('.mp4'):
        return 'Local Video'
    else:
        return 'Other'
