from datetime import datetime
from ..connector.mysql_connector import MySQLConnector
from ..connector.neo4j_connector import neo4jConnector
import uuid
import logging
class ProfileService:
    @staticmethod 
    def store(profile, user_id):     

        dbConnector = neo4jConnector()

        # delete all user courses
        dbConnector.delete_node_by_property('Profile_Courses', 'user_id', user_id)
    
        courses = profile["courses"]
        if(len(courses)):
            # insert user courses
            ProfileService.insert_courses(courses, user_id)
    
        # delete all user topics
        dbConnector.delete_node_by_property('Profile_Topic', 'user_id', user_id)

        topics = profile["topics"]
        if(len(topics)):
            # insert user topics
            ProfileService.insert_topics(topics, user_id)


        now = datetime.now().strftime("%d-%m-%Y %H:%M:%S")

        properties = {
            'name' : profile["name"],
            'date_of_birth': profile["dateOfBirth"],
            'country' : profile["country"],
            'city' : profile["city"],
            'company' : profile["company"],
            'biography' : profile['biography'],
            'graph_exploration_preference' : profile['graphExplorationPreference'],
            'number_of_weeks' : profile['numberOfWeeks'],
            'number_of_hours_per_week' : profile['hoursPerWeek'],
            'educational_content_length_preference' : profile['educationalContentLength'],
            'level_of_detail_preference' : profile['levelOfDetail'],
            'content_type_preference' : profile['contentType'],
            'more_than_one_topic' : profile['moreThanOneTopic'],
            'content_given_in_classroom' : profile['contentInClassroom'],
            'delivery_format_video' : profile['degreeVideo'],
            'delivery_format_book_chapter' : profile['degreeBookChapters'],
            'delivery_format_web_pages' : profile['degreeWebpages'],
            'delivery_format_slides' : profile['degreeSlides'],
            'delivery_format_papers' : profile['degreePapers'],
            'updated_at' : now
        }
        dbConnector.update_node("User", {"id" : user_id}, properties)

    @staticmethod
    def get(user_id):
        # get courses
        courses = ProfileService.get_courses(user_id)
        # get topics
        topics = ProfileService.get_topics(user_id)
        # get profile 
        profile = ProfileService.get_profile(user_id)

        profile["courses"] = courses
        profile["topics"] = topics

        return profile

    @staticmethod    
    def insert_topics(topics, user_id):

        # insert user topics
        dbConnector = neo4jConnector()

        for topic in topics:
            dbConnector.create_node("pt","Profile_Topic",{'user_id': user_id, 'id': topic['ID'], 'title' : str(topic['title'])})
            dbConnector.create_relation("User", "id", user_id, 'Profile_Topic', 'id', topic['ID'], 'hkit', 'has_knowledge_in_topic', {} )

    @staticmethod
    def insert_courses(courses, user_id):

        dbConnector = neo4jConnector()

        for course in courses:
            dbConnector.create_node("pc","Profile_Courses",{'user_id': user_id, 'id': course['ID'], 'title' : str(course['title'])})
            dbConnector.create_relation("User", "id", user_id, 'Profile_Courses', 'id', course['ID'], 'ac', 'attended_course', {} )

    @staticmethod 
    def get_courses(user_id):

        
        profile_courses = []
        results = neo4jConnector().find_user_courses(user_id)
        for x in results:
            result = x['pc']
            profile_course={
                'ID': result['id'],
                'title': result['title']
            }
            profile_courses.append(profile_course)

        return profile_courses


    @staticmethod 
    def get_topics(user_id):

        profile_topics = []
        results = neo4jConnector().find_user_topics(user_id)
        for x in results:
            result = x['pt']
            profile_topic={
                'ID': result['id'],
                'title': result['title']
            }
            profile_topics.append(profile_topic)

        return profile_topics


    @staticmethod 
    def get_profile(user_id):

        profiles =[]
        result = neo4jConnector().find_user(user_id)
        for x in result:
            profile = x['found_node']
            user_profile = {
                'user_id': profile['id'],
                'name' : profile['name'],
                'expert': profile['expert'],
                'date_of_birth': profile['date_of_birth'],
                'country': profile['country'],
                'city':profile['city'],
                'company':profile['company'],
                'biography':profile['biography'],
                'graph_exploration_preference':profile['graph_exploration_preference'],
                'number_of_weeks':profile['number_of_weeks'],
                'number_of_hours_per_week':profile['number_of_hours_per_week'],
                'educational_content_length_preference':profile['educational_content_length_preference'],
                'level_of_detail_preference':profile['level_of_detail_preference'],
                'content_type_preference':profile['content_type_preference'],
                'more_than_one_topic':profile['more_than_one_topic'],
                'content_given_in_classroom':profile['content_given_in_classroom'],
                'delivery_format_video':profile['delivery_format_video'],
                'delivery_format_book_chapter':profile['delivery_format_book_chapter'],
                'delivery_format_web_pages':profile['delivery_format_web_pages'],
                'delivery_format_slides':profile['delivery_format_slides'],
                'delivery_format_papers':profile['delivery_format_papers'],
                'updated_at':profile['updated_at']
            }
            profiles.append(user_profile)

        return profiles[0]
  

    
    @staticmethod 
    def get_user(user_id):
        dbConnector = neo4jConnector()
        results = dbConnector.find_user(user_id)
        result = results[0]["found_node"]
        node = {
            'name': result["name"],
            }
        return node
    
    @staticmethod
    def update_sid(user_id, sid):
        dbConnector = neo4jConnector()
        dbConnector.set_sid(user_id, sid)

        responseObject = {
            'status': 'success',
            'message': 'sid stored successfully',
        }
        return responseObject
    

    @staticmethod
    def get_experts_categories():
        dbConnector = neo4jConnector()
        results = dbConnector.find_expert_categories()

        categories = []
        for result in results:
            categories.append(result['category'])
        return categories
    

        


        

