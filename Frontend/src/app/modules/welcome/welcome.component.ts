import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Journey } from 'src/app/shared/models/Journey';
import { HttpService } from 'src/app/shared/services/http.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { WelcomeStep } from 'src/app/shared/models/WelcomeStep';
import { WelcomeStepMovement } from 'src/app/shared/models/WelcomeStepMovement';
import { Industry } from 'src/app/shared/models/Industry';
import { JourneyHistory } from 'src/app/shared/models/JourneyHistory';
import { AppLoaderService } from 'src/app/shared/services/app-loader.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MatomoService } from 'src/app/shared/services/matomo.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent implements OnInit {
  public journies: Journey[];
  public journeyHistory: JourneyHistory[];
  public filteredIndustryJounries: Journey[];
  public userProfile: any;
  public step: WelcomeStep;
  public movement: WelcomeStepMovement;
  public selectedIndustry: Industry;
  public isLoading: boolean;
  readonly welcomeStep: any = WelcomeStep;
  searchQueryParam : string | null | undefined = null;

  constructor(
    private httpService: HttpService,
    private snackbarService: SnackbarService,
    private appLoader: AppLoaderService,
    private router:Router, 
    private route:ActivatedRoute,
    private matomoService : MatomoService
  ) {
    this.route.queryParams.subscribe({
      next : (params)=>{
        if(params['search'])
          this.searchQueryParam = params['search'];
        else 
          this.searchQueryParam = null;
      }
    })
    //for tracking every User in Matomo
    // If there is a token, call the getUserID() method to get the UserID
    this.httpService.getUserID().subscribe(
      
      (res: any) => {
        const userId = res.user_id;
        this.matomoService.setUserIdByEmail(userId); 
      },
      error => {
        console.error('Problem with call UserID:', error);
      }
    );
    this.matomoService.trackPageView();
  }

  async ngOnInit() {
    this.step = this.welcomeStep.WELCOME_STEP_ACTION_SELECTION;

    this.isLoading = true;
    this.appLoader.open();

    await firstValueFrom(this.httpService.getJourneyHistory())
      .then((res: any) => {
        this.journeyHistory = res.data;
        this.journeyHistory = this.journeyHistory?.filter(h => h.journey_title);
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });

    await firstValueFrom(this.httpService.getUserProfile())
      .then((res: any) => {
        this.userProfile = res.data;
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });

    this.appLoader.close();
    this.isLoading = false;

    await firstValueFrom(this.httpService.getAllJournies())
      .then((res: any) => {
        this.journies = res.data;
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });
      this.matomoService.trackPageView();
  }

  goNext() {
    this.step++;
    this.movement = WelcomeStepMovement.MOVEMENT_NEXT;
    this.matomoService.trackEvent('goNextWelcomebutton','goNextWelcomeClicked','goNext');
  }

  goBack() {
    this.step--;
    this.movement = WelcomeStepMovement.MOVEMENT_BACK;
    this.matomoService.trackEvent('goBackWelcomebutton','goBackWelcomeClicked','goBack');
  }

  selectIndustry(industry: Industry) {
    this.matomoService.trackEvent('selectIndustry','selectIndustry','selectIndustry');
    this.selectedIndustry = industry;
    this.filterIndustryJournies();
    this.goNext();
    this.router.navigate(['.'], {
      relativeTo : this.route,
      queryParams : {
        search : null
      }
    });
  }

  filterIndustryJournies() {
    this.filteredIndustryJounries = this.journies.filter(
      (journey: Journey) => journey.industry === this.selectedIndustry.title
    );
  }

  handleSearchChange(event:any): void{
    this.step = 3;
  }

}
