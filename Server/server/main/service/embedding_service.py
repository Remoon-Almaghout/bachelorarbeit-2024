from sentence_transformers import SentenceTransformer
from ..connector.neo4j_connector import neo4jConnector
from datetime import datetime
import uuid
import logging

class EmbeddingService(object):
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            print('Creating the object')
            cls._instance = super(EmbeddingService, cls).__new__(cls)
            #model for similarity text
            cls.similarityTextModel = SentenceTransformer("sentence-transformers/distiluse-base-multilingual-cased-v1")
            #model for classification
            # cls.classificationModel = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
            cls.classificationModel = SentenceTransformer("sentence-transformers/distiluse-base-multilingual-cased-v1")
        return cls._instance
    

    def generate_embedding(self, text):

        embedding = self.similarityTextModel.encode([text]).tolist()
        return embedding
    
    def generate_classification_embedding(self, text):
        embedding = self.classificationModel.encode([text]).tolist()
        return embedding
    

    def store_embedding(self, text, embedding, type):
        dbConnector = neo4jConnector()

        created_at = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
        id = str(uuid.uuid4())
        dbConnector.create_node("qc","Query_Class",{'id': id, 'created_at':created_at,'embedding': embedding , 'type' : type, 'text' : text})







