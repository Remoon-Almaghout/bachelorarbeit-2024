import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
ischatbot: boolean=false ; 
displayChatbot (){
  this.ischatbot = !this.ischatbot;
}

}
