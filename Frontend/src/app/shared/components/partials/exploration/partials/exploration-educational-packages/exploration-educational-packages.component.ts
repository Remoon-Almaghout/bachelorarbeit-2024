import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EducationalPackage } from 'src/app/shared/models/EducationalPackage';
import { NodeGroup } from 'src/app/shared/models/NodeGroup';
import { Topic } from 'src/app/shared/models/Topic';
import { HttpService } from 'src/app/shared/services/http.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'exploration-educational-packages',
  templateUrl: './exploration-educational-packages.component.html',
})
export class ExplorationEducationalPackagesComponent implements OnInit {
  @Output() select: EventEmitter<any> = new EventEmitter();
  @Input() topic: Topic;

  public educationalPackages: EducationalPackage[];
  public isLoading: boolean;

  constructor(
    private httpService: HttpService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.getEducationalPackages();
  }

  async getEducationalPackages() {
    this.isLoading = true;

    await firstValueFrom(
      this.httpService.getEducationalPackagesByTopic(this.topic.ID)
    )
      .then((res: any) => {
        this.educationalPackages = res.data;
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });

    this.isLoading = false;
  }

  onClick(educationalPackage: EducationalPackage) {
    this.select.emit({
      id: educationalPackage.ID,
      title: educationalPackage.title,
      group: NodeGroup.NODE_GROUP_EDUCATIONAL_PACKAGE,
    });
  }
}
