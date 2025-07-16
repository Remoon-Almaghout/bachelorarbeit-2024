import uuid
from datetime import datetime
from ..connector.neo4j_connector import neo4jConnector
from ..service.profile_service import ProfileService
import logging

class MessageService:
    @staticmethod
    def get_messages(user_id,session_id):
        results = neo4jConnector().find_messages(session_id)

        try:

            messages = []
            for x in results:
                message = x["m"]
                user = x["u"]
                file = x["f"] if x["f"] else None
                messageBody = { 
                    'id': message["id"], 
                    'type': message["type"],
                    'content': message["content"] ,
                    'user': 'me' if message["user_id"] == user_id else 'bot' if  message["user_id"] == 9003 else "user" ,
                    'user_name' : user["name"],
                    'created_at':  datetime.strptime(message["created_at"] , '%d-%m-%Y %H:%M:%S').strftime("%H:%M %p"),
                    'options': message["options"] if message["options"]  else [] ,
                    }
                if file :
                    messageBody['file_info'] = {
                        'name': file['real_name'].replace('\\',''),
                        'type' : file['type'],
                        'created_at': file['created_at']
                    }
                messages.append(messageBody)
        except Exception as ex:
            logging.error(ex)


        return messages

    @staticmethod
    def get_bot_messages(user_id,session_id):
        results = neo4jConnector().find_bot_messages(session_id)

        try:

            messages = []
            for x in results:
                message = x["m"]
                user = x["u"]
                file = x["f"] if x["f"] else None
                messageBody = { 
                    'id': message["id"], 
                    'type': message["type"],
                    'content': message["content"] ,
                    'user': 'me' if message["user_id"] == user_id else 'bot' if  message["user_id"] == 9003 else "user" ,
                    'user_name' : user["name"],
                    'created_at':  datetime.strptime(message["created_at"] , '%d-%m-%Y %H:%M:%S').strftime("%H:%M %p"),
                    'options': message["options"] if message["options"]  else [] ,
                    }
                if file :
                    messageBody['file_info'] = {
                        'name': file['real_name'].replace('\\',''),
                        'type' : file['type'],
                        'created_at': file['created_at']
                    }
                messages.append(messageBody)
        except Exception as ex:
            logging.error(ex)


        return messages
    
    @staticmethod
    def create_message(user_id, session_id, message_text, type):


        created_at = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
        message_id = str(uuid.uuid4())
        
        dbConnector = neo4jConnector()
        result = {}
        if type == 'invite' :
            categories = ProfileService.get_experts_categories()
            dbConnector.create_node("m","Message",{'id': message_id, 'created_at':created_at,'embedding': [1,2] , 'type': type, 'content' : message_text , 'created_at':created_at, 'user_id':user_id, 'options':categories})
            dbConnector.create_relation("User", "id", user_id, 'Message', 'id', '\''+message_id+'\'', 'cm', 'created_message', {} )
            dbConnector.create_relation("Session", "id", '\''+session_id+'\'', 'Message', 'id', '\''+message_id+'\'', 'hm', 'has_message', {} )
            result = { 'status' : 'success', 'message' : 'message has been successfully sent', 'message_id' : message_id, 'options':categories}
        elif type == 'image' or type == 'doc' :
            fileId = message_text.split('=')[1]
            dbConnector.create_node("m","Message",{'id': message_id, 'created_at':created_at,'embedding': [1,2] , 'type': type, 'content' : message_text , 'created_at':created_at, 'user_id':user_id})
            dbConnector.create_relation("Message", "id", '\''+message_id+'\'', 'File', 'id', '\''+fileId+'\'', 'fi', 'file_info', {} )
            dbConnector.create_relation("User", "id", user_id, 'Message', 'id', '\''+message_id+'\'', 'cm', 'created_message', {} )
            dbConnector.create_relation("Session", "id", '\''+session_id+'\'', 'Message', 'id', '\''+message_id+'\'', 'hm', 'has_message', {} )
            result = { 'status' : 'success', 'message' : 'message has been successfully sent', 'message_id' : message_id}
        else :
            dbConnector.create_node("m","Message",{'id': message_id, 'created_at':created_at,'embedding': [1,2] , 'type': type, 'content' : message_text , 'created_at':created_at, 'user_id':user_id})
            dbConnector.create_relation("User", "id", user_id, 'Message', 'id', '\''+message_id+'\'', 'cm', 'created_message', {} )
            dbConnector.create_relation("Session", "id", '\''+session_id+'\'', 'Message', 'id', '\''+message_id+'\'', 'hm', 'has_message', {} )
            result = { 'status' : 'success', 'message' : 'message has been successfully sent', 'message_id' : message_id}
        return result
