from datetime import datetime
from ..connector.neo4j_connector import neo4jConnector
from .course_service import CourseService
import logging

class JourneyService:

    def __init__(self):
        joruney = "journey"



    @staticmethod
    def get_journeys(user_id):
        results = neo4jConnector().find_all_journies()
        journeys = []

        for x in results:
            journey_id = x["ID"]
            try:
                courses = CourseService.get_by_journey(journey_id, user_id)
            except Exception as course_error:
                print(f"Error getting courses for journey {journey_id}: {course_error}")
                continue

            completed_courses_count = sum(course['completed'] for course in courses)
            completed = completed_courses_count == len(courses) and len(courses) > 0

           
            journeys.append({
                'ID': x["ID"],
                'title': x["title"],
                'industry': x["industry"],
                'description': x["description"],
                'progress': f"{completed_courses_count}/{len(courses)}",
                "completed":completed
            })

        return journeys


    @staticmethod
    def get_one(journey_id, user_id):
        results = neo4jConnector().find_journey_by_id(journey_id)
        result = results[0]["j"]
        completed_status = neo4jConnector().relation_exist(
            "User", "id", user_id,
            "complete",
            "Journey", "ID", journey_id
        )
        journey = {
            'ID': result["ID"], 
            'title': result["title"],
            'description': result["description"],
            'created_at': result["created_at"],
            'lang': result["language"],
            'completed': completed_status[0].get('Predicate', False) if completed_status else False

            }
       
        return journey