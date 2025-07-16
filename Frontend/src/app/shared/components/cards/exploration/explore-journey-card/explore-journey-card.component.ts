import { Component, Input, OnInit } from '@angular/core';
import { Journey } from 'src/app/shared/models/Journey';

@Component({
  selector: 'explore-journey-card',
  templateUrl: './explore-journey-card.component.html',
})
export class ExploreJourneyCardComponent implements OnInit {
  @Input() journey: Journey;
  constructor() {}

  ngOnInit(): void {}
}
