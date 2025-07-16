import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EducationalPackage } from 'src/app/shared/models/EducationalPackage';
import { NodeGroup } from 'src/app/shared/models/NodeGroup';
import { OER } from 'src/app/shared/models/OER';
import { HttpService } from 'src/app/shared/services/http.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'exploration-educational-package',
  templateUrl: './exploration-educational-package.component.html',
})
export class ExplorationEducationalPackageComponent implements OnInit {
  @Output() select: EventEmitter<any> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Input() educationalPackageId: number;
  @Input() parentId:any;
  public menu: string[] = ['Information', 'OERs', 'Explore more'];
  public currentMenuSelection: string = null;
  public educationalPackage: EducationalPackage;
  public oers: OER[];
  public isLoading: boolean;

  constructor(
    private httpService: HttpService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.init();
    // console.log(this.parentId)
  }

  onChangeMenuSelection(selection: string): void {
    if (this.isLoading) {
      return;
    }

    this.currentMenuSelection = selection;
  }

  init() {
    this.currentMenuSelection = this.menu[0];
    this.getEducationalPackage();
  }

  async getEducationalPackage() {
    this.isLoading = true;

    await firstValueFrom(
      this.httpService.getEducationalPackage(this.educationalPackageId)
    )
      .then((res: any) => {
        this.educationalPackage = res.data;
        console.log(res)
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });

    this.isLoading = false;
  }

  goToRelated(educationalPackage: EducationalPackage) {
    this.select.emit({
      id: educationalPackage.ID,
      title: educationalPackage.title,
      group: NodeGroup.NODE_GROUP_EDUCATIONAL_PACKAGE,
    });

    this.educationalPackageId = educationalPackage.ID;
    this.init();
  }
}
