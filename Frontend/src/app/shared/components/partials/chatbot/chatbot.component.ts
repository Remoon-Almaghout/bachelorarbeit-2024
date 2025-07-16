import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.css']
})
export class ChatBot implements OnInit {

  public chatBotMenuAppeared = false
  public notificationMenuAppeared = false;
  public speechMenuAppeared = false;
  public fadeInState : boolean = false
  constructor() {}

  ngOnInit(): void {

  
  }

  showChatBotMenu()
  {
    this.chatBotMenuAppeared = !this.chatBotMenuAppeared;

    if(this.chatBotMenuAppeared)
      this.notificationMenuAppeared = false;

  }

  showHideNotification(show: boolean){
    if(!this.chatBotMenuAppeared)
    this.notificationMenuAppeared = show;

  }

  showHideSpeechMenu(){
    this.speechMenuAppeared = !this.speechMenuAppeared;

  }
}
