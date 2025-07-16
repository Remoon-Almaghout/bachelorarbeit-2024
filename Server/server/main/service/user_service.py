from ..connector.neo4j_connector import neo4jConnector
import logging
from datetime import datetime

class UserService:
    @staticmethod 
    def create_user(user):
        user.hash_password()

        dbConnector = neo4jConnector()
        result = dbConnector.get_latest_user_id()
        user_id = 1
        for x in result:
            userData = x['u']
            user_id = userData['id']
            break

        user.id = user_id + 1
        dbConnector.create_node('u','User',{'email': user.email, 'password_hash': user.password_hash.decode('utf8'), 'id':user.id, 'expert': False, 'expert_category': ''})


    @staticmethod
    def find_one_by_email(email):

        dbConnector = neo4jConnector()
        result = dbConnector.find_node('User','email',email)
        users = []
        for x in result:
            user = x['found_node']
            users.append({
                'id': user['id'],
                'email': user['email'],
                'password_hash': user['password_hash'],
                'registerd_at': user['registerd_at']
            })

        if len(result) == 0:
            return None
        else:
            return users[0]
        
        
    @staticmethod
    def user_exists(email):
        try:
            dbConnector = neo4jConnector()
            result = dbConnector.find_node('User','email',email)
            users = []
            for x in result:
                user = x['found_node']
                users.append({
                    'id': user['id'],
                    'email': user['email'],
                    'password_hash': user['password_hash'],
                    'registerd_at': user['registerd_at']
                })

            return len(users)
        except Exception as ex:
            logging.error(ex)

    @staticmethod
    def enroll_user_in_journey(user_id, journey_id):
        try:
            neo4j_connector = neo4jConnector()

            # Check if the user is already enrolled in the journey using relation_exist method
            existing_relation = neo4j_connector.relation_exist(
                "User", "id", user_id,
                "ENROLLED_IN",
                "Journey", "ID", journey_id
            )

            if existing_relation and existing_relation[0].get('Predicate', False):
                return {"success": False, "message": "User already enrolled this Jouorney"}
            relation_properties = {
                'created_at': datetime.now().strftime("%d-%m-%Y %H:%M:%S")
            }
            # Create the ENROLLED_IN relationship
            neo4j_connector.create_relation(
                "User", "id", user_id,
                "Journey", "ID", journey_id,
                "r", "ENROLLED_IN", relation_properties
            )

            return {"success": True, "message": "User enrolled Journey successfully"}
        except Exception as ex:
            error_message = f"Error enrolling Journey for user"
            logging.error(error_message)
            return {"success": False, "message": error_message}
            
        

    @staticmethod
    def get_enrolled_journeys(user_id):
        try:
            neo4j_connector = neo4jConnector()
            enrolled_journeys_result = neo4j_connector.find_enrolled_journeys(user_id)
            journeys = []
            for record in enrolled_journeys_result:
                 journeys.append({'journey_id':record['j']["ID"], 'title':record['j']['title']})
            return journeys
        except Exception as ex:
            print(f"Error getting enrolled journeys: {ex}")
            raise ex
        
    @staticmethod
    def user_complete_oer(user_id, oer_id):
        try:
            neo4j_connector = neo4jConnector()

            # Check if the user is already completed the OER using relation_exist method
            existing_relation = neo4j_connector.relation_exist(
                "User", "id", user_id,
                "complete",
                "OER", "ID", oer_id
            )

            if existing_relation and existing_relation[0].get('Predicate', False):
                return {"success": False, "message": "User already completed this OER"}
            relation_properties = {
                'created_at': datetime.now().strftime("%d-%m-%Y %H:%M:%S")
            }
            # Create the complete relationship
            neo4j_connector.create_relation(
                "User", "id", user_id,
                "OER", "ID", oer_id,
                "r", "complete", relation_properties
            )
            return {"success": True, "message": "User completed OER successfully"}
        except Exception as ex:
            error_message = f"Error completing OER for user"
            logging.error(error_message)
            return {"success": False, "message": error_message}

            

    @staticmethod
    def update_current_site(user_id, new_current_site):
        with neo4jConnector().driver.session() as session:
            session.run(
                "MATCH (u:User {id: $user_id}) SET u.current_site = $new_current_site",
                user_id=user_id, new_current_site=new_current_site
            )

    @staticmethod
    def get_current_site(user_id):
        with neo4jConnector().driver.session() as session:
            result = session.run(
                "MATCH (u:User {id: $user_id}) RETURN u.current_site AS current_site",
                user_id=user_id
            )
            return result.single()['current_site']
        
    
    @staticmethod
    def set_last_journey(user_id, journey_id):
        with neo4jConnector().driver.session() as session:
            session.run(
                "MATCH (u:User {id: $user_id}) SET u.journey_id = $journey_id",
                user_id=user_id, journey_id=journey_id
            )

    @staticmethod
    def get_last_journey(user_id):
        with neo4jConnector().driver.session() as session:
            result = session.run(
                "MATCH (u:User {id: $user_id}) RETURN u.journey_id AS journey_id",
                user_id=user_id
            )
            return result.single()['journey_id']