import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Course } from 'src/app/shared/models/Course';
import { NodeGroup } from 'src/app/shared/models/NodeGroup';

@Component({
  selector: 'explore-course-card',
  templateUrl: './explore-course-card.component.html',
})
export class ExploreCourseCardComponent implements OnInit {
  @Output() goToRelated: EventEmitter<any> = new EventEmitter();
  @Output() goToProfile: EventEmitter<any> = new EventEmitter();
  @Input() course: Course;
  constructor() {}

  ngOnInit(): void {}

  onSelect($event: any): void {
    $event.preventDefault();
    $event.stopPropagation();

    this.goToRelated.emit(this.course);
  }
}
