from ..connector.neo4j_connector import neo4jConnector
from main.service.embedding_service import EmbeddingService
from main.service.cluster_service import ClusterService
from datetime import datetime

class LearningMaterialsService:
    @staticmethod
    def get_all_learning_materials_embeddings():

        results = neo4jConnector().find_all_learn_materials()

        embeddings = []
        for result in results:
            node = result["found_node"]
            embedding = []
            embedding.append(node["embedding"]) 
            embeddings.extend(embedding)

            
        return embeddings
    


    @staticmethod
    def update_learning_material(type, node_id, updated_properties):


        #WARNING WARNING CREATING UPDATING AND DELETING LEARNING MATERIALS ARE CRICTICLE OPERATIONS, MAKE SURE TO BACKUP THE DATABASE BEFORE DOING ANY OF THEM

        try:
            if type != "Journey" and type != "Course" and type != "Topic" and type != "Educational_Package" and type != "OER":
                responseObject = {
                        'status': 'failed',
                        'message': 'learning material is not supported'
                    }
                return responseObject
            

            #grab the original data of the node
            dbConnector = neo4jConnector()
            results = dbConnector.find_node_by_id(type, node_id)
            original_node = results[0]["found_node"]

            updated_node = {
                'ID': original_node["ID"],
                'expert_explanation': original_node["expert_explanation"],  
                'automatic_explanation': original_node["automatic_explanation"],
                'expert_keywords': original_node["expert_keywords"],
                'title': original_node["title"],
                'cluster_number': original_node["cluster_number"],
                'embedding': original_node["embedding"],
                'description': original_node["description"],
                'created_at': original_node["created_at"]
                }
            
            #update the properties of the node in memory only
            for key in updated_properties:
                updated_node[key] = updated_properties[key]

            nodeInfo = ""
            nodeInfo += "title: " +"\n "  if updated_node["title"] else ""
            nodeInfo += updated_node["title"] +". \n " if updated_node["title"] else ""
            nodeInfo += "description: " +"\n " if updated_node["description"] else ""
            nodeInfo += updated_node["description"] +". \n " if updated_node["description"] else ""
            nodeInfo += "automatic explanation: " +"\n " if updated_node["automatic_explanation"] else ""
            nodeInfo += updated_node["automatic_explanation"] +". \n " if updated_node["automatic_explanation"] else ""
            nodeInfo += "expert explanation: " +"\n " if updated_node["expert_explanation"] else ""
            nodeInfo += updated_node["expert_explanation"] +". \n " if updated_node["expert_explanation"] else ""
            nodeInfo += "expert keywords: " +"\n " if updated_node["expert_keywords"] else ""
            nodeInfo += updated_node["expert_keywords"] +". \n " if updated_node["expert_keywords"] else ""


            #generating embedding and store it with node variable in memory
            embeddingService = EmbeddingService()
            nodeEmbedding = embeddingService.generate_embedding(nodeInfo)[0]
            updated_node["embedding"] = nodeEmbedding

            #it brings the most similar centroid to the updated node with ignoring the cluster that node is currently belong
            closest_cluster = ClusterService.find_closest_cluster_except(original_node["cluster_number"],nodeEmbedding)

            #this contains several steps
            #1-calculating the avg embedding vector of the cluster with excluding the updated node
            #2-comparing the avg embedding with embedding of the updated node through cosine similarity and return the similarity
            modified_cluster = ClusterService.get_cluster_avg_embedding_with_exclude_node(node_id, original_node["cluster_number"])
            node_cluster_similarity = ClusterService.calculate_similarity(modified_cluster["cluster_embedding"], nodeEmbedding)

            #if similarity of the last step bigger than the others
            if node_cluster_similarity > closest_cluster["cluster_similarity"]:
                #we have to check the threshold
                threshold = ClusterService.get_cluster_threshold(modified_cluster["cluster_embedding"], modified_cluster["cluster_number"])
                # if bigger than threshold
                if node_cluster_similarity > threshold :
                    #it will stay in his cluster, we update only the data and the centroid of the cluster
                    updated_node["cluster_number"] = modified_cluster["cluster_number"]
                    dbConnector.update_node(type, {"ID" : original_node["ID"]}, updated_node)
                    #update the centroid vector
                    ClusterService.update_embedding_cluster(updated_node["cluster_number"])
                else:
                   #if not we have to create new cluster and update the node
                    newCluster = ClusterService.create_cluster(nodeEmbedding)
                    updated_node["cluster_number"] = newCluster["cluster_number"]
                    dbConnector.update_node(type, {"ID" : original_node["ID"]}, updated_node)

            else:
                
                threshold = ClusterService.get_cluster_threshold(closest_cluster["cluster_embedding"], closest_cluster["cluster_number"])
                if closest_cluster["cluster_similarity"] > threshold :
                    updated_node["cluster_number"] = closest_cluster["cluster_number"]
                    #update_node
                    dbConnector.update_node(type, {"ID" : original_node["ID"]}, updated_node)
                    #update the centroid vector
                    ClusterService.update_embedding_cluster(updated_node["cluster_number"])
                else:
                    newCluster = ClusterService.create_cluster(nodeEmbedding)
                    updated_node["cluster_number"] = newCluster["cluster_number"]
                    #update_node
                    dbConnector.update_node(type, {"ID" : original_node["ID"]}, updated_node)

            responseObject = {
                    'status': 'success',
                    'message': 'learning material has been updated'
                }
            return responseObject
        
        except Exception as ex:
            responseObject = {
                'status': 'failed',
                'message': 'error while creating learning material'
            }
        
            return responseObject

    @staticmethod
    def delete_learning_material(type, node_id, cluster_number):

        #WARNING WARNING CREATING UPDATING AND DELETING LEARNING MATERIALS ARE CRICTICLE OPERATIONS, MAKE SURE TO BACKUP THE DATABASE BEFORE DOING ANY OF THEM

        try:

            if type != "Journey" and type != "Course" and type != "Topic" and type != "Educational_Package" and type != "OER":
                responseObject = {
                        'status': 'failed',
                        'message': 'learning material is not supported'
                    }
                return responseObject
        
            dbConnector = neo4jConnector()
            dbConnector.delete_node_by_property(type, 'ID', node_id)
            ClusterService.update_embedding_cluster(cluster_number)

            responseObject = {
                    'status': 'success',
                    'message': 'learning material has been deleted'
                }
            return responseObject

        except Exception as ex:
            responseObject = {
                'status': 'failed',
                'message': 'error while creating learning material'
            }
        
            return responseObject


    @staticmethod
    def create_learning_material(type, properties, parent_id):

        #WARNING WARNING CREATING UPDATING AND DELETING LEARNING MATERIALS ARE CRICTICLE OPERATIONS, MAKE SURE TO BACKUP THE DATABASE BEFORE DOING ANY OF THEM
        try:

            if type != "Journey" and type != "Course" and type != "Topic" and type != "Educational_Package" and type != "OER":
                responseObject = {
                        'status': 'failed',
                        'message': 'learning material is not supported'
                    }
                return responseObject
        
            dbConnector = neo4jConnector()

            nodeInfo = ""
            nodeInfo += "title: " +"\n "  if properties["title"] else ""
            nodeInfo += properties["title"] +". \n " if properties["title"] else ""
            nodeInfo += "description: " +"\n " if properties["description"] else ""
            nodeInfo += properties["description"] +". \n " if properties["description"] else ""
            nodeInfo += "automatic explanation: " +"\n " if properties["automatic_explanation"] else ""
            nodeInfo += properties["automatic_explanation"] +". \n " if properties["automatic_explanation"] else ""
            nodeInfo += "expert explanation: " +"\n " if properties["expert_explanation"] else ""
            nodeInfo += properties["expert_explanation"] +". \n " if properties["expert_explanation"] else ""
            nodeInfo += "expert keywords: " +"\n " if properties["expert_keywords"] else ""
            nodeInfo += properties["expert_keywords"] +". \n " if properties["expert_keywords"] else ""


            embeddingService = EmbeddingService()
            nodeEmbedding = embeddingService.generate_embedding(nodeInfo)[0]

            properties["embedding"] = nodeEmbedding
            properties["created_at"] = datetime.now().strftime("%d-%m-%Y %H:%M:%S")

            cluster = ClusterService.find_closest_cluster(nodeEmbedding)
            threshold = ClusterService.get_cluster_threshold(cluster["cluster_embedding"], cluster["cluster_number"])

            if cluster["cluster_similarity"] > threshold :
                properties["cluster_number"] = cluster["cluster_number"]
                dbConnector.create_node("node", type, properties)
                #update the centroid vector
                ClusterService.update_embedding_cluster(cluster["cluster_number"])
    
            else:
                newCluster = ClusterService.create_cluster(nodeEmbedding)
                properties["cluster_number"] = newCluster["cluster_number"]
                dbConnector.create_node("node", type, properties)

            
            if type == "Course" :
                dbConnector.create_relation("Journey", "ID", parent_id, 'Course', 'ID', properties["id"], 'hc', 'has_course', {} )

            if type == "Topic" :
                dbConnector.create_relation("Course", "ID", parent_id, 'Topic', 'ID', properties["id"], 'ht', 'has_topic', {} )

            if type == "Educational_Package" :
                dbConnector.create_relation("Topic", "ID", parent_id, 'Educational_Package', 'ID', properties["id"], 'he', 'has_educational_package', {} )

            if type == "OER" :
                dbConnector.create_relation("Educational_Package", "ID", parent_id, 'OER', 'ID', properties["id"], 'ho', 'has_oer', {} )
 
            responseObject = {
                    'status': 'success',
                    'message': 'learning material has been created'
                }
            return responseObject
        except Exception as ex:
            responseObject = {
                    'status': 'failed',
                    'message': 'error while creating learning material'
                }
            
            return responseObject
        

