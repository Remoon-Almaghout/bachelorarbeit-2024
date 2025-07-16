from datetime import datetime
from ..connector.neo4j_connector import neo4jConnector
from .eductional_package_service import EducationalPackageService
class TopicService:
    @staticmethod
    def get_one(topic_id, user_id):
        results = neo4jConnector().find_topic_by_id(topic_id)
        result = results[0]["t"]
        completed_status = neo4jConnector().relation_exist(
            "User", "id", user_id,
            "complete",
            "Topic", "ID", topic_id
        )
        topic = {
            'ID': result["ID"], 
            'title': result["title"],
            'description': result["description"],
            'created_at': result["created_at"],
            'lang': result["language"],
            'completed': completed_status[0].get('Predicate', False) if completed_status else False

            }
       
        return topic

    @staticmethod
    def get_topics(user_id):
        results = neo4jConnector().find_all_topics()
        topics = []
        for x in results:
            topic = x['t']
            topic_id = topic["ID"]
            try:
                eps = EducationalPackageService.get_by_topic(topic_id, user_id)
            except Exception as ep_error:
                print(f"Error getting education packages for topic {topic_id}: {ep_error}")
                continue
            completed_eps_count = sum(ep['completed'] for ep in eps)
            completed = completed_eps_count == len(eps) and len(eps) > 0
            topics.append({
                'ID': topic["ID"],
                'title': topic["title"],
                'description': topic["description"],
                'created_at': topic["created_at"],
                'lang': topic["language"],
                'completed': completed,
                'progress': f"{completed_eps_count}/{len(eps)}",
                })

        return topics

    @staticmethod
    def get_by_course(course_id, user_id):
        results = neo4jConnector().find_topics_of_course(course_id)
        all_topics_completed = True
        topics = []
        for x in results:
            found_node = x["found_node"]
            completed_status = neo4jConnector().relation_exist(
            "User", "id", user_id,
            "complete",
            "Topic", "ID", found_node["ID"]
        )  
            topic_details = {
                'ID': found_node["ID"], 
                'title': found_node["title"],
                'description': found_node["description"],
                'created_at': found_node["created_at"],
                'lang': found_node["language"],
                'completed': completed_status[0].get('Predicate', False) if completed_status else False

            }
            if not topic_details['completed']:
                 all_topics_completed = False
            topics.append(topic_details)
        # Check if the relation between user and Course already exists
        relation_exists = neo4jConnector().relation_exist(
            "User", "id", user_id,
            "complete",
            "Course", "ID", course_id
        )
        relation_properties = {
                'created_at': datetime.now().strftime("%d-%m-%Y %H:%M:%S")
            }
        if relation_exists[0]['Predicate'] == False:
            # If all topics are completed, mark the Course as completed
            if all_topics_completed:
                neo4jConnector().create_relation(
                    "User", "id", user_id,
                    "Course", "ID", course_id,
                    "r", "complete", relation_properties
                )
        return topics

    def get_related_topics(topic_name):
        results = neo4jConnector().find_connected_topics(topic_name)
        
        topics = []
        for x in results:
            found_node = x["found_node"]
            topics.append({'ID': found_node["ID"], 'title': found_node["title"],'description': found_node["description"] })

        return topics

    @staticmethod
    def get_by_journey(journey_id, user_id):
        results = neo4jConnector().find_topics_of_journey(journey_id)
        topics = []

        for x in results:
            found_node = x["found_node"]
            completed_status = neo4jConnector().relation_exist(
                "User", "id", user_id,
                "complete",
                "Topic", "ID", found_node["ID"]
            )  

            topic_details = {
                'ID': found_node["ID"], 
                'title': found_node["title"],
                'description': found_node["description"],
                'created_at': found_node["created_at"],
                'lang': found_node["language"],
                'completed': completed_status[0].get('Predicate', False) if completed_status else False
            }

            topics.append(topic_details)

        
        return topics


    @staticmethod
    def get_next_topic(current_topic_id, user_id):
        # Find the course ID of the current topic
        course_id = neo4jConnector().find_course_of_topic(current_topic_id)
        course_id = course_id
        
        # Find all topics of the course
        topics = neo4jConnector().find_topics_of_course(course_id)
        next_topic_id = int(current_topic_id) + 1

        # Find the index of the current topic
        if any(topic["found_node"]["ID"] == next_topic_id for topic in topics):
            next_topic = next((topic["found_node"] for topic in topics if topic["found_node"]["ID"] == next_topic_id), None)
            if next_topic:
                return {
                    'course_id':course_id,
                    'ID': next_topic["ID"],
                    'title': next_topic["title"],
                    'description': next_topic["description"],
                    'created_at': next_topic["created_at"],
                    'lang': next_topic["language"],
                    'completed': neo4jConnector().relation_exist(
                        "User", "id", user_id,
                        "complete",
                        "Topic", "ID", next_topic["ID"]
                    )[0].get('Predicate', False)
                }
        else:
            # No next topic found
            return None
        
