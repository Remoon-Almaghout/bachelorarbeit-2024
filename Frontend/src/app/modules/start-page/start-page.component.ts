import { Component } from '@angular/core';
import { TopbarService } from 'src/app/shared/services/topbar.service';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.css']
})
export class StartPageComponent {

  constructor(private topbarService:TopbarService){

  }
  
  ngOnInit(): void {
    this.topbarService.hide();
  }

}
