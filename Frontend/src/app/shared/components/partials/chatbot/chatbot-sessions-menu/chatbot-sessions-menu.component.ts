import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { firstValueFrom } from 'rxjs';
import { HttpService } from "src/app/shared/services/http.service";
import { SnackbarService } from "src/app/shared/services/snackbar.service";
import { Session } from "src/app/shared/models/Session";
import { SocketService } from "src/app/shared/services/socket.service";
import { environment } from 'src/environments/environment';
import { SessionsService } from "src/app/shared/services/sessions.service";
@Component({
    selector:'chatbot-sessions-menu',
    templateUrl:'./chatbot-sessions-menu.component.html',
    styleUrls: ['chatbot-sessions-menu.css'],
})
export class ChatbotSessionsMenu implements OnInit{
    @Output() onClose : EventEmitter<any> = new EventEmitter();
    @Output() onMenuChange: EventEmitter<any> = new EventEmitter();
    public LOGO = "/assets/images/logo.png";

    public isLoading: boolean;
    public loadingProgressEnable : boolean;
    public sessions : Session[];

    constructor(private httpService: HttpService,    
        private snackbarService: SnackbarService,
        private socketService: SocketService,
        private sessionsService: SessionsService){

    }
    ngOnInit(): void {
        this.getSessions();
        this.socketService.onNotificationRecieved().subscribe((data:any)=>{

            console.log("message notification recieved",data);
            if(data['status'] == 'success')
            {
                const message = data.message;
                if(message["sender_message_id"] == environment.localId)
                    return;

                //new messages will be loaded
                this.getSessions()

            }
            else
            {
                this.snackbarService.show(data['message'], 'danger');
            }
        });
    }

    async getSessions(){

        this.isLoading = true;

        await firstValueFrom(this.httpService.getSessions())
        .then((res: any) => {

            this.sessions = res.data;
            console.log('this.sessions',this.sessions);
            this.sessionsService.updateSessions(this.sessions);

        })
        .catch((e) => {
            this.snackbarService.show(e.error.message, 'danger');
        });

        this.isLoading = false;
    }

    close(){
        this.onClose.emit();
    }

    async createSession(){
        this.loadingProgressEnable = true
        await firstValueFrom(this.httpService.createSession())
        .then((res: any) => {

            
            if(res.status == 'success')
            {
                
                this.socketService.onSessionJoined().subscribe((data: any) => {

                    this.loadingProgressEnable = false
                    console.log("data",data);
                    if(data['status'] == 'success')
                    {

                        this.onMenuChange.emit({selected_page : 'chat' , session_id : res.data.session_id, own_session: data.session_info.own_session})
                    }
                    else
                    {
                        this.snackbarService.show(data['message'], 'danger');
                    }
        
                });
                this.socketService.joinSession(res.data.session_id);
                
 
            }

   
        })
        .catch((e) => {
            this.snackbarService.show(e.error.message, 'danger');
        });

    }

    joinSession(sessionId: string){

        this.loadingProgressEnable = true
        this.socketService.onSessionJoined().subscribe((data: any) => {

            this.loadingProgressEnable = true
            console.log("data",data);
            if(data['status'] == 'success')
            {
                this.onMenuChange.emit({selected_page : 'chat' , session_id : sessionId, own_session: data.session_info.own_session})
            }
            else
            {
                this.snackbarService.show(data['message'], 'danger');
            }

        });
        this.socketService.joinSession(sessionId);



    }

  
}