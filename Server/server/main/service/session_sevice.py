import uuid
from datetime import datetime
from ..connector.neo4j_connector import neo4jConnector


class SessionService:
    @staticmethod
    def get_sessions(user_id):
        results = neo4jConnector().find_sessions(user_id)

        sessions = []
        for x in results:
            session = x["s"]
            last_messages = x["m"]
            users_messages = x["mu"]
            last_message = last_messages[0] if len(last_messages) > 0 else ''
            user_message = users_messages[0] if len(users_messages) > 0 else ''
            sessions.append({ 
                'id': session["id"], 
                'last_message': last_message["content"] if last_message else "",
                'last_message_type': last_message["type"] if last_message else "",
                'last_message_created_at': datetime.strptime(last_message["created_at"] , '%d-%m-%Y %H:%M:%S').strftime("%d-%m-%Y %H:%M %p") if last_message else "",
                'last_message_user_name':  user_message["name"] if user_message else "",
                })

        return sessions

    @staticmethod
    def get_session_by_id(user_id, session_id):
        results = neo4jConnector().find_session_by_id(session_id)

        sessions = []
        for x in results:
            session = x["s"]
            last_messages = x["m"]
            users_messages = x["mu"]
            last_message = last_messages[0] if len(last_messages) > 0 else ''
            user_message = users_messages[0] if len(users_messages) > 0 else ''
            sessions.append({ 
                'id': session["id"], 
                'own_session': True if session['creator'] == user_id else False,
                'last_message': last_message["content"] if last_message else "",
                'last_message_type': last_message["type"] if last_message else "",
                'last_message_created_at': datetime.strptime(last_message["created_at"] , '%d-%m-%Y %H:%M:%S').strftime("%d-%m-%Y %H:%M %p") if last_message else "",
                'last_message_user_name':  user_message["name"] if user_message else "",
                })

        return sessions
    
    @staticmethod
    def get_members(user_id, session_id):
        results = neo4jConnector().find_members(session_id)

        membersArray = []
        for x in results:
            if isinstance(x["u"], list):
                members = x["u"]
                for member in members:
                    membersArray.append({ 
                        'sid': member["sid"], 
                        })
            else:
                member = x["u"]
                if member != None:
                    membersArray.append({ 
                        'sid': member["sid"], 
                        })
                
            creator = x["c"]
            membersArray.append({ 
                'sid': creator["sid"], 
                })

        return membersArray
    

    @staticmethod
    def create_session(user_id):


        session_id = str(uuid.uuid4())

        created_at = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
        dbConnector = neo4jConnector()
        dbConnector.create_node("s","Session",{'id': session_id, 'creator' : user_id, 'created_at':created_at})
        dbConnector.create_relation("User", "id", user_id, 'Session', 'id', '\''+session_id+'\'', 'cs', 'created_session', {} )

        bot_id = 9003
        message_id = str(uuid.uuid4())
        dbConnector.create_node("m","Message",{'id': message_id, 'created_at':created_at,'embedding': [1,2] , 'type' : 'text', 'content' : 'Hello, How can i help you today?', 'user_id':bot_id})
        dbConnector.create_relation("User", "id", bot_id, 'Message', 'id', '\''+message_id+'\'', 'cm', 'created_message', {} )
        dbConnector.create_relation("Session", "id", '\''+session_id+'\'', 'Message', 'id', '\''+message_id+'\'', 'hm', 'has_message', {} )

        result = { 'session_id' : session_id}
        return result
    
    @staticmethod
    def update_member_session(session_id, user_id, status):
        dbConnector = neo4jConnector()

        if status == 'accepted' :
            dbConnector.create_relation("Session", "id", '\''+session_id+'\'', 'User', 'id', user_id, 'hm', 'has_member', {} )

        if status == 'finished' :
            dbConnector.remove_session_member(session_id, user_id)










