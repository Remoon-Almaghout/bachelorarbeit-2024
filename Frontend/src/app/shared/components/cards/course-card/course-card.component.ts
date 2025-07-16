import { Component, Input, OnInit } from '@angular/core';
import { Course } from 'src/app/shared/models/Course';

@Component({
  selector: 'course-card',
  templateUrl: './course-card.component.html',
})
export class CourseCardComponent implements OnInit {
  @Input() course: Course;
  constructor() {}

  ngOnInit(): void {}
}
