import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { firstValueFrom } from 'rxjs';
import { HttpService } from "src/app/shared/services/http.service";
import { SnackbarService } from "src/app/shared/services/snackbar.service";
import { SocketService } from "src/app/shared/services/socket.service";
import { Invite } from "src/app/shared/models/Invite";
import { environment } from 'src/environments/environment';
import { InvitesService } from "src/app/shared/services/invites.service";

@Component({
    selector:"chatbot-requests-menu",
    templateUrl:"./chatbot-requests-menu.component.html",
    styleUrls:["chatbot-requests-menu.css"]
})
export class ChatbotRequestsMenu implements OnInit{
    @Output() onClose : EventEmitter<any> = new EventEmitter();
    @Output() onMenuChange: EventEmitter<any> = new EventEmitter();
    public LOGO = "/assets/images/unknown_user.png";
    public isLoading: boolean;
    public loadingProgressEnable: boolean;
    public invites: Invite[];

    constructor(private httpService: HttpService,    
        private snackbarService: SnackbarService,
        private socketService: SocketService,
        private invitesService: InvitesService){}
    ngOnInit(): void {
        this.getRequests()
        this.socketService.onInviteRecieved().subscribe((data:any) => {

            console.log("invite_recieved",data);
            if(data['status'] == 'success')
            {

                if(data["sender_local_id"] == environment.localId)
                    return;

                //new invites will be loaded
                this.getRequests()

            }
            else
            {
                this.snackbarService.show(data['message'], 'danger');
            }
        })

    }

    async getRequests()
    {
        await firstValueFrom(this.httpService.getInvites())
        .then((res: any) => {
            this.invites = res.data;
            this.invitesService.updateInvites(this.invites)
        })
        .catch((e) => {
            this.snackbarService.show(e.error.message, 'danger');
        });

        this.isLoading = false;
    }
    close(){
        this.onClose.emit();
    }

    async acceptRequest(inviteId : string, sessionId: string){

        this.loadingProgressEnable = true;
        const updateBody : any = {
            invite_id : inviteId,
            session_id: sessionId,
            status : 'accepted'
        }
        await firstValueFrom(this.httpService.updateInvite(updateBody))
        .then((res: any) => {
            if(res.status == 'success')
            {
                this.socketService.onSessionJoined().subscribe((data: any) => {

                    console.log("data",data);
                    if(data['status'] == 'success')
                    {
                        this.loadingProgressEnable = false;
                        this.onMenuChange.emit({selected_page : 'chat' , session_id : sessionId, own_session: data.session_info.own_session})
                    }
                    else
                    {
                        this.snackbarService.show(data['message'], 'danger');
                    }
        
                });
                this.socketService.joinSession(sessionId, true);

            }
        })
        .catch((e) => {
            this.snackbarService.show(e.error.message, 'danger');
        });
    }

    async refuseRequest(inviteId : string, sessionId: string){

        this.loadingProgressEnable = true;

        const updateBody : any = {
            invite_id : inviteId,
            session_id: sessionId,
            status : 'refused'
        }

        await firstValueFrom(this.httpService.updateInvite(updateBody))
        .then((res: any) => {

            this.loadingProgressEnable = false;

            if(res.status == 'success')
            {
                this.getRequests()
            }
        })
        .catch((e) => {
            this.snackbarService.show(e.error.message, 'danger');
        });
    }
}