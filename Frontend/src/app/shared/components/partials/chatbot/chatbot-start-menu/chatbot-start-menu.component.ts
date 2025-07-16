import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { MatTabChangeEvent } from "@angular/material/tabs";

@Component({
    selector:'chatbot-start-menu',
    templateUrl:'./chatbot-start-menu.component.html',
    styleUrls: ['chatbot-start-menu.css'],
})
export class ChatbotStartMenu implements OnInit{
    @Output() onClose : EventEmitter<any> = new EventEmitter();
    @Output() onMenuChange : EventEmitter<any> = new EventEmitter();
    @Input() show : boolean= false;
    @Input() expert : boolean= false;

    public selectedTabIndex : number = 0;

    constructor() {}
  
    ngOnInit() : void {

    }
  
    tabChange(selectedTab : number): void{
      this.selectedTabIndex = selectedTab;
    }

    onTabChange(event: MatTabChangeEvent) {
      this.selectedTabIndex = event.index
  }


    close()
    {
      this.show = false;
    }
}