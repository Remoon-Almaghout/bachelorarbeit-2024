import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Course } from 'src/app/shared/models/Course';
import { Recommendation } from 'src/app/shared/models/Recommendation';

@Component({
  selector: 'exploration-recommendation',
  templateUrl: './exploration-recommendation.component.html',
})
export class ExplorationRecommendationComponent implements OnInit {
  @Output() select: EventEmitter<any> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Input() recommendation: Recommendation;
  public menu: string[] = ['Information', 'Courses', 'Explore more'];
  public currentMenuSelection: string = null;
  public courses: Course[];

  constructor() {}

  ngOnInit(): void {
    this.init();
  }

  onChangeMenuSelection(selection: string): void {
    this.currentMenuSelection = selection;
  }

  init() {
    this.currentMenuSelection = this.menu[0];
    this.courses = this.recommendation.courses;
  }
}
