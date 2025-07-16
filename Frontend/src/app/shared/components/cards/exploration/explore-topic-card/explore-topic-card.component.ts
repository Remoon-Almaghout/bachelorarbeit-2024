import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Topic } from 'src/app/shared/models/Topic';

@Component({
  selector: 'explore-topic-card',
  templateUrl: './explore-topic-card.component.html',
})
export class ExploreTopicCardComponent implements OnInit {
  @Output() goToRelated: EventEmitter<any> = new EventEmitter();
  @Output() goToProfile: EventEmitter<any> = new EventEmitter();
  @Input() topic: Topic;
  constructor() {}

  ngOnInit(): void {}

  onSelect($event: any): void {
    $event.preventDefault();
    $event.stopPropagation();

    this.goToRelated.emit(this.topic);
  }
}
