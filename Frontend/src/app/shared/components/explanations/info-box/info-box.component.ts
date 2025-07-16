import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Course } from 'src/app/shared/models/Course';
import { Topic } from 'src/app/shared/models/Topic';
import { RecommendationService } from 'src/app/shared/services/recommendation.service';
import { UserProfileService } from 'src/app/shared/services/user-profile.service';

@Component({
  selector: 'info-box',
  templateUrl: './info-box.component.html',
})
export class InfoBoxComponent implements OnInit {
   userProfile: any;
   recommendation: any;
   labels: string[] = [];
   journey_id : string | null = null;
   journey_title : string | null = null;

  constructor(
    private userProfileService: UserProfileService,
    private recommendationSerice: RecommendationService,
    private route : ActivatedRoute,
    private router:Router
  ) {

    this.route.queryParamMap.subscribe({
      next : (params: ParamMap)=>{
        if(params.get('journey_id'))
          this.journey_id = params.get('journey_id');
        else
          this.journey_id = null;
          if(params.get('journey_title'))
          this.journey_title = params.get('journey_title');
        else
          this.journey_title = null;
      }
    })

  }
  isDiagramPage:boolean;

  
  async ngOnInit() {
    if(this.router.url?.includes('/diagram')){
      this.isDiagramPage=true
    }
    await firstValueFrom(this.recommendationSerice.redommendationState).then(
      (res: any) => {
        this.recommendation = res;
      }
    );
    await firstValueFrom(this.userProfileService.userProfileState).then(
      (res: any) => {
        this.userProfile = res;
      }
    );

    this.buildLables();
  }

  buildLables() {
    this.userProfile.courses.forEach((course: Course) => {
      this.labels.push('Course: ' + course.title);
    });

    this.userProfile.topics.forEach((topic: Topic) => {
      this.labels.push('Topic: ' + topic.title);
    });

    if (this.userProfile.graph_exploration_preference) {
      this.labels.push('Focus on final goal');
    } else {
      this.labels.push('Explore more content');
    }

    this.labels.push(`Number of weeks: ${this.userProfile.number_of_weeks}`);
    this.labels.push(
      `Number of hours per week: ${this.userProfile.number_of_hours_per_week}`
    );
  }

}
