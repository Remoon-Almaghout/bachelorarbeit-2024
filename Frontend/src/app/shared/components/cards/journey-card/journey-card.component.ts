import { Component, Input, OnInit } from '@angular/core';
import { Journey } from 'src/app/shared/models/Journey';

@Component({
  selector: 'journey-card',
  templateUrl: './journey-card.component.html',
})
export class JourneyCardComponent implements OnInit {
  @Input() journey: Journey;
  constructor() {}

  ngOnInit(): void {}
}
