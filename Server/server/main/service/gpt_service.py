
from ..config import Config
from main.service.prompt_service import PromptService
from ..service.message_service import MessageService
from ..service.statistic_service import StatisticService
from datetime import datetime

import uuid
import openai
import logging
import time

from langdetect import detect

class GPTService:
    @staticmethod
    def get_answer(message):
        openai.api_key = Config.OPENAI_KEY

        try:
            response = openai.ChatCompletion.create(
                model=Config.GPT_MODEL,
                messages=message,
                temperature=0,
                top_p=1,
                frequency_penalty=0,
                presence_penalty=0
            )
            answer = response["choices"][0]["message"]["content"]
            return answer
        except Exception as ex:
            logging.error(ex)


    

    @staticmethod
    def find_answer(question, user_id, session_id, called_twice= False):
        
        try:
            start_time = time.perf_counter()
            answerMessageId = ''
            answerContent = ''
            answerOptions = []
            answerType = ''

            lang = detect(question)

            
            result = PromptService.generate_prompt_message("clarification", question, user_id, session_id)
            clarifiedQuestion = GPTService.get_answer(result["messages"])

            result = PromptService.generate_prompt_message("classification", clarifiedQuestion)
            questionClass = GPTService.get_answer(result["messages"])
            
            result = PromptService.generate_prompt_message("answer", clarifiedQuestion, user_id, session_id, questionClass)
            answerContent = GPTService.get_answer(result["messages"]) if result["answer_source"] == "gpt" else result["messages"][0]
            

            if "the user is asking for an expert" in answerContent.lower() or "der benutzer bittet um einen experten" in answerContent.lower():
                
                if lang == "de":
                    answerContent = "Sie können eine Einladung an einen Experten senden, indem Sie auf die folgenden Schaltflächen drücken:"
                else:
                    answerContent = "You can send invite to an expert by pressing on the following buttons: "

                answerMessage = MessageService.create_message(9003, session_id, answerContent, "invite")
                answerOptions = answerMessage["options"]
                answerType = 'invite'
            elif "no information" in answerContent.lower() or result["hybrid_search"] == 0:

                result = PromptService.generate_prompt_message("answer", clarifiedQuestion, user_id, session_id, questionClass, "semantically")
                answerContent = GPTService.get_answer(result["messages"])
                
                if "no information" in answerContent.lower():

                    if lang == "de":
                        answerContent = "Entschuldigung, aber ich konnte keine Informationen zu Ihrer Anfrage finden. Könnten Sie bitte Ihre Frage klären? Alternativ könnten Sie in Erwägung ziehen, einen Experten für detailliertere Informationen zu kontaktieren."
                    else:
                        answerContent = "Apologies, but I could not locate information relating to your query. Could you please clarify your question? Alternatively, you might consider contacting an expert for more detailed information."
                        
                    answerMessage = MessageService.create_message(9003, session_id, answerContent, "invite")
                    answerOptions = answerMessage["options"]
                    answerType = 'invite'
                else:
                    answerMessage = MessageService.create_message(9003, session_id, answerContent, "text")
                    answerType = 'text'

            else:
                answerMessage = MessageService.create_message(9003, session_id, answerContent, "text")
                answerType = 'text'

                
            answerMessageId = answerMessage["message_id"]


            end_time = time.perf_counter()
            elapsed_time = end_time - start_time
            
            StatisticService.store_statistic(user_id, question, clarifiedQuestion, questionClass, answerContent, elapsed_time )

            
            answerMessageBody = {
                'id': answerMessageId,
                'type': answerType,
                'content': answerContent,
                'user': 'bot',
                'user_name': 'dodo',
                'created_at': datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
                'sender_message_id': str(uuid.uuid4()),
                'options' :answerOptions
            }

            return answerMessageBody
        except Exception as ex:

            if not called_twice:
                time.sleep(2)
                called_twice = True
                return  GPTService.find_answer(question, user_id, session_id, called_twice)

            else:

                answerMessageId = str(uuid.uuid4())
                answerType = "text"
                answerContent = "Oops! I am encountering some difficulties while finding an answer to your question. Please rewrite your question, and I will ensure to provide an answer."
                answerOptions = []
                answerMessageBody = {
                    'id': answerMessageId,
                    'type': answerType,
                    'content': answerContent,
                    'user': 'bot',
                    'user_name': 'dodo',
                    'created_at': datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
                    'sender_message_id': str(uuid.uuid4()),
                    'options' :answerOptions
                }
                return answerMessageBody
