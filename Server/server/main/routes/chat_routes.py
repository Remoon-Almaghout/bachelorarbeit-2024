from flask import session,request
from flask_socketio import emit, join_room, leave_room, rooms
from flask_socketio import SocketIO
from main.service.gpt_service import GPTService
from ..service.message_service import MessageService
from ..service.profile_service import ProfileService
from ..service.invite_service import InviteService
from ..service.session_sevice import SessionService
from ..service.file_service import FileService

from ..model.user import User
from datetime import datetime
import uuid

socketio = SocketIO(cors_allowed_origins="*",logger=True, engineio_logger=True)

#listener fired when new user is connected
@socketio.on('connect', namespace='/chat')
def on_connect(auth):
    user_id = None
    try:
        user_id = User.decode_auth_token(auth['token'].split(" ")[1])
        
    except Exception as e:
        return False
    
    ProfileService.update_sid(user_id, request.sid)
    return True

# listener fired when new session is created
@socketio.on('create_session', namespace='/chat')
def on_create_session():
    print('room joined')


# listener fired when new user want to join a session
@socketio.on('join_session', namespace='/chat')
def on_join_session(data):


    try:
        token = data['token']

        user_id = None
        user_id = User.decode_auth_token(token.split(" ")[1])
        session_id = data['session_id']
        first_time = data['first_time']

        join_room(session_id)

        sessions = SessionService.get_session_by_id(user_id, session_id)

        socketio.emit('join_session',{'status' : 'success', 'session_info' : sessions[0]}, namespace="/chat", to=session_id)

        #if user first time enter the session we want to send small message about that
        if first_time :

            user = ProfileService.get_user(user_id)

            content = user["name"]+" joined the Session"
            message = MessageService.create_message(user_id, session_id, content, 'info')

            messageBody = {
                'id': message["message_id"],
                'type': 'info',
                'content': content,
                'user': 'user',
                'user_name': user["name"],
                'created_at': datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
                'sender_message_id': '',
                'options' :[]
            }

            socketio.emit('message_recieve',{'status' : 'success', 'message' : messageBody}, namespace="/chat", to=session_id)
            
    except Exception as e:
        return False

#listener fired when expert want to leave a session
@socketio.on('leave_session', namespace='/chat')
def on_leave_session(data):


    try:
        token = data['token']

        user_id = None
        user_id = User.decode_auth_token(token.split(" ")[1])
        session_id = data['session_id']


        InviteService.update_invite_by_session(user_id, session_id, 'finished')
        SessionService.update_member_session(session_id, user_id, 'finished')



        user = ProfileService.get_user(user_id)

        content = user["name"]+" left the Session"
        message = MessageService.create_message(user_id, session_id, content, 'info')

        messageBody = {
            'id': message["message_id"],
            'type': 'info',
            'content': content,
            'user': 'user',
            'user_name': user["name"],
            'created_at': datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
            'sender_message_id': '',
            'options' :[]
        }


        socketio.emit('message_recieve',{'status' : 'success', 'message' : messageBody}, namespace="/chat", to=session_id)
        socketio.emit('leave_session',{'status' : 'success', 'message' : 'You have left the room successfully'}, namespace="/chat", to=session_id)

        
        leave_room(data['session_id'])
    except Exception as e:
        socketio.emit('leave_session',{'status' : 'error', 'message' : 'Some error occurred. Please try again.'}, namespace="/chat", to=data['session_id'])



#listener fired when user writting a message
@socketio.on('create_writting_status', namespace='/chat')
def on_create_Writting_status(data):
    try:
        token = data['token']
        user_id = User.decode_auth_token(token.split(" ")[1])
        session_id = data['session_id']
        sender_message_id = data['local_message_id']
        status = data['status']

        user = ProfileService.get_user(user_id)

        messageBody = {
            'user_name': user["name"],
            'status': status,
            'user': 'user',
            'created_at': datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
            'sender_message_id': sender_message_id
        }
        socketio.emit('writting_status_recieve',{'status' : 'success', 'message' : messageBody}, namespace="/chat", to=session_id)

    except Exception as e:
        return False
    
#listener fired when a user sending his message
@socketio.on('create_message', namespace='/chat')
def on_create_message(data):
    try:
        token = data['token']

        user_id = None
        user_id = User.decode_auth_token(token.split(" ")[1])
        session_id = data['session_id']
        content = data['content']
        type = data['type']
        sender_message_id = data['local_message_id']

        message = MessageService.create_message(user_id, session_id, content, type)
        
        user = ProfileService.get_user(user_id)

        messageBody = {
            'id': message["message_id"],
            'type': type,
            'content': content,
            'user': 'user',
            'user_name': user["name"],
            'created_at': datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
            'sender_message_id': sender_message_id,
            'options' :[]
        }
        if type == 'image' or type == 'doc':
            fileId = content.split('=')[1]
            fileInfo = FileService.get_file_info(fileId)
            messageBody['file_info'] = {
                'name' : fileInfo['name'],
                'type' : fileInfo['type']
            }


        socketio.emit('message_recieve',{'status' : 'success', 'message' : messageBody}, namespace="/chat", to=session_id)

        members = SessionService.get_members(user_id, session_id)

        if "@dodo" not in content:
            for member in members:
                socketio.emit('message_notification',{'status' : 'success', 'message' : messageBody}, namespace="/chat", to=member["sid"])


        #until now we send the user question to everyone with exception that the notification will not be send to everyone
        #if the question was only for the chatbot

        #from here we start processing the answer

        #if the creator of the session only talk with the chatbot then we create answer 
        if len(members) == 1:
            #dodo doesnt support recieving documents or images
            if type == 'image' or type == 'doc':
                return True
            

            question = content
            #sending notification that dodo is writting a message
            writtingStatusMessageBody = {
                'user_name': 'dodo',
                'status': 'typing',
                'user': 'bot',
                'created_at': datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
                'sender_message_id': str(uuid.uuid4())
            }
            socketio.emit('writting_status_recieve',{'status' : 'success', 'message' : writtingStatusMessageBody}, namespace="/chat", to=session_id)
            answerMessageBody = GPTService.find_answer(question , user_id, session_id)

        else: #if the session contain several users then the messages will be sent to the chatbot only if the user wrote @DoDo with question
            if "@dodo" in content: #if message contain tag of chatbot generate message from chatbot
                question = content.split("@dodo")[1]

                #sending notification that dodo is writting a message
                writtingStatusMessageBody = {
                    'user_name': 'dodo',
                    'status': 'typing',
                    'user': 'bot',
                    'created_at': datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
                    'sender_message_id': str(uuid.uuid4())
                }
                socketio.emit('writting_status_recieve',{'status' : 'success', 'message' : writtingStatusMessageBody}, namespace="/chat", to=session_id)


                answerMessageBody = GPTService.find_answer(question , user_id, session_id)
            
            else: #if is not @DoDo written then the chatbot will keep silent
                return True


        #at the end we will send the answer to all users in the session
        socketio.emit('message_recieve',{'status' : 'success', 'message' : answerMessageBody}, namespace="/chat", to=session_id)

        #sending notification that dodo stopped writting 
        writtingStatusMessageBody = {
            'user_name': 'dodo',
            'status': 'stopped',
            'user': 'bot',
            'created_at': datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
            'sender_message_id': str(uuid.uuid4())
        }
        socketio.emit('writting_status_recieve',{'status' : 'success', 'message' : writtingStatusMessageBody}, namespace="/chat", to=session_id)



    except Exception as e:
        return False
    
#listener fired when a user create an invite
@socketio.on('create_invite', namespace='/chat')
def on_create_invite(data):
    try:


        token = data['token']

        user_id = None
        user_id = User.decode_auth_token(token.split(" ")[1])

        expertCategory = data['expert_category']
        sessionId = data['session_id']
        localId = data['local_id']

        responseObject = InviteService.create_invite(user_id, expertCategory, sessionId)

        socketio.emit('create_invite',responseObject, namespace="/chat", to=request.sid) #response to the user who send the invite , for the target person todo

        expertSid = responseObject["expert_sid"]
        del responseObject["expert_sid"]

        responseObject["sender_local_id"] = localId
        socketio.emit('invite_recieve',responseObject, namespace="/chat", to=expertSid)

    except Exception as e:
        return False