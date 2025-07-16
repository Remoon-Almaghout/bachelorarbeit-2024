import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Course } from 'src/app/shared/models/Course';
import { EducationalPackage } from 'src/app/shared/models/EducationalPackage';
import { NodeGroup } from 'src/app/shared/models/NodeGroup';
import { Topic } from 'src/app/shared/models/Topic';
import { HttpService } from 'src/app/shared/services/http.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'exploration-topic',
  templateUrl: './exploration-topic.component.html',
})
export class ExplorationTopicComponent implements OnInit {
  @Output() select: EventEmitter<any> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Input() topicId: number;

  public menu: string[] = [
    'Information',
    'Educational Packages',
    'Explore more',
  ];
  public currentMenuSelection: string = null;
  public topic: Topic;
  public educationalPackages: EducationalPackage[];
  public isLoading: boolean;

  constructor(
    private httpService: HttpService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.init();
  }

  onChangeMenuSelection(selection: string): void {
    if (this.isLoading) {
      return;
    }

    this.currentMenuSelection = selection;
  }

  init() {
    this.currentMenuSelection = this.menu[0];
    this.getTopic();
  }

  async getTopic() {
    this.isLoading = true;

    await firstValueFrom(this.httpService.getTopic(this.topicId))
      .then((res: any) => {
        this.topic = res.data;
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });

    this.isLoading = false;
  }

  goToRelated(topic: Topic) {
    this.select.emit({
      id: topic.ID,
      title: topic.title,
      group: NodeGroup.NODE_GROUP_TOPIC,
    });

    this.topicId = topic.ID;
    this.init();
  }
}
