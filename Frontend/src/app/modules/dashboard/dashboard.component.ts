import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppLoaderService } from 'src/app/shared/services/app-loader.service';
import { HttpService } from 'src/app/shared/services/http.service';
import { RecommendationService } from 'src/app/shared/services/recommendation.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { UserProfileService } from 'src/app/shared/services/user-profile.service';
import registeredPanelComponents from './registeredPanelComponents';
import { MatomoService } from 'src/app/shared/services/matomo.service';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  public registeredPanelComponents: any = registeredPanelComponents;
  public isLoading: boolean;
  public journeyId: number;
  public journeyTitle: string;
  constructor(
    private httpService: HttpService,
    private matomoService : MatomoService,
    private appLoader: AppLoaderService,
    private snackbarService: SnackbarService,
    private route: ActivatedRoute,
    private userProfielService: UserProfileService,
    private recommendationService: RecommendationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.journeyId = +params['journey_id'];
      this.journeyTitle = params['journey_title'];

      this.load();
    });
    this.matomoService.trackPageView();
  }

  async load() {
    this.isLoading = true;
    this.appLoader.open();

    const data = {
      journey_id: this.journeyId,
      journey_title: this.journeyTitle,
    };

    await firstValueFrom(this.httpService.getRecommendations(data))
      .then((res: any) => {
        this.recommendationService.updateRecommendations(res.data[0]);
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });

    await firstValueFrom(this.httpService.getUserProfile())
      .then((res: any) => {
        this.userProfielService.updateUserProfile(res.data);
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });

    this.isLoading = false;
    this.appLoader.close();
  }

}
