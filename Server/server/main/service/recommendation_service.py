from datetime import datetime
import requests as req
from ..connector.neo4j_connector import neo4jConnector
from ..service.profile_service import ProfileService
from ..config import Config
import logging
import json
class RecommendationService:
    @staticmethod
    def get(user_id, journey_id):


        profile = ProfileService.get(user_id)

        user_bk = ""

        for topic in profile["topics"]:
            user_bk = user_bk + "{'type':'T','ID':"  + str(topic["ID"]) + "},"

        for course in profile["courses"]:
            user_bk = user_bk + "{'type':'C','ID':"  + str(course["ID"]) + "},"

        user_bk = user_bk[:-1]

        url = Config.RECOMMENDATION_URL + "?user_id=" + str(profile["user_id"]) + "&user_lg=" + str(journey_id) + "&user_bk=" + str(user_bk) + "&user_t_w=" + str(profile["number_of_weeks"]) + "&user_t_h=" + str(profile["number_of_hours_per_week"]) + "&user_go=" + str(profile["graph_exploration_preference"]) 

        # response = req.get(url);

        # return response.json()
      #  with open( Config.ROOT_DIR+"\\sample_data\\recommendations2.json", encoding='utf-8', errors='ignore') as f:
        with open( Config.ROOT_DIR+"/sample_data/recommendations2.json", encoding='utf-8', errors='ignore') as f:
            contents = f.readlines()
        
        coursesNodes = json.loads(''.join(contents))

        return coursesNodes

    
    @staticmethod
    def get_all():
        results = neo4jConnector().find_all_journies()

        journies = []
        for x in results:
           journies.append({'ID': x["ID"], 'title': x["title"], 'industry': x["industry"],  'description': x["description"]})

        return journies

    @staticmethod
    def store_journey_history(user_id, journey_id, journey_title):

        dbConnector = neo4jConnector()

        result = dbConnector.find_journey_history_by_id(user_id, journey_id)
        now = datetime.now().strftime("%d-%m-%Y %H:%M:%S")

        if len(result) > 0:
            updated_at = now
            dbConnector.update_node("Journey_History",{"user_id":user_id, 'journey_id': journey_id},{'updated_at': updated_at})
        else:
            created_at = now
            updated_at = now
            dbConnector.create_node('jh','Journey_History',{'user_id': user_id, 'journey_id': journey_id, 'journey_title': journey_title, 'created_at': created_at, 'updated_at': updated_at})

    @staticmethod
    def get_journey_history(user_id):

        dbConnector = neo4jConnector()
        result = dbConnector.find_journey_history(user_id)

        journies_histories = []
        for x in result:
            journey_history = x['jh']
            journies_histories.append({
                'id' : journey_history.id,
                'journey_id': journey_history['journey_id'],
                'journey_title': journey_history['journey_title']
                
            })

        return journies_histories
        

    @staticmethod
    def get_industry_journies(industry):
        results = neo4jConnector().find_journies_by_industry(industry)

        journies = []
        for x in results:
            journies.append({'ID': x["ID"], 'title': x["title"], 'industry': x["industry"],  'description': x["description"]})

        return journies
