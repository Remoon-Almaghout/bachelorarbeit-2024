import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Course } from 'src/app/shared/models/Course';
import { NodeGroup } from 'src/app/shared/models/NodeGroup';

@Component({
  selector: 'exploration-courses',
  templateUrl: './exploration-courses.component.html',
})
export class ExplorationCoursesComponent implements OnInit {
  @Output() select: EventEmitter<any> = new EventEmitter();
  @Input() courses: Course[];
  constructor() {}

  ngOnInit(): void {}

  onClick(course: Course) {
    this.select.emit({
      id: course.ID,
      title: course.title,
      group: NodeGroup.NODE_GROUP_COURSE,
    });
  }
}
