import { R } from '@angular/cdk/keycodes';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { JourneyHistory } from 'src/app/shared/models/JourneyHistory';
import { HttpService } from 'src/app/shared/services/http.service';
import { MatomoService } from 'src/app/shared/services/matomo.service';

@Component({
  selector: 'welcome-action-selection',
  templateUrl: './welcome-action-selection.component.html',
})
export class WelcomeActionSelectionComponent implements OnInit {
  @Output() goNext: EventEmitter<any> = new EventEmitter();
  @Input() journeyHistory: JourneyHistory[];
  @Input() disableJourney: boolean;
  userCurrentStep : number = 1;
  constructor(private router: Router,private httpService:HttpService, private matomoService : MatomoService) {}
newUser:boolean;
userName:string='';
continueJourneyId : string | null = null;
continueJourneyTitle : string | null = null;
  ngOnInit(): void {
  this.matomoService.trackPageView();

  this.getUserCurrentStep();
  this.httpService.getUserJourney().subscribe((res:any)=>{
    if(!res.data || res.data.length==0){
      this.newUser=true
    }
  })

  this.httpService.getUserProfile().subscribe((res:any)=>{
    this.userName=res.data.name
  })

  this.httpService.getLastJourneyID().subscribe({
    next : (res:any)=>{
      this.continueJourneyId = res?.journey_id?.ID;
      this.continueJourneyTitle = res?.journey_id?.title;
      console.log(this.continueJourneyId);
      console.log(this.continueJourneyTitle)
    }
  })

}

  selectJourneyHistory(item: JourneyHistory) {
    this.matomoService.trackEvent('JourneyHistoryButton','JourneyHistoryClicked','JourneyHistory');
    this.router.navigateByUrl(
      `/dashboard?journey_id=${item.journey_id}&journey_title=${item.journey_title}`
    );
  }
  next() {
    this.matomoService.trackEvent('nextToPageComponentInWelcomeButton','nextClicked','next');
    if (this.disableJourney) {
      return;
    }
    this.goNext.emit();
  }
  nextifId(){

    if (this.disableJourney||this.newUser) {
      return;
    }
    else{
      this.router.navigateByUrl('learning-package')
    }
    this.goNext.emit();
  }


  getUserCurrentStep(): void{
    this.httpService.getCurrentSite().subscribe({
      next : (res:any)=>{
        this.userCurrentStep = res?.current_site;
      }
    })
  }

}
