import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { SocketService } from "src/app/shared/services/socket.service";
import { environment } from 'src/environments/environment';
@Component({
    selector: 'chatbot-notification-menu',
    templateUrl: './chatbot-notification-menu.component.html',
    styleUrls: ['chatbot-notification-menu.css'],
})

export class ChatbotNotificationMenu implements OnInit {
    @Output() showHideNotification : EventEmitter<any> = new EventEmitter();
    public LOGO = "/assets/images/logo.png";
    public notificationMenuAppeared : boolean = true;
    public notificationMessage : string ;
    constructor(private socketService: SocketService,) {}
  
    ngOnInit(): void {
        this.socketService.onNotificationRecieved().subscribe((data:any)=>{

            console.log("message notification recieved",data);
            if(data['status'] == 'success')
            {
                const message = data.message;
                if(message["sender_message_id"] == environment.localId)
                    return;

                this.notificationMessage = "Hi 😊, you have recieved new messages, click bellow to see"
                this.showHideNotification.emit(true);
            }
        });
        this.socketService.onInviteRecieved().subscribe((data:any) => {

            console.log("invite_recieved",data);
            if(data['status'] == 'success')
            {

                if(data["sender_local_id"] == environment.localId)
                    return;

                this.notificationMessage = "Hi 😊, you have recieved new invites, click bellow to see"
                this.showHideNotification.emit(true);
            }
        })
    }

    close(){
        this.showHideNotification.emit(false);
    }
  
  }