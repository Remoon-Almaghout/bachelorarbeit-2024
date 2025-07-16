import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ExploreStep } from 'src/app/shared/models/ExploreStep';
import { NodeGroup } from 'src/app/shared/models/NodeGroup';
import { Recommendation } from 'src/app/shared/models/Recommendation';

@Component({
  selector: 'exploration-dialog',
  templateUrl: './exploration-dialog.component.html',
})
export class ExplorationDialogComponent implements OnInit {
  public id: number;
  public title: string;
  public group: NodeGroup;
  public parentId:any;
  public recommendation: Recommendation;
  public history: any[] = [];
  readonly NODE_GROUP = NodeGroup;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public dialogRef: MatDialogRef<ExplorationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.journeyId = +params['journey_id'];
      this.journeyTitle = params['journey_title'];
    })
    this.select(this.data);
    this.recommendation = this.data.recommendation;
  }

  select(step: ExploreStep, addToHistory: boolean = true) {
    const { id, title, group, parentId } = step;
    this.id = id;
    this.title = title;
    this.group = group;
    this.parentId=parentId;
    if (addToHistory) {
      this.addToHistory(step);
    }
  }

  goToBreadCrumb(index: number) {
    if (index === this.history.length - 1) {
      return;
    }

    this.history = this.history.filter((x: any, i: number) => index >= i);

    const lastHistoryStep = this.history[this.history.length - 1];
    const lastHistoryItem = lastHistoryStep[lastHistoryStep.length - 1];
    this.select(lastHistoryItem, false);
  }

  back() {
    if (this.history.length === 1) {
      return;
    }

    this.history.pop();

    const lastHistoryStep = this.history[this.history.length - 1];
    const lastHistoryItem = lastHistoryStep[lastHistoryStep.length - 1];
    this.select(lastHistoryItem, false);
  }

  addToHistory(step: ExploreStep) {
    let stackItem = [];
    stackItem.push(step);

    if (this.history.length) {
      let lastHistoryItem = this.history[this.history.length - 1];
      stackItem = lastHistoryItem.concat(stackItem);
    }

    this.history.push(stackItem);
  }

  onClose() {
    this.dialogRef.close();
  }
  journeyId:any;
  journeyTitle:any;
  goTo(){
    if( this.group === this.NODE_GROUP.NODE_GROUP_RECOMMENDATION ||  this.group === this.NODE_GROUP.NODE_GROUP_COURSE){
      this.dialogRef.close();
      const navigationExtras: NavigationExtras = {
        state:{data:{journeyId:this.journeyId,
          journeyTitle:this.journeyTitle,
        }},
        queryParams : {
          course_id : this.id,
          journey_id : this.journeyId,
          journey_title : this.journeyTitle
        }
      };
      this.router.navigate(['/diagram'], navigationExtras);
    }
    else if( this.group === this.NODE_GROUP.NODE_GROUP_TOPIC){
    this.dialogRef.close();
    const navigationExtras: NavigationExtras = {
      state:{id:this.id},
    };
    this.onClose()
    this.router.navigateByUrl(`/show-topic/journey/${this.journeyId}/course/${this.data?.cid}/topic/${this.id}`,navigationExtras)
  }
  else if(this.group === this.NODE_GROUP.NODE_GROUP_EDUCATIONAL_PACKAGE){
    this.dialogRef.close();
    const navigationExtras: NavigationExtras = {
      state:{id:this.id,
      parentId:this.parentId,
      },
      queryParams : {
        openPackage: this.id
      },
      relativeTo : this.route
    };
    this.onClose()
    this.router.navigate([`/show-topic/journey/${this.journeyId}/course/${this.data?.cid}/topic/${this.data?.tid}`],navigationExtras)
  }
  else if(this.group === this.NODE_GROUP.NODE_GROUP_OER){
    this.dialogRef.close();
    const navigationExtras: NavigationExtras = {
      state:{id:this.id,
      parentId:this.parentId
      },
      queryParams : {
        openPackage :this.data?.pid,
        openOER : this.id
      },
      relativeTo : this.route
    };
    this.onClose()
    this.router.navigate([`/show-topic/journey/${this.journeyId}/course/${this.data?.cid}/topic/${this.data?.tid}`],navigationExtras)
  }

}
  
}
