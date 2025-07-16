import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpService } from "src/app/shared/services/http.service";
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { InvitesService } from 'src/app/shared/services/invites.service';
import { SessionsService } from 'src/app/shared/services/sessions.service';
import { Invite } from 'src/app/shared/models/Invite';
import { Session } from 'src/app/shared/models/Session';
import { RecommendationService } from 'src/app/shared/services/recommendation.service';
import { SocketService } from "src/app/shared/services/socket.service";
import { UserProfileService } from 'src/app/shared/services/user-profile.service';
@Component({
  selector: 'chatbot-welcome-menu',
  templateUrl: './chatbot-welcome-menu.component.html',
  styleUrls: ['chatbot-welcome-menu.css'],
})
export class ChatbotWelcomeMenu implements OnInit {
  @Output() onClose : EventEmitter<any> = new EventEmitter();
  @Output() onMenuChange: EventEmitter<any> = new EventEmitter();
  @Output() onTabSelected: EventEmitter<any> = new EventEmitter();
  @Input()  expert : boolean;
  public LOGO = "/assets/images/logo.png";
  public userImg = "/assets/images/unknown_user.png";
  public loadingProgressEnable = false;
  public latestInvite : Invite;
  public latestSession : Session;
  public userName : string = ''
  constructor(private httpService: HttpService,
              private snackbarService: SnackbarService,
              private invitesService: InvitesService,
              private sessionService: SessionsService,
              private socketService: SocketService,
              private recommendationService: RecommendationService,
              private userProfileService :UserProfileService) {}

  async ngOnInit() {

     firstValueFrom(this.invitesService.invitesState).then(
      (res: any) => {

        console.log("invites",res);
        this.latestInvite = res[0];
      }
    );

     firstValueFrom(this.sessionService.sessionsState).then(
      (res: any) => {
        console.log("sessions",res);

        this.latestSession = res[0];
      }
    );

     firstValueFrom(this.recommendationService.redommendationState).then(
      (res: any) => {
        console.log("recommendationService",res);
      }
    );


    await firstValueFrom(this.userProfileService.userProfileState).then(
      (res: any) => {
        this.userName = res.name
      }
    );
    
  }

  close(): void{
    this.onClose.emit();
  }

  async createSession(){
    this.loadingProgressEnable = true
    await firstValueFrom(this.httpService.createSession())
    .then((res: any) => {


        if(res.status == 'success')
        {

          this.socketService.onSessionJoined().subscribe((data: any) => {

            console.log("data",data);
            this.loadingProgressEnable = false;
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

}
 