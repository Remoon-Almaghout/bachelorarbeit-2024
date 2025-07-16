from datetime import datetime
from ..connector.neo4j_connector import neo4jConnector
from .topic_service import TopicService
class CourseService:
    @staticmethod
    def get_one(course_id, user_id):
        results = neo4jConnector().find_course_by_id(course_id)
        result = results[0]["c"]
        completed_status = neo4jConnector().relation_exist(
            "User", "id", user_id,
            "complete",
            "Course", "ID", course_id
        )
        course = {
            'ID': result["ID"], 
            'title': result["title"],
            'description': result["description"],
            'created_at': result["created_at"],
            'lang': result["language"],
            'completed': completed_status[0].get('Predicate', False) if completed_status else False

            }
       
        return course

    @staticmethod
    def get_courses(user_id):
        results = neo4jConnector().find_all_courses()
        courses = []
        for x in results:
            course = x["c"]
            course_id = course["ID"]
            try:
                topics = TopicService.get_by_course(course_id, user_id)
            except Exception as topic_error:
                print(f"Error getting topics for course {course_id}: {topic_error}")
                continue
            completed_topics_count = sum(topic['completed'] for topic in topics)
            completed = completed_topics_count == len(topics) and len(topics) > 0
       
            courses.append(
                {
                'ID': course["ID"],
                'title': course["title"],
                'description': course["description"],
                'created_at': course["created_at"],
                'lang': course["language"],
                'education_content_length': course["education_content_length"],
                'level_of_detail': course["level_of_detail"],
                'hours_per_week': course["hours_per_week"],
                'number_of_weeks': course["number_of_weeks"],
                'completed': completed,
                'progress': f"{completed_topics_count}/{len(topics)}",

                })

        return courses

    @staticmethod
    def get_by_journey(journey_id, user_id):
        results = neo4jConnector().find_courses_of_journey(journey_id)
        all_courses_completed = True
        courses = []
        for x in results:
            found_node = x["found_node"]
            completed_status = neo4jConnector().relation_exist(
            "User", "id", user_id,
            "complete",
            "Course", "ID", found_node["ID"]
        )  
            course_details = {
                'ID': found_node["ID"], 
                'title': found_node["title"],
                'description': found_node["description"],
                'created_at': found_node["created_at"],
                'lang': found_node["language"],
                'education_content_length': found_node["education_content_length"],
                'level_of_detail': found_node["level_of_detail"],
                'hours_per_week': found_node["hours_per_week"],
                'number_of_weeks': found_node["number_of_weeks"],
                'completed': completed_status[0].get('Predicate', False) if completed_status else False

            }
            if not course_details['completed']:
                 all_courses_completed = False
            courses.append(course_details)
        # Check if the relation between user and Journey already exists
        relation_exists = neo4jConnector().relation_exist(
            "User", "id", user_id,
            "complete",
            "Journey", "ID", journey_id
        )
        relation_properties = {
                'created_at': datetime.now().strftime("%d-%m-%Y %H:%M:%S")
            }
        if relation_exists[0]['Predicate'] == False:
            # If all courses are completed, mark the Journey as completed
            if all_courses_completed:
                neo4jConnector().create_relation(
                    "User", "id", user_id,
                    "Journey", "ID", journey_id,
                    "r", "complete", relation_properties
                )
        return courses

    def get_related_courses(course_name):
        results = neo4jConnector().find_connected_courses(course_name)
        
        courses = []
        for x in results:
            found_node = x["found_node"]
            courses.append({'ID': found_node["ID"], 'title': found_node["title"],'description': found_node["description"] })

        return courses
    

