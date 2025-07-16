import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ExplorationDialogComponent } from 'src/app/shared/components/dialogs/exploration-dialog/exploration-dialog.component';
import { NodeGroup } from 'src/app/shared/models/NodeGroup';
import { Recommendation } from 'src/app/shared/models/Recommendation';

@Component({
  selector: 'top-k-list-item',
  templateUrl: './top-k-list-item.component.html',
})
export class TopKListItemComponent implements OnInit {
  @Input() recommendation: Recommendation;
  @Input() index: number;
  public coursesString: string = 'adwad';
  public topicsString: string = '';
  public NODE_GROUP = NodeGroup;
  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.buildCoursesString();
    this.buildTopicsString();
  }

  buildCoursesString(): void {
    let value = '';

    for (let i = 0; i < this.recommendation.courses.length; i++) {
      const course = this.recommendation.courses[i];
      value += course.title;

      if (i + 1 < this.recommendation.courses.length) {
        value += ', ';
      }

      if (i >= 10) {
        value += '...';
        break;
      }
    }

    this.coursesString = value;
  }

  buildTopicsString(): void {
    const topics: any[] = this.getAllTopics();

    let value = '';

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      value += topic.title;

      if (i + 1 < topics.length) {
        value += ', ';
      }

      if (i >= 10) {
        value += '...';
        break;
      }
    }

    this.topicsString = value;
  }

  getAllTopics(): any[] {
    const topics: any[] = [];

    this.recommendation.courses.forEach((course: any) => {
      course.topics.forEach((topic: any) => {
        topics.push(topic);
      });
    });

    return topics;
  }

  openExplorationDialog(id: number, title: string, group: NodeGroup): void {
    this.dialog.open(ExplorationDialogComponent, {
      width: '1240px',
      height: '95vh',
      panelClass: 'no-spacing',
      disableClose: true,
      data: {
        id,
        title,
        group,
        recommendation: this.recommendation,
      },
    });
  }
}
