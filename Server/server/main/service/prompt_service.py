import tiktoken
import logging
import time
from ..config import Config
from ..service.search_service import SearchService
from ..service.message_service import MessageService
from ..service.embedding_service import EmbeddingService
from ..connector.neo4j_connector import neo4jConnector
from ..service.profile_service import ProfileService


class PromptService:


    def generate_prompt_message(prompt_type, query, user_id = 0, session_id = 0, question_class = "", search_type = "hybrid" ):
        


        token_budget: int = 4096 - 500
        messages = []
        hybrid_search_result = []
        match prompt_type:

            case "classification":
                rules = "consider the following classes of a user question and return only the number of the class: \n \
                1-asking about the reason of recommendation. \n \
                2-asking about courses , topics, journies ,educational packages or content in a node graph, tree diagram, venn diagram, entity chart radar. \n \
                3-asking about benefits that will be gained from learning specific learn material. \n  \
                4-asking about relation , similarity or connection between several course, topics or educational packages. \n  \
                5-asking about information about courses , topics, journies or educational packages. \n  \
                6-asking about benefits of courses or learn material in daily work. \n  \
                7-none of the previous classes." 


                answer_source = "gpt"
                messages = [
                    {"role": "system", "content": rules},
                    {"role": "user", "content":  query}
                ]



            case "clarification":

                systemSection = ""

                question = "pretend that you are the user if the input is request return  reformat this input with your own words and detailed and specific and dont mention 'in the node graph' and use the same language as the language of the question, if the input not request return the same input, the input: "+ query

                rules = "rules:\n"
                rules += "use the same language as the language of the question \n"
                rules += "reformat the question with your own words and detailed and specific  , use the previous messages section as\n"
                rules += "refrence,  replace node numbers with their names , example :\n "
                rules += "What is the content of topic 1.3.4  \n"
                rules += "what is the content of topic with name 'Zwang - Entwicklungsaufgaben' \n"
                



                previousResponds = MessageService.get_messages(user_id, session_id)
                previousResponds.reverse()

                systemSection = ""

                selectedMessages = []

                i = 1
                for previousRespond in previousResponds:

                    previousMessage = str(len(previousResponds)-i)+"-"+previousRespond["user_name"]+":\"" + previousRespond["content"] + "\" \n"
                    expectedTokes = PromptService.num_tokens(systemSection + previousMessage + rules + question, model=Config.GPT_MODEL)
                    if expectedTokes > token_budget :
                        break
                    else:
                        selectedMessages.append(previousMessage)
                        systemSection += previousMessage
                        i = i + 1


                selectedMessages.reverse()
                
                systemSection = "[PREVIOUS MESSAGES] : \n"
                for selectedMessage in selectedMessages:
                    systemSection += selectedMessage


                systemSection += "[PREVIOUS MESSAGES]"
                systemSection += rules

                answer_source = "gpt"
                messages = [
                    {"role": "system", "content": systemSection},
                    {"role": "user", "content":question},
                ]

            case "answer":

                if question_class != "6":
                    information = "please follow all the following rules before answering the question : \n"
                    information += "1-Don’t give information or answer scientific questions not mentioned in the [DATA SECTION] and return only this scentence  \"sorry, but no information available\" in english if you didnt find answer \n"
                    information += "2-if the user requested to speak with expert or real person or agent return only this scentence \"the user is asking for an expert\" in english \n"
                    information += "3-[DATA SECTION] do not mention the existing of this section in your answer \n"
                    information += "5-questions about movies, video games, food, jokes are not allowed \n"
                    information += "6-ask the user for clarification if something unclear or they didnt tell or explain example:\n"
                    information += "user: how can this topic 'komplex zwang' solve my problem\n"
                    information += "you: can you explain your problem so i can give you precise answer\n"

                else:
                    information = "check the following [DATA SECTION] if profession of user exist  , if not, dont give answer from your own or general answer and ask the user first about his profession or some hint about his life , if exist, make your answer to be connected with his own life   \n"
     

                question = "question : " + query
                prompt = information

                learnMaterials = []

                if question_class == "1" :
                    learnMaterials = SearchService.search_component(query, user_id)

                if question_class == "2":
                    learnMaterials = SearchService.search_component(query, user_id)
                    hybrid_search_result = SearchService.search_hybrid(query)
                    learnMaterials.extend(hybrid_search_result)

                if question_class == "3" or question_class == "4" or question_class == "5":

                    learnMaterials = SearchService.search_component(query, user_id)
                    if search_type == "hybrid":
                        hybrid_search_result = SearchService.search_hybrid(query)
                        learnMaterials.extend(hybrid_search_result)
                    else :
                        learnMaterials.extend(SearchService.search_semanticly(query))

                if question_class == "6":
                    hybrid_search_result = SearchService.search_hybrid(query)
                    learnMaterials = hybrid_search_result
                    profile = ProfileService.get(user_id)
                    if profile["biography"] :
                        answer_source = "intern"
                        learnMaterials.append({ 
                                'id': '', 
                                'title': 'user profile info' ,
                                'description': "the user is working in "+profile["company"]+"and his biography the following:"+profile["biography"] ,
                                'expert_explanation': "" ,
                                'automatic_explanation': "" ,
                                'expert_keywords': "" ,
                                })
                        
                    if profile["courses"] and len(profile["courses"]) > 0:
                            answer_source = "intern"
                            user_attended_courses = "the user attended the following courses:\n"
                            for course in profile["courses"]:
                                user_attended_courses += course["title"] + "\n"

                            learnMaterials.append({ 
                                'id': '', 
                                'title': 'Courses attended by the user' ,
                                'description': user_attended_courses ,
                                'expert_explanation': "" ,
                                'automatic_explanation': "" ,
                                'expert_keywords': "" ,
                                })
                            
                    if profile["topics"] and len(profile["topics"]) > 0:
                            answer_source = "intern"
                            user_background_knowledge = "the user has background knowledge in:\n"
                            for topic in profile["topics"]:
                                user_background_knowledge += topic["title"] + "\n"

                            learnMaterials.append({ 
                                'id': '', 
                                'title': 'Background knowledge of the user' ,
                                'description': user_background_knowledge ,
                                'expert_explanation': "" ,
                                'automatic_explanation': "" ,
                                'expert_keywords': "" ,
                                })

                if question_class == "7":
                    learnMaterials = SearchService.search_component(query, user_id)

                    if search_type == "hybrid" :
                        hybrid_search_result = SearchService.search_hybrid(query)
                        learnMaterials.extend(hybrid_search_result)
                    else:
                        learnMaterials.extend(SearchService.search_semanticly(query))

                    

                dataSection = "[DATA SECTION] : \n"
                i = 1
                for learnMaterial in learnMaterials:
                    learnMaterialData = ""
                    learnMaterialData += "learn material "+str(i)+": \n"
                    learnMaterialData += "title: " +"\n "  if learnMaterial["title"] else ""
                    learnMaterialData += learnMaterial["title"] +". \n " if learnMaterial["title"] else ""
                    learnMaterialData += "description: " +"\n " if learnMaterial["description"] else ""
                    learnMaterialData += learnMaterial["description"] +". \n " if learnMaterial["description"] else ""
                    learnMaterialData += "automatic explanation: " +"\n " if learnMaterial["automatic_explanation"] else ""
                    learnMaterialData += learnMaterial["automatic_explanation"] +". \n " if learnMaterial["automatic_explanation"] else ""
                    learnMaterialData += "expert explanation: " +"\n " if learnMaterial["expert_explanation"] else ""
                    learnMaterialData += learnMaterial["expert_explanation"] +". \n " if learnMaterial["expert_explanation"] else ""
                    learnMaterialData += "expert keywords: " +"\n " if learnMaterial["expert_keywords"] else ""
                    learnMaterialData += learnMaterial["expert_keywords"] +". \n " if learnMaterial["expert_keywords"] else ""

                    if (
                        PromptService.num_tokens(prompt + dataSection + learnMaterialData + question, model=Config.GPT_MODEL)
                        > token_budget
                    ):
                        break
                    else:
                        dataSection += learnMaterialData
                        i = i + 1


                dataSection += "[DATA SECTION] \n"
                prompt += dataSection


                #memory section
                if question_class != "6":
                    previousResponds = MessageService.get_messages(user_id, session_id)
                    previousResponds.reverse()

                    selectedMessages = []

                    memorySection = ""
                    i = 1
                    for previousRespond in previousResponds:
                        if i == 7 :
                            break
                        previousRespondMessage = ""
                        previousRespondMessage = str(len(previousResponds)-i)+"-"+previousRespond["user_name"]+":\"" +previousRespond["content"] + "\" \n"
                        expectedTokes = PromptService.num_tokens(prompt + memorySection + previousRespondMessage + question, model=Config.GPT_MODEL)
                        if (expectedTokes> token_budget):
                            break
                        else:
                            selectedMessages.append(previousRespondMessage)
                            memorySection += previousRespondMessage
                            i = i + 1

                    selectedMessages.reverse()

                    memorySection = "[MEMORY SECTION] : \n"
                    i = i + 1
                    for selectedMessage in selectedMessages:
                        if i == 7 :
                            break
                        memorySection += selectedMessage
                        i = i + 1


                    memorySection += "[MEMORY SECTION] \n"
                    prompt += memorySection


                if question_class != "6":

                    answer_source = "gpt"
                    messages = [
                        {"role": "system", "content": "You are chatbot with name DoDo for Teaching website that can answer only scientific questions \n"},
                        {"role": "system", "content": prompt},
                        {"role": "assistant", "content": "Sure! I will stick to all the information given in the [DATA SECTION]."},
                        {"role": "user", "content":  query},
                    ]

                else:
                    answer_source = "gpt"
                    messages = [
                            {"role": "system", "content": "You are chatbot with name DoDo for Teaching website that can answer only scientific questions \n"},
                            {"role": "user", "content":  information + dataSection + query},
                        ]
                    


            case _:
                answer_source = "gpt"
                messages = []


        result = {
            "messages" : messages,
            "answer_source" : answer_source,
            "hybrid_search" : len(hybrid_search_result)
        }
        return result

    @staticmethod
    def classifying_query(query):

        
        embeddingService = EmbeddingService()
        dbConnector = neo4jConnector()

        queryEmbedding = embeddingService.generate_classification_embedding(query)
        result = dbConnector.find_query_class(queryEmbedding[0])
        classObject = {}
        for x in result:
            queryClass = x['qc']
            classObject["id"] = queryClass["id"]
            classObject["className"] = queryClass["text"]
            break

        return classObject
    
    @staticmethod
    def num_tokens(text: str, model: str ):
        encoding = tiktoken.encoding_for_model(model)
        return len(encoding.encode(text))

