from ..connector.neo4j_connector import neo4jConnector
from datetime import datetime
import uuid


class StatisticService:
    @staticmethod
    def store_statistic(user_id, message_text, clarified_message, classification, answer, process_time):

        created_at = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
        statistic_id = str(uuid.uuid4())
        
        dbConnector = neo4jConnector()
    
        dbConnector.create_node("m","Statistic",{'id': statistic_id, 'message_text':message_text,'clarified_message': clarified_message , 'answer': answer, 'process_time' : process_time , 'classification':classification, 'created_at':created_at})
        dbConnector.create_relation("User", "id", user_id, 'Statistic', 'id', '\''+statistic_id+'\'', 'cs', 'created_statistic', {} )
        result = { 'status' : 'success', 'message' : 'statistic has been successfully stored'}
        
        return result

