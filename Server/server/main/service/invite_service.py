import uuid
from datetime import datetime
from ..connector.neo4j_connector import neo4jConnector
class InviteService:
    @staticmethod
    def get_invites(user_id):
        results = neo4jConnector().find_invites(user_id)

        invites = []
        for x in results:
            expert = x["e"]
            invite = x["i"]
            user = x["u"]
            invites.append({ 
                'id': invite["id"], 
                'session_id': invite["session_id"] ,
                'created_by': user["name"],
                'created_at': datetime.strptime(invite["created_at"] , '%d-%m-%Y %H:%M:%S').strftime("%d-%m-%Y %H:%M %p")  ,
                })
            
        return invites
    
    @staticmethod
    def update_invite(invite_id, status):

        dbConnector = neo4jConnector()
        dbConnector.set_node_property("Invite", "id", invite_id, "status", status)

        responseObject = {
            'status': 'success',
            'message': 'invite status has been updated',
        }
        return responseObject
    
    @staticmethod
    def update_invite_by_session(user_id, session_id, status):

        dbConnector = neo4jConnector()
        dbConnector.update_invite_by_session_id(user_id, session_id, status)

        responseObject = {
            'status': 'success',
            'message': 'invite status has been updated',
        }
        return responseObject
    


    @staticmethod
    def create_invite(user_id, expert_category, session_id):

        inviteId = str(uuid.uuid4())
        createdAt = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
        dbConnector = neo4jConnector()


        invites = dbConnector.find_invite(user_id, expert_category, session_id)



        if len(invites) > 0:
            responseObject = {
                'status': 'success',
                'message': 'invite has been already sent'
            }
            return responseObject

        experts = dbConnector.find_expert(expert_category)

        if len(experts) == 0:
            responseObject = {
                'status': 'fail',
                'message': 'no expert found'
            }
            return responseObject
        
        expert = experts[0]["u"]

        dbConnector.create_node("i","Invite",{'id': inviteId, 'created_at':createdAt , 'created_by' : user_id, 'status': 'pending' , 'expert_category' : expert_category, 'session_id': session_id})
        dbConnector.create_relation("User", "id", expert["id"], 'Invite', 'id', '\''+inviteId+'\'', 'hi', 'has_invite', {} )
        dbConnector.create_relation("User", "id", user_id, 'Invite', 'id', '\''+inviteId+'\'', 'ci', 'created_invite', {} )

        responseObject = {
            'status': 'success',
            'message': 'invite has been successfully sent',
            'expert_sid' : expert["sid"]
        }
        return responseObject





