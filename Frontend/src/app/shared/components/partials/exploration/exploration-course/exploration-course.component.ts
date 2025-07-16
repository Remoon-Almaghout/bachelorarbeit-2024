import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Course } from 'src/app/shared/models/Course';
import { NodeGroup } from 'src/app/shared/models/NodeGroup';
import { Topic } from 'src/app/shared/models/Topic';
import { HttpService } from 'src/app/shared/services/http.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'exploration-course',
  templateUrl: './exploration-course.component.html',
})
export class ExplorationCourseComponent implements OnInit {
  @Output() select: EventEmitter<any> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Input() courseId: number;

  public menu: string[] = ['Information', 'Topics', 'Explore more'];
  public currentMenuSelection: string = null;
  public course: Course;
  public topics: Topic[];
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
    this.getCourse();
  }

  async getCourse() {
    this.isLoading = true;

    await firstValueFrom(this.httpService.getCourse(this.courseId))
      .then((res: any) => {
        this.course = res.data;
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });

    this.isLoading = false;
  }

  goToRelated(course: Course) {
    this.select.emit({
      id: course.ID,
      title: course.title,
      group: NodeGroup.NODE_GROUP_COURSE,
    });

    this.courseId = course.ID;
    this.init();
  }
}
