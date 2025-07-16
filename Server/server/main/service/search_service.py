from main.service.embedding_service import EmbeddingService
from ..connector.neo4j_connector import neo4jConnector
import logging
from langdetect import detect
from textblob_de import TextBlobDE
from textblob import TextBlob

# import spacy

class SearchService:
    @staticmethod
    def search_semanticly(query):

        embeddingService = EmbeddingService()
        queryEmbedding = embeddingService.generate_embedding(query)
        results = neo4jConnector().search_semanticly(queryEmbedding[0])

        data = []
        for x in results:
            mainNode = x["n"]
            if not SearchService.check_if_node_exist(data, mainNode):
                data.append({ 
                    'id': mainNode["ID"], 
                    'title': mainNode["title"] ,
                    'description': mainNode["description"] ,
                    'expert_explanation': mainNode["expert_explanation"] ,
                    'automatic_explanation': mainNode["automatic_explanation"] ,
                    'expert_keywords': mainNode["expert_keywords"] ,
                    })
            
            relatedNode = x["m"]
            if relatedNode:
                relation = x['hsrt']
                data.append({ 
                    'title': "\""+mainNode["title"]+"\""+" and "+ "\""+relatedNode["title"]+"\"" + " both nodes are similar" ,
                    'description': '' ,
                    'expert_explanation': '' ,
                    'automatic_explanation': relation["automatic_explanation"] ,
                    'expert_keywords': '' ,
                    })
            
        return data
    @staticmethod
    def search_hybrid(query):

        embeddingService = EmbeddingService()
        queryEmbedding = embeddingService.generate_embedding(query)
        allNounsInQuesion = SearchService.extract_nouns(query)

        data = []
        for noun in allNounsInQuesion:
            
            results = neo4jConnector().search_hybrid(queryEmbedding[0],noun)

            for x in results:
                mainNode = x["n"]
                if not SearchService.check_if_node_exist(data, mainNode):
                    data.append({ 
                        'id': mainNode["ID"], 
                        'title': mainNode["title"] ,
                        'description': mainNode["description"] ,
                        'expert_explanation': mainNode["expert_explanation"] ,
                        'automatic_explanation': mainNode["automatic_explanation"] ,
                        'expert_keywords': mainNode["expert_keywords"] ,
                        })
                
                relatedNode = x["m"]
                if relatedNode:
                    relation = x['hsrt']
                    data.append({ 
                        'title': "\""+mainNode["title"]+"\""+" and "+ "\""+relatedNode["title"]+"\"" + " both nodes are similar" ,
                        'description': '' ,
                        'expert_explanation': '' ,
                        'automatic_explanation': relation["automatic_explanation"] ,
                        'expert_keywords': '' ,
                        })
            
        return data
    @staticmethod
    def check_if_node_exist(data, targetNode):
        try:
            for node in data:

                if "id" in  node and node["id"] == targetNode["ID"]:
                    return True
            
            return False
        except Exception as ex:
            logging.error(ex)


    @staticmethod
    def search_component(query, user_id):

        embeddingService = EmbeddingService()
        queryEmbedding = embeddingService.generate_embedding(query)
        results = neo4jConnector().search_component(queryEmbedding[0], user_id)

        data = []
        for x in results:
            result = x["c"]
            data.append({ 
                'id': result["id"], 
                'title': result["type"] ,
                'description': result["description"],
                'expert_explanation': '' ,
                'automatic_explanation': '' ,
                'expert_keywords': '' ,
                })
            
        return data

    @staticmethod
    def extract_nouns(query):

        lang = detect(query)

        if lang == "de":
            blob = TextBlobDE(query)
            allwords = blob.words
            blob = TextBlobDE(" ".join(allwords))
            allNouns = blob.noun_phrases
        else:
            blob = TextBlob(query)
            allwords = blob.words
            blob = TextBlob(" ".join(allwords))
            allNouns = blob.noun_phrases

        return allNouns





