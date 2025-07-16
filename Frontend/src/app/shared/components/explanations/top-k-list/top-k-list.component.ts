import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RecommendationService } from 'src/app/shared/services/recommendation.service';
import { UserProfileService } from 'src/app/shared/services/user-profile.service';

@Component({
  selector: 'app-top-k-list',
  templateUrl: './top-k-list.component.html',
})
export class TopKListComponent implements OnInit {
  recommendations: any[] = [];
  userProfile: any;
  constructor(
    private userProfileService: UserProfileService,
    private recommendationSerice: RecommendationService
  ) {}

  async ngOnInit() {
    await firstValueFrom(this.recommendationSerice.redommendationState).then(
      (res: any) => {
        this.recommendations = [res.recommended_journey];
      }
    );

    await firstValueFrom(this.userProfileService.userProfileState).then(
      (res: any) => {
        this.userProfile = res;
      }
    );
  }
}
