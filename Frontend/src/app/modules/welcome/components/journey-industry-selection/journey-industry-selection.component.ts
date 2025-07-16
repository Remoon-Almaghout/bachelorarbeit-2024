import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, map, startWith } from 'rxjs';
import { Observable } from 'rxjs';
import { Industry } from 'src/app/shared/models/Industry';
import { Journey } from 'src/app/shared/models/Journey';
import { HttpService } from 'src/app/shared/services/http.service';
import { MatomoService } from 'src/app/shared/services/matomo.service';
import { RecommendationService } from 'src/app/shared/services/recommendation.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'journey-industry-selection',
  templateUrl: './journey-industry-selection.component.html',
})
export class JourneyIndustrySelectionComponent implements OnInit {
  @Output() selectIndustry: EventEmitter<any> = new EventEmitter();
  @Output() goBack: EventEmitter<any> = new EventEmitter();
  @Input() journies: Journey[];
  public industries: Industry[];
  searchFormControl=new FormControl();
  @Input('searchQueryParam') searchQueryParam : string | null | undefined = null;
  @Output('customSearchChange') customSearchChange: EventEmitter<any> = new EventEmitter();
  constructor(private recommendationService:RecommendationService,private httpService:HttpService,private snackbarService:SnackbarService, private router:Router, private route:ActivatedRoute, private matomoService : MatomoService) {
    
  }
  public filteredSearchOptions: Observable<any>;
  private initSearchFilter() {
    this.filteredSearchOptions =this.searchFormControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }
  private _filter(value: string): any {
    const filterValue = value.toLowerCase();
    return this.allIndustries.filter((ele:any) => ele.title.toLowerCase().includes(filterValue));
  }
  
   ngOnInit(){
  
    this.searchIndustry();
    this.initSearchFilter();
  }

  searchIndustry() {
    this.industries = [];

    this.journies.forEach((journey: Journey) => {
      if (journey.industry) {
        const index = this.industries.findIndex(
          (industry: Industry) => industry.title === journey.industry
        );

        if (index === -1) {
          const industry: Industry = { id: null, title: journey.industry };
          this.industries.push(industry);
        }
      }
      this.allIndustries=this.industries;
    });
  }
  allIndustries:any=[];
  searchResultIndustries:any=[]
  async searchIndustries(searchTerm: string) {
    this.matomoService.trackSearchQuery(searchTerm);
    if (!searchTerm) {
      this.industries=this.allIndustries;
      this.router.navigate(['.'], {
        relativeTo : this.route,
        queryParams : {
          search : null
        }
      })
      return;
    }
    const searchResultIndustries = this.allIndustries.filter((industry: Industry) => industry.title.toLowerCase().includes(searchTerm.toLowerCase()));
    if(!searchResultIndustries.length){
      await firstValueFrom(this.httpService.getRecommendations({journey_id:1,journey_title:""}))
      .then((res: any) => {
        const returnedJourneys = res.data[0];
        let recommend=[{id:res.data[0].recommended_journey.id,title:res.data[0].recommended_journey.industry}]
        this.industries=recommend;
        this.selectIndustry.emit(recommend[0]);
        this.router.navigate(['.'], {
          relativeTo : this.route,
          queryParams : {
            search : null
          }
        })
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });
    }
    else{
    this.industries=searchResultIndustries;
    this.router.navigate(['.'], {
      relativeTo : this.route,
      queryParams : {
        search : searchTerm
      }
    })
  }
  }
}
