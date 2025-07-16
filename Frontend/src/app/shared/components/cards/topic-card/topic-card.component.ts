import { Component, Input, OnInit } from '@angular/core';
import { EducationalPackage } from 'src/app/shared/models/EducationalPackage';
import { Topic } from 'src/app/shared/models/Topic';

@Component({
  selector: 'topic-card',
  templateUrl: './topic-card.component.html',
})
export class TopicCardComponent implements OnInit {
  @Input() topic: Topic;
  constructor() {}

  ngOnInit(): void {}
}
