from ..connector.neo4j_connector import neo4jConnector

class ClusterService:

    @staticmethod
    def find_closest_cluster(queryEmbedding):

        results = neo4jConnector().find_closest_cluster(queryEmbedding)
        
        cluster = {}
        for result in results:
            cluster["cluster_similarity"]= result["cluster_similarity"]
            cluster["cluster_number"] = result["cluster_number"]
            cluster["cluster_embedding"] = result["cluster_embedding"]
            return cluster

    @staticmethod
    def find_closest_cluster_except(target_cluster_number, queryEmbedding):

        results = neo4jConnector().find_closest_cluster_except(target_cluster_number, queryEmbedding)
        
        cluster = {}
        for result in results:
            cluster["cluster_similarity"]= result["cluster_similarity"]
            cluster["cluster_number"] = result["cluster_number"]
            cluster["cluster_embedding"] = result["cluster_embedding"]
            return cluster
        
    @staticmethod
    def get_cluster_threshold(cluster_embedding, cluster_number):

        results = neo4jConnector().find_cluster_threshold(cluster_embedding, cluster_number)
        for result in results:
            return result["similarity_threshold"]
        


    @staticmethod
    def create_cluster(cluster_embedding):

        dbConnector = neo4jConnector()
        results = dbConnector.create_cluster(cluster_embedding)

        cluster = {}
        for result in results:
            cluster["cluster_number"]= result["cluster"]
            cluster["cluster_embedding"] = result["embedding"]
            return cluster
        

    @staticmethod
    def update_embedding_cluster(cluster_number):
        dbConnector = neo4jConnector()
        dbConnector.update_embedding_cluster(cluster_number)

        
    @staticmethod
    def calculate_similarity(embedding1, embedding2):
        dbConnector = neo4jConnector()
        results = dbConnector.calculate_similarity(embedding1, embedding2)
        for result in results:
            return result["cluster_similarity"]
    
    @staticmethod
    def get_cluster_avg_embedding_with_exclude_node(node_id, cluster_number):
        dbConnector = neo4jConnector()
        results = dbConnector.get_cluster_avg_embedding_with_exclude_node(node_id, cluster_number)

        cluster = {}
        for result in results:
            cluster["cluster_number"] = result["cluster"]
            cluster["cluster_embedding"] = result["avgEmbeddings"]
            return cluster


