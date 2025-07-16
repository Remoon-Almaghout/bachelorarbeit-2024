import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EducationalPackage } from 'src/app/shared/models/EducationalPackage';
import { NodeGroup } from 'src/app/shared/models/NodeGroup';
import { OER } from 'src/app/shared/models/OER';
import { Topic } from 'src/app/shared/models/Topic';
import { HttpService } from 'src/app/shared/services/http.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'exploration-oers',
  templateUrl: './exploration-oers.component.html',
})
export class ExplorationOersComponent implements OnInit {
  @Output() select: EventEmitter<any> = new EventEmitter();
  @Input() educationalPackage: EducationalPackage;

  public oers: OER[];
  public isLoading: boolean;

  constructor(
    private httpService: HttpService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.getOERs();
  }

  async getOERs() {
    this.isLoading = true;

    await firstValueFrom(
      this.httpService.getOERsByEducationalPackage(this.educationalPackage.ID)
    )
      .then((res: any) => {
        this.oers = res.data;
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });

    this.isLoading = false;
  }

  onClick(oer: OER) {
    this.select.emit({
      id: oer.ID,
      title: oer.title,
      group: NodeGroup.NODE_GROUP_OER,
    });
  }
}
