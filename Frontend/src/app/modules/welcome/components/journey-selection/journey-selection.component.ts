import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, firstValueFrom, map, startWith } from 'rxjs';
import { Journey } from 'src/app/shared/models/Journey';
import { HttpService } from 'src/app/shared/services/http.service';
import { MatomoService } from 'src/app/shared/services/matomo.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'journey-selection',
  templateUrl: './journey-selection.component.html',
})
export class JourneySelectionComponent implements OnInit {
  @Output() goBack: EventEmitter<any> = new EventEmitter();
  
  // Journeys that are displayed at the top
  @Input() filteredIndustryJounries: Journey[] = [];
  // Already displayed journey cards
  @Input() displayJourneys: Journey[] = [];
  @Input('searchQueryParam') searchQueryParam : string | null | undefined = null;
  // All Journeys in the database
  @Input('allJourneys') allJourneys : Journey[] = [];
  // current dropdown journeys
  journeys : Journey[] = [];

 industryName :string =''

  searchFormControl=new FormControl();
  public filteredSearchOptions: Observable<any>;
  constructor(private router: Router, private httpService:HttpService,private snackbarService:SnackbarService, private matomoService : MatomoService) {

  }

  ngOnChanges(): void{
  }

  ngOnInit(): void {
    
    this.journeys = [...this.allJourneys];
    this.displayJourneys = [...this.filteredIndustryJounries];
    this.industryName = this.displayJourneys[0].industry
    this.searchFormControl.valueChanges.subscribe({
      next : (val)=>{
        if(val){
          this.journeys = this.allJourneys.filter((ele:any) => ele.title?.toLowerCase().includes(val));
        }
        else 
        this.journeys = [...this.allJourneys];
      }
    })
  }

  selectJourney(journey: Journey) {
    this.matomoService.trackEvent('selectJourneyButton','selectJourneyClicked','selectJourney');
    this.router.navigateByUrl(
      `/dashboard?journey_id=${journey.ID}&journey_title=${journey.title}`
    );
  }

  async searchJourneys(searchTerm: string) {

    this.matomoService.trackSearchQuery(searchTerm);
    if (!searchTerm) {
      this.displayJourneys = [...this.filteredIndustryJounries];
      return;
    }
    const searchResultJourneys = this.allJourneys.filter((j: Journey) => j.title?.toLowerCase()?.includes(searchTerm.toLowerCase()));
    
    if(!searchResultJourneys.length){
      await firstValueFrom(this.httpService.getRecommendations({journey_id:1,journey_title:""}))
      .then((res: any) => {
        let returnedJourneys : any[] = [];
        if(res?.data?.length){
          res?.data?.forEach((j:any)=>{
            returnedJourneys.push({
              ID : j?.recommended_journey?.id,
              title : j?.recommended_journey?.title,
            })
            
          })
          
        }
        this.displayJourneys=[...returnedJourneys];
        
        
      })
      .catch((e) => {
        this.snackbarService.show(e.error?.message, 'danger');
      });
    }
    else{
     this.displayJourneys=[...searchResultJourneys] 
  }
  }
}
