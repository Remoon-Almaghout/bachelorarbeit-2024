from ..service.profile_service import ProfileService
from ..service.course_service import CourseService
from ..connector.neo4j_connector import neo4jConnector
from ..service.embedding_service import EmbeddingService
import uuid
from datetime import datetime

class ComponentService:



    @staticmethod
    def generate_main_page_as_text(user_id):
        dbConnector = neo4jConnector()
        embeddingService = EmbeddingService()
        description = "The main page of the website contain several graphs and diagrams :\n"
        description += "1-Node graph: which contain several nodes and the releationship between those, each node represent the journey , course or topics.\n"
        description += "2-Tree diagram: which contain several levels and each level has different type.\n"
        description += "3-Entity Radar chart: it shows you the weighted overlap between user profile and recommendation for certain attributes.\n"
        description += "4-Topic overlap (The Venn diagram): shows the overlap of topics between user profile and recommendation.\n"

        results = dbConnector.find_component_by_journey_id(-1, user_id, 'main page')
        if len(results) == 0:
            componentId = str(uuid.uuid4())
            created_at = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
            descriptionEmbedding = embeddingService.generate_embedding(description)
            dbConnector.create_node("c","Component",{'id': componentId, 'created_at':created_at, 'type' : 'main page' ,'description': description , 'user_id':user_id, 'journey_id':-1, 'embedding':descriptionEmbedding[0] })
            dbConnector.create_relation("User", "id", user_id, 'Component', 'id', '\''+componentId+'\'', 'hc', 'has_component', {} )

    @staticmethod
    def generate_node_graph_as_text(recommendations,user_id):
        
        dbConnector = neo4jConnector()
        embeddingService = EmbeddingService()

        recommendationIndex = 1
        for recommendation in recommendations:

            recommendedJourney = recommendation["recommended_journey"]
            description = "Node graph for Journey \""+recommendedJourney["title"]+"\" consist of serveral nodes with different types:\n"
            description += "1-Journey (root node)\n"
            description += "2-Course (sub-node of journey)\n"
            description += "3-Topic (sub-node of Course)\n"
            description += "explination of the structure : \n"
            description += "(example : 1 is root node, 1.1 is the first sub-node of the node 1 and so on) \n"


            description += "The structure of the node is following : \n"

            description += str(recommendationIndex)+"-"+recommendedJourney["title"]+" (Journey) \n"

            courses = recommendedJourney["courses"]

            courseIndex = 1
            for course in courses:
                description += str(recommendationIndex)+"."+str(courseIndex)+"-"+course["title"]+" (Course) \n"
                topics = course["topics"]
                topicIndex = 1
                for topic in topics:
                    description += str(recommendationIndex)+"."+str(courseIndex)+"."+str(topicIndex)+"-"+topic["title"]+" (Topic) \n"
                    topicIndex = topicIndex + 1
                courseIndex = courseIndex + 1


            results = dbConnector.find_component_by_journey_id(recommendedJourney['id'], user_id, 'node graph')
            if len(results) == 0:
                componentId = str(uuid.uuid4())
                created_at = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
                descriptionEmbedding = embeddingService.generate_embedding(description)
                dbConnector.create_node("c","Component",{'id': componentId, 'created_at':created_at, 'type' : 'node graph' ,'description': description , 'user_id':user_id, 'journey_id':recommendedJourney['id'], 'embedding':descriptionEmbedding[0] })
                dbConnector.create_relation("User", "id", user_id, 'Component', 'id', '\''+componentId+'\'', 'hc', 'has_component', {} )

            recommendationIndex = recommendationIndex + 1


    @staticmethod
    def generate_tree_diagram_as_text(recommendations,user_id):

        dbConnector = neo4jConnector()
        embeddingService = EmbeddingService()

        recommendationIndex = 1
        for recommendation in recommendations:

            recommendedJourney = recommendation["recommended_journey"]
            description = "Tree diagram for Journey \""+recommendedJourney["title"]+"\" consist of serveral levels each level has its own type:\n"
            description += "1-Journey (first level)\n"
            description += "2-Course (second level)\n"
            description += "3-Topic (third level)\n"
            description += "4-Educational Package (fourth level)\n"
            description += "5-OER (fifth level)\n"
            description += "explination of the structure : \n"
            description += "(example : 1 element of the first level, 1.1 element of the second level and sub element of element 1 and so on) \n"


            description += "The structure of the Tree is the following : \n"
 
            description += str(recommendationIndex)+"-"+recommendedJourney["title"]+" (Journey) \n"

            courses = recommendedJourney["courses"]

            courseIndex = 1
            for course in courses:
                description += str(recommendationIndex)+"."+str(courseIndex)+"-"+course["title"]+" (Course) \n"
                topics = course["topics"]
                topicIndex = 1
                for topic in topics:
                    description += str(recommendationIndex)+"."+str(courseIndex)+"."+str(topicIndex)+"-"+topic["title"]+" (Topic) \n"
                    educationalPackages = topic["educational_packages"]
                    educationalPackageIndex = 1
                    for educationalPackage in educationalPackages:
                        description += str(recommendationIndex)+"."+str(courseIndex)+"."+str(topicIndex)+"."+str(educationalPackageIndex)+"-"+educationalPackage["title"]+" (Educational Package) \n"
                        OERs = educationalPackage["educational_contents"]
                        OERIndex = 1
                        for OER in OERs:
                            description += str(recommendationIndex)+"."+str(courseIndex)+"."+str(topicIndex)+"."+str(educationalPackageIndex)+"."+str(OERIndex)+"-"+OER["title"]+" (OER) \n"
                            OERIndex = OERIndex + 1
                        educationalPackageIndex = educationalPackageIndex + 1
                    topicIndex = topicIndex + 1
                courseIndex = courseIndex + 1

            results = dbConnector.find_component_by_journey_id(recommendedJourney['id'], user_id, 'tree diagram')
            if len(results) == 0:
                componentId = str(uuid.uuid4())
                created_at = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
                descriptionEmbedding = embeddingService.generate_embedding(description)
                dbConnector.create_node("c","Component",{'id': componentId, 'created_at':created_at, 'type' : 'tree diagram' ,'description': description , 'user_id':user_id, 'journey_id':recommendedJourney['id'], 'embedding':descriptionEmbedding[0] })
                dbConnector.create_relation("User", "id", user_id, 'Component', 'id', '\''+componentId+'\'', 'hc', 'has_component', {} )

            recommendationIndex = recommendationIndex + 1


    @staticmethod
    def generate_radar_chart_as_text(recommendations,user_id):

        dbConnector = neo4jConnector()
        embeddingService = EmbeddingService()

        profile = ProfileService.get(user_id)
        recommendationIndex = 1
        for recommendation in recommendations:

            recommendedJourney = recommendation["recommended_journey"]
            description = ""
            description = description + "Entity Radar Chart for Journey \""+recommendedJourney["title"]+"\" shows the number of courses that match the desires of the user in several aspects that the user defined them in the user profile page. \n"
            description = description + "The Aspects are the following: \n"

            courses = recommendedJourney["courses"]

            hoursPerWeekMatchedCourses = []
            educationContentLengthMatchedCourses = []
            levelOfDetailMatchedCourses = []
            numberOfWeeksMatchedCourses = []


            coursesWithDetails = CourseService.get_by_journey(recommendedJourney['id'])
            for courseWithDetail in coursesWithDetails:

                if courseWithDetail['hours_per_week'] <= profile['number_of_hours_per_week']:
                    hoursPerWeekMatchedCourses.append(courseWithDetail)

                if courseWithDetail['education_content_length'] <= profile['educational_content_length_preference']:
                    educationContentLengthMatchedCourses.append(courseWithDetail)

                if courseWithDetail['level_of_detail'] <= profile['level_of_detail_preference']:
                    levelOfDetailMatchedCourses.append(courseWithDetail)

                if courseWithDetail['number_of_weeks'] <= profile['number_of_weeks']:
                    numberOfWeeksMatchedCourses.append(courseWithDetail)



            description = description + "1-Hours per week \n"
            description = description + "There are "+str(len(hoursPerWeekMatchedCourses))+" courses that have same or less than "+str(profile['number_of_hours_per_week'])+" hours per week \n"
            
            profileEducationalContentLength = ""
            if profile['educational_content_length_preference'] == 0:
                profileEducationalContentLength = "low"
            if profile['educational_content_length_preference'] == 1:
                profileEducationalContentLength = "medium"
            if profile['educational_content_length_preference'] == 1:
                profileEducationalContentLength = "high"
                
            description = description + "2-Educational content length \n"
            description = description + "There are "+str(len(educationContentLengthMatchedCourses))+" courses that have "+profileEducationalContentLength+ " or less Educational content length \n"

            profileLevelOfDetail = ""
            if profile['level_of_detail_preference'] == 0:
                profileLevelOfDetail = "low"
            if profile['level_of_detail_preference'] == 1:
                profileLevelOfDetail = "medium"

            if profile['level_of_detail_preference'] == 2:
                profileLevelOfDetail = "high"

            description = description + "3-Level of detail \n"
            description = description + "There are "+str(len(levelOfDetailMatchedCourses))+" courses that have "+ profileLevelOfDetail+ " or less level of detail \n"

            description = description + "4-Number of weeks \n"
            description = description + "There are "+str(len(numberOfWeeksMatchedCourses))+" courses that have same or less than "+str(profile['number_of_weeks'])+ " number of weeks \n"

            allTopics = []
            for course in courses:
                allTopics.extend(course["topics"])

            profileTopics = profile['topics']
            matchedTopics = []
            for profileTopic in profileTopics:
                for topic in allTopics:
                    if profileTopic['ID'] == topic['ID']:
                        matchedTopics.append(profileTopic)
                        break
            
            description = description + "5-Topics \n"
            description = description + "There are "+str(len(matchedTopics))+" topics that match the topics of the user \n"


            results = dbConnector.find_component_by_journey_id(recommendedJourney['id'], user_id, 'radar chart')
            if len(results) == 0:
                componentId = str(uuid.uuid4())
                created_at = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
                descriptionEmbedding = embeddingService.generate_embedding(description)
                dbConnector.create_node("c","Component",{'id': componentId, 'created_at':created_at, 'type' : 'radar chart' ,'description': description , 'user_id':user_id, 'journey_id':recommendedJourney['id'], 'embedding':descriptionEmbedding[0] })
                dbConnector.create_relation("User", "id", user_id, 'Component', 'id', '\''+componentId+'\'', 'hc', 'has_component', {} )


            recommendationIndex = recommendationIndex + 1

 

    @staticmethod
    def generate_venn_diagram_as_text(recommendations,user_id):

        dbConnector = neo4jConnector()
        embeddingService = EmbeddingService()

        journeyTopics = []
        profile = ProfileService.get(user_id)
        userTopics = profile['topics']
        recommendationIndex = 1
        for recommendation in recommendations:
            recommendedJourney = recommendation["recommended_journey"]
            description = ""
            description = description + "Venn diagram for Journey \""+recommendedJourney["title"]+"\" consist of Two circles.\n"+\
            "The first circle represents the topics that located inside the recommendation journey and The second circle represents the topics that the user are interested in.\n"+\
            "Both circles can intersect with each other if some of the topics inside the user circle are located also inside the other.\n"+\
            "The first circle contains the following topics:\n"

            recommendedJourney = recommendation["recommended_journey"]
            courses = recommendedJourney["courses"]
            for course in courses:
                topics = course["topics"]
                for topic in topics:
                    description = description + topic['title'] + ", "
                    journeyTopics.append(topic)

            description = description + "\nThe second circle contains the following topics:\n"
            for userTopic in userTopics:
                description = description + userTopic['title']+", "


            description = description + "\nThe overlap area contains the following topics: \n"
            for userTopic in userTopics:
                for journeyTopic in journeyTopics:
                    if userTopic['ID'] == journeyTopic['ID']:
                        description = description + userTopic['title'] + ", "

            results = dbConnector.find_component_by_journey_id(recommendedJourney['id'], user_id, 'venn diagram')
            if len(results) == 0:
                componentId = str(uuid.uuid4())
                created_at = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
                descriptionEmbedding = embeddingService.generate_embedding(description)
                dbConnector.create_node("c","Component",{'id': componentId, 'created_at':created_at, 'type' : 'venn diagram' ,'description': description , 'user_id':user_id, 'journey_id':recommendedJourney['id'], 'embedding':descriptionEmbedding[0] })
                dbConnector.create_relation("User", "id", user_id, 'Component', 'id', '\''+componentId+'\'', 'hc', 'has_component', {} )

            recommendationIndex = recommendationIndex + 1
    
    @staticmethod
    def generate_info_box_as_text(recommendations,user_id):

        dbConnector = neo4jConnector()
        embeddingService = EmbeddingService()

        profile = ProfileService.get(user_id)
        for recommendation in recommendations:
                recommendedJourney = recommendation["recommended_journey"]
                description = "explination about why the recommended Journey \""+recommendedJourney["title"]+"\" is suitable for the user:\n"
                description = description + recommendation["path_explanation"]
                
                description = description + "Also recommendations are shown to the user because his profile's Configurations contain:\n"
                userCourses = profile['courses']
                userTopics = profile['topics']

                for userCourse in userCourses:
                    description = description + "Course : "+userCourse['title']+ ", "

                for userTopic in userTopics:
                    description = description + "Topic : "+userTopic['title']+ ", "

                if profile['graph_exploration_preference'] : 
                    description = description + "Focus on final goal, "
                else:
                    description = description + 'Explore more content, '

                description = description + 'Number of weeks: ' + str(profile['number_of_weeks']) + "\n"
                description = description + 'Number of hours per week: ' + str(profile['number_of_hours_per_week'])+ "\n"
                
                results = dbConnector.find_component_by_journey_id(recommendedJourney['id'], user_id, 'info box')
                if len(results) == 0:
                    componentId = str(uuid.uuid4())
                    created_at = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
                    descriptionEmbedding = embeddingService.generate_embedding(description)
                    dbConnector.create_node("c","Component",{'id': componentId, 'created_at':created_at, 'type' : 'info box' ,'description': description , 'user_id':user_id, 'journey_id':recommendedJourney['id'], 'embedding':descriptionEmbedding[0] })
                    dbConnector.create_relation("User", "id", user_id, 'Component', 'id', '\''+componentId+'\'', 'hc', 'has_component', {} )
