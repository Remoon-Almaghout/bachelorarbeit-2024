import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExploreStep } from 'src/app/shared/models/ExploreStep';

@Component({
  selector: 'exploration-breadcrumb',
  templateUrl: './exploration-breadcrumb.component.html',
})
export class ExplorationBreadcrumbComponent implements OnInit {
  @Output() goToBreadCrumb: EventEmitter<any> = new EventEmitter();
  @Input() history: ExploreStep[];
  constructor() {}

  ngOnInit(): void {}
}
