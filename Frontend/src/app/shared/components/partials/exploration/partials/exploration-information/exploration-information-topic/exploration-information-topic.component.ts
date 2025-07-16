import { Component, Input, OnInit } from '@angular/core';
import { Topic } from 'src/app/shared/models/Topic';

@Component({
  selector: 'exploration-information-topic',
  templateUrl: './exploration-information-topic.component.html',
})
export class ExplorationInformationTopicComponent implements OnInit {
  @Input() topic: Topic;
  @Input() isLoading: boolean;
  constructor() {}

  ngOnInit(): void {}
}
