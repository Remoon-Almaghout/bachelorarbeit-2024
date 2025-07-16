import { Component, Input, OnInit } from '@angular/core';
import { Course } from 'src/app/shared/models/Course';

@Component({
  selector: 'exploration-information-course',
  templateUrl: './exploration-information-course.component.html',
})
export class ExplorationInformationCourseComponent implements OnInit {
  @Input() course: Course;
  @Input() isLoading: boolean;
  constructor() {}

  ngOnInit(): void {}
}
