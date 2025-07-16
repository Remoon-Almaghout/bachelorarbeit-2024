import { Component, Input, OnInit } from '@angular/core';
import { JourneyHistory } from 'src/app/shared/models/JourneyHistory';

@Component({
  selector: 'journey-history-card',
  templateUrl: './journey-history-card.component.html',
})
export class JourneyHistoryCardComponent implements OnInit {
  @Input() journeyHistory: JourneyHistory;
  constructor() {}

  ngOnInit(): void {}
}
