from ..connector.neo4j_connector import neo4jConnector

class RelationService:
    @staticmethod
    def get_all(source_type, source_id, target_type, target_id):
        results = neo4jConnector().find_all_relations(source_type, source_id, target_type, target_id)

        relations = []
        for x in results:
            r = x["r"]
            relations.append({ 
                'automatic_explanation': r["automatic_explanation"], 
                'title_similarity_score': r["title_similarity_score"],
                'description_similarity_score': r["description_similarity_score"],
                'type': r["type"],
                'expert_explanation': r["expert_explanation"]
                })

        return relations

    @staticmethod
    def get_node_information(source_type, source_id):
        results = neo4jConnector().find_node_by_id(source_type, source_id)
    
        result = results[0]["found_node"]
        node = {
            'ID': result["ID"],
            'expert_explanation': result["expert_explanation"],  
            'automatic_explanation': result["automatic_explanation"],
            'expert_keywords': result["expert_keywords"],
            'title': result["title"],
            'description': result["description"],
            'created_at': result["created_at"]
            }
       
        return node

    def get_expanded_node_information(node_id, node_type):
        print("get_expanded_node_information")
        results = neo4jConnector().find_all_node_relations(node_id, node_type)

        data = []
        for x in results:
            n = x["n"]
            target = x["target"]

            source_type, = n.labels
            target_type, = target.labels
         
            data.append({
                'source_type': source_type,
                'source_title': n["title"],
                'source_id': n["ID"],
                'target_type': target_type,
                'target_title': target["title"],
                'target_id': target["ID"]
            })
 
        return data





