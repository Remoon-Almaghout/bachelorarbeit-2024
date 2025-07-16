import { Component, Input, OnInit } from '@angular/core';
import { Industry } from 'src/app/shared/models/Industry';

@Component({
  selector: 'industry-card',
  templateUrl: './industry-card.component.html',
})
export class IndustryCardComponent implements OnInit {
  @Input() industry: Industry;
  constructor() {}

  ngOnInit(): void {}
}
