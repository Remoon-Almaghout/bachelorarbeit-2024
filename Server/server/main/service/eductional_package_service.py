from datetime import datetime
from ..connector.neo4j_connector import neo4jConnector
from .oer_service import OERService
class EducationalPackageService:
    @staticmethod
    def get_one(educational_package_id, user_id):
        results = neo4jConnector().find_educational_package_by_id(educational_package_id)
        result = results[0]["e"]
        completed_status = neo4jConnector().relation_exist(
            "User", "id", user_id,
            "complete",
            "Educational_Package", "ID", educational_package_id
        )
        educational_package = {
            'ID': result["ID"], 
            'title': result["title"],
            'description': result["description"],
            'created_at': result["created_at"],
            'completed': completed_status[0].get('Predicate', False) if completed_status else False

            }
       
        return educational_package

    @staticmethod
    def get_by_topic(topic_id, user_id):
        results = neo4jConnector().find_educational_package_by_topic(topic_id)
        all_ep_completed = True 
        educational_packges = []
        for x in results:
            found_node = x["found_node"]
            completed_status = neo4jConnector().relation_exist(
            "User", "id", user_id,
            "complete",
            "Educational_Package", "ID", found_node["ID"]
        )  
            ep_details = {
                'ID': found_node["ID"], 
                'title': found_node["title"],
                'description': found_node["description"],
                'created_at': found_node["created_at"],
                'completed': completed_status[0].get('Predicate', False) if completed_status else False

            }
            if not ep_details['completed']:
                 all_ep_completed = False
            educational_packges.append(ep_details)
    
        # Check if the relation between user and Topic already exists
        relation_exists = neo4jConnector().relation_exist(
            "User", "id", user_id,
            "complete",
            "Topic", "ID", topic_id
        )
        relation_properties = {
                'created_at': datetime.now().strftime("%d-%m-%Y %H:%M:%S")
            }
        if relation_exists[0]['Predicate'] == False:
            # If all education packages are completed, mark the Topic as completed
            if all_ep_completed:
                neo4jConnector().create_relation(
                    "User", "id", user_id,
                    "Topic", "ID", topic_id,
                    "r", "complete", relation_properties
                )
        return educational_packges
    
    def get_related_educational_packages(educational_package_name):
        results = neo4jConnector().find_connected_courses(educational_package_name)
        
        educational_packges = []
        for x in results:
            found_node = x["found_node"]
            educational_packges.append({'ID': found_node["ID"], 'title': found_node["title"],'description': found_node["description"] })

        return educational_packges


    @staticmethod
    def get_education_packages(user_id):
        results = neo4jConnector().find_all_education_packages()
        eps = []
        for x in results:
            ep = x['e']
            ep_id = ep["ID"]
            try:
                oers = OERService.get_oers_by_educational_package(ep_id, user_id)
            except Exception as oer_error:
                print(f"Error getting oers for education package {ep_id}: {oer_error}")
                continue
            completed_oers_count = sum(oer['completed'] for oer in oers)
            completed = completed_oers_count == len(oers) and len(oers) > 0
            eps.append({
                'ID': ep["ID"], 
                'title': ep["title"],
                'description': ep["description"],
                'created_at': ep["created_at"],
                'completed': completed,
                'progress': f"{completed_oers_count}/{len(oers)}",
                })

        return eps
    
        
    @staticmethod
    def get_by_journey(journey_id, user_id):
        results = neo4jConnector().find_eps_of_journey(journey_id)
        eps = []

        for x in results:
            found_node = x["found_node"]
            completed_status = neo4jConnector().relation_exist(
                "User", "id", user_id,
                "complete",
                "Educational_Package", "ID", found_node["ID"]
            )  

            ep_details = {
                'ID': found_node["ID"], 
                'title': found_node["title"],
                'description': found_node["description"],
                'created_at': found_node["created_at"],
                'completed': completed_status[0].get('Predicate', False) if completed_status else False

            }

            eps.append(ep_details)

        
        return eps