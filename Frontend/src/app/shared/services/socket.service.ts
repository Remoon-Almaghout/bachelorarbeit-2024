import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';  
import {
	HttpHeaders,
  } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class SocketService {
	constructor(private socket: Socket) { 
		this.socket.ioSocket['auth'] = { token: this.getToken() }
	}
	//used to send invite to expert
	createInvite(expertCategory: string, sessionId: string, localId: string){
		this.socket.emit('create_invite',{token: this.getToken(), expert_category: expertCategory, session_id: sessionId, local_id: localId} );
	}
	//used to send the message to the server
    createMessage(sessionId:string, content:string, type: string, localMessageId: string){
		this.socket.emit('create_message',{token: this.getToken(), session_id: sessionId, content: content, type: type, local_message_id: localMessageId} );
    }

	//used to send small notification to other users inside the session that the user is writting his words
	sendWrittingStatus(sessionId:string, status: string, localMessageId: string){
		this.socket.emit('create_writting_status',{token: this.getToken(), session_id: sessionId, status: status, local_message_id: localMessageId} );
	}
	//used to join session
	joinSession(sessionId:string, firstTime: boolean = false) {
		this.socket.emit('join_session', {token: this.getToken(), session_id: sessionId, first_time: firstTime});
	}

	//used to leave a session
	leaveSession(sessionId:string) {
		this.socket.emit('leave_session', {token: this.getToken(), session_id: sessionId});
	} 


	//fired when feedback recieved from server that invite has been created
	onInviteCreated(){
		return this.socket.fromEvent('create_invite');
	}
	//fired when invite recieved
	onInviteRecieved(){
		return this.socket.fromEvent('invite_recieve');
	}
	//fired when notification recieved
	onNotificationRecieved(){
		return this.socket.fromEvent('message_notification');
	}
	//fired when the user left the session
	onSessionLeft() {
		return this.socket.fromEvent('leave_session');
	}
	//fired when the user successfully joined to the session
	onSessionJoined() {
		return this.socket.fromEvent('join_session');
	}
	//fired when the created message in the server has been created
	onMessageCreated(){
		return this.socket.fromEvent('create_message');
	}
	//fired when message recieved
	onMessageRecieved(){
		return this.socket.fromEvent('message_recieve');
	}
	//fired when writting notification recieved
	onWrittingStatusRecieved(){
		return this.socket.fromEvent('writting_status_recieve');
	}
	
	private getToken() {
		if (localStorage.getItem('token') != null) {
			let token = 'Bearer ' + localStorage.getItem('token');
			return token
		}
		return null;
	  }

}