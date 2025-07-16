import uuid
import time
import os
import re
from flask import send_from_directory
from ..config import Config
from datetime import datetime
from ..connector.neo4j_connector import neo4jConnector

import logging
class FileService:
    @staticmethod
    def get_file(fileId):
        files = neo4jConnector().find_file(fileId)

        if len(files) == 0 :
            responseObject = {
                'status': 'fail',
                'message': 'file not found'
            }
            return responseObject

        fileData = files[0]["f"]
        fileType = fileData['type']
        

        if fileType == 'doc':
            return send_from_directory(Config.DOCS_PATH+"\\"+str(fileData["user_id"]), fileData["name"],as_attachment=True,download_name=fileData["real_name"].replace('\\',''))


        if fileType == 'image':
            return send_from_directory(Config.IMAGES_PATH+"\\"+str(fileData["user_id"]), fileData["name"])


    @staticmethod
    def get_file_info(fileId):
        files = neo4jConnector().find_file(fileId)
        if len(files) == 0 :
            responseObject = {
                'status': 'fail',
                'message': 'file not found'
            }
            return responseObject
        
        fileData = files[0]["f"]
        responseObject = {
            'status': 'success',
            'message': 'file has been found',
            'name' : fileData["real_name"].replace('\\',''),
            'type': fileData['type']
        }
        return responseObject

    @staticmethod
    def store_image(user_id, files):

        if 'image' not in files:
            responseObject = {
                'status': 'fail',
                'message': 'image not found'
            }
            return responseObject
        
        image = files['image']
        imageRealName = re.escape(image.filename)
        imageType = image.content_type.split('/')[1]

        if imageType not in Config.ALLOWED_FILE_TYPES:
            responseObject = {
                'status': 'fail',
                'message': 'invalid image type'
            }
            return responseObject
        
        imageName = str(int(round(time.time()*1000))) + "." + imageType
        imagesUserPath = Config.IMAGES_PATH+"\\"+str(user_id)
        if not os.path.exists(imagesUserPath):
            os.mkdir(imagesUserPath)

        image.save(imagesUserPath+"\\"+imageName)

        fileId = str(uuid.uuid4())
        createdAt = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
        dbConnector = neo4jConnector()
        dbConnector.create_node("m","File",{'id': fileId, 'created_at':createdAt , 'type' : 'image', 'name': imageName, 'real_name':imageRealName ,'user_id':user_id})
        dbConnector.create_relation("User", "id", user_id, 'File', 'id', '\''+fileId+'\'', 'hi', 'has_file', {} )

        responseObject = {
            'status': 'success',
            'message': 'image has been successfully uploaded',
            'url' : '/file/get?fileId='+fileId,
            'type': 'image'
        }
        return responseObject
    

    @staticmethod
    def store_docs(user_id, files):

        try:
            
            if 'doc' not in files:
                responseObject = {
                    'status': 'fail',
                    'message': 'doc not found'
                }
                return responseObject
            
            doc = files['doc']
            docType = doc.content_type.split('/')[1]

            if docType not in Config.ALLOWED_FILE_TYPES:
                responseObject = {
                    'status': 'fail',
                    'message': 'invalid doc type'
                }
                return responseObject
            
            docName = str(int(round(time.time()*1000))) + "." + docType
            docRealName = re.escape(doc.filename)
            docsUserPath = Config.DOCS_PATH+"\\"+str(user_id)
            if not os.path.exists(docsUserPath):
                os.mkdir(docsUserPath)

            doc.save(docsUserPath+"\\"+docName)

            fileId = str(uuid.uuid4())
            createdAt = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
            dbConnector = neo4jConnector()
            dbConnector.create_node("m","File",{'id': fileId, 'created_at':createdAt , 'type' : 'doc', 'name': docName, 'real_name':docRealName,'user_id':user_id})
            dbConnector.create_relation("User", "id", user_id, 'File', 'id', '\''+fileId+'\'', 'hi', 'has_file', {} )

            responseObject = {
                'status': 'success',
                'message': 'doc has been successfully uploaded',
                'url' : '/file/get?fileId='+fileId,
                'type':'doc'
            }
            return responseObject
        except Exception as ex:
            logging.error(ex)




