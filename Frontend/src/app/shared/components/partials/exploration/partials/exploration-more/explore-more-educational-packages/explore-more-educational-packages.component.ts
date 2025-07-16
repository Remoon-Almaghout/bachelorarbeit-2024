import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EducationalPackage } from 'src/app/shared/models/EducationalPackage';
import { HttpService } from 'src/app/shared/services/http.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'explore-more-educational-packages',
  templateUrl: './explore-more-educational-packages.component.html',
})
export class ExploreMoreEducationalPackagesComponent implements OnInit {
  @Output() goToRelated: EventEmitter<any> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Input() educationalPackage: EducationalPackage;
  public isLoading: boolean;
  public relatedEducationalPackages: EducationalPackage[];

  constructor(
    private httpService: HttpService,
    private snackbarService: SnackbarService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.isLoading = true;

    await firstValueFrom(
      this.httpService.getRelatedEducationalPackages(
        this.educationalPackage.title
      )
    )
      .then((res: any) => {
        this.relatedEducationalPackages = res.data;
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });

    this.isLoading = false;
  }

  goToProfile(): void {
    this.onClose.emit();
    this.router.navigateByUrl('/user-profile');
  }
}
