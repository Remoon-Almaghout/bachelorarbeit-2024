import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UserProfileService } from 'src/app/shared/services/user-profile.service';

@Component({
  selector: 'chatbot-main-menu',
  templateUrl: './chatbot-main-menu.component.html',
  styleUrls: ['chatbot-main-menu.css'],
})
export class ChatbotMainMenu implements OnInit {
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() showHideSpeechMenu: EventEmitter<any> = new EventEmitter();
  
  public selectedMenu : string = 'start'
  public currentSessionId : string =''
  public ownSession : boolean = true
  public expert : boolean = false
  constructor(private userProfileService: UserProfileService) {}

  async ngOnInit() {
    await firstValueFrom(this.userProfileService.userProfileState).then(
      (res: any) => {
        this.expert = res.expert
      }
    );
  }

  onMenuChange(params : any): void{
    this.selectedMenu = params.selected_page;
    this.currentSessionId = ('session_id' in params) ? params.session_id : ''
    this.ownSession = params.own_session
  }

}
 