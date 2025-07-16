import { Component, Input, OnInit } from '@angular/core';
import { Recommendation } from 'src/app/shared/models/Recommendation';

@Component({
  selector: 'exploration-information-recommendation',
  templateUrl: './exploration-information-recommendation.component.html',
})
export class ExplorationInformationRecommendationComponent implements OnInit {
  @Input() recommendation: Recommendation;
  constructor() {}

  ngOnInit(): void {}
}
