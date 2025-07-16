from flask import Blueprint, request, make_response, jsonify
from ..service.embedding_service import EmbeddingService
from ..service.learning_materials_service import LearningMaterialsService
from main.service.prompt_service import PromptService
from sklearn.cluster import KMeans
from yellowbrick.cluster import KElbowVisualizer
from threadpoolctl import threadpool_limits
import numpy as np
import math 

admin_bp = Blueprint('admin', __name__, url_prefix="/admin")

@admin_bp.route('/generate', methods=['GET'])
def generate():

    try:

        textClass = request.args.get('text_class')
        
        embeddingService = EmbeddingService()
        embedding = embeddingService.generate_classification_embedding(textClass)
        embeddingService.store_embedding(textClass, embedding[0], 'paraphrase-multilingual-MiniLM-L12-v2')

        responseObject = {
            'status': 'success'
        }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401


@admin_bp.route('/classification', methods=['GET'])
def classification():
    try:

        textClass = request.args.get('text')
        questions = textClass.split("\n")

        result = {}
        for question in questions:
            classObject = PromptService.classifying_query(question)
            if classObject["className"] in result:
                result[classObject["className"]].append(question)
            else:
                result[classObject["className"]]=[]
                result[classObject["className"]].append(question)



        responseObject = {
            'status': 'success'
        }
        return make_response(jsonify(responseObject)), 200
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401
    
@admin_bp.route('/findingk', methods=['GET'])
def findingK():

    try:

        embeddings = LearningMaterialsService.get_all_learning_materials_embeddings()
        maxRange = round(math.sqrt(len(embeddings)))
        data = np.array(embeddings)
        model = KMeans(random_state=42,init = "k-means++")
        visualizer = KElbowVisualizer(model, k=(2,maxRange))
        with threadpool_limits(user_api="openmp", limits=6):
            visualizer.fit(data)

        visualizer.show()

        responseObject = {
            'status': 'success'
        }
        return make_response(jsonify(responseObject)), 200

    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401


@admin_bp.route('/updatelearningmaterial', methods=['POST'])
def update_learning_material():

    try:
        body = request.json
        type = body['type']
        node_id = body['node_id']
        updated_properties = body['updated_properties']

        result = LearningMaterialsService.update_learning_material(type, node_id, updated_properties)

        return make_response(jsonify(result)), 200
    
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401
    

@admin_bp.route('/deletelearningmaterial', methods=['POST'])
def delete_learning_material():

    try:
        body = request.json
        type = body['type']
        node_id = body['node_id']
        node_cluster = body['node_cluster']

        result = LearningMaterialsService.delete_learning_material(type, node_id, node_cluster)

        return make_response(jsonify(result)), 200
    
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401
    
    
@admin_bp.route('/storelearningmaterial', methods=['POST'])
def store_learning_material():

    try:
        body = request.json
        type = body['type']
        properties = body['properties']
        parent_id = body['parent_id']

        result = LearningMaterialsService.create_learning_material(type, properties, parent_id)

        return make_response(jsonify(result)), 200
    
    except Exception as e:
        responseObject = {
            'status': 'fail',
            'message': 'Some error occurred. Please try again.'
        }
        return make_response(jsonify(responseObject)), 401
