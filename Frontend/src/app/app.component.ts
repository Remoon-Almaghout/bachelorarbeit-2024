import { Component } from '@angular/core';
import { NavigationStart, Route, RouteConfigLoadStart, Router } from '@angular/router';
import { AuthService } from './shared/services/auth.service';
import { TopbarService } from './shared/services/topbar.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
constructor(private topbarService:TopbarService, private router: Router){}
showBar:boolean=true;
folding:boolean=true;
loading : boolean = false;
ngOnInit(){

  this.router.events.subscribe({
    next : (ev) =>{
      if(ev instanceof NavigationStart || ev instanceof RouteConfigLoadStart){
        this.loading = true;
      }
      else{
        setTimeout(()=>{
          this.loading = false;
        }, 2000)
      }
    }
  })

  this.topbarService.showNavBar.subscribe(res=>{
    this.showBar=res
  })
  }
}
