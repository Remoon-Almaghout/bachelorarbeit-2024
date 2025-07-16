import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Course } from 'src/app/shared/models/Course';
import { NodeGroup } from 'src/app/shared/models/NodeGroup';
import { Topic } from 'src/app/shared/models/Topic';
import { HttpService } from 'src/app/shared/services/http.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'exploration-topics',
  templateUrl: './exploration-topics.component.html',
})
export class ExplorationTopicsComponent implements OnInit {
  @Output() select: EventEmitter<any> = new EventEmitter();
  @Input() course: Course;

  public topics: Topic[];
  public isLoading: boolean;

  constructor(
    private httpService: HttpService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.getTopics();
  }

  async getTopics() {
    this.isLoading = true;

    await firstValueFrom(this.httpService.getTopicsByCourse(this.course.ID))
      .then((res: any) => {
        this.topics = res.data;
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });

    this.isLoading = false;
  }

  onClick(topic: Topic) {
    this.select.emit({
      id: topic.ID,
      title: topic.title,
      group: NodeGroup.NODE_GROUP_TOPIC,
    });
  }
}
