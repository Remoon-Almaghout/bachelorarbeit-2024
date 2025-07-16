import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpService } from 'src/app/shared/services/http.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { firstValueFrom } from 'rxjs';
import { Journey } from 'src/app/shared/models/Journey';
import { Router } from '@angular/router';

@Component({
  selector: 'explore-more-journies',
  templateUrl: './explore-more-journies.component.html',
})
export class ExploreMoreJourniesComponent implements OnInit {
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Input() industry: string;
  public isLoading: boolean;
  public journies: Journey[];
  constructor(
    private httpService: HttpService,
    private snackbarService: SnackbarService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.isLoading = true;

    await firstValueFrom(this.httpService.getJourniesByIndustry(this.industry))
      .then((res: any) => {
        this.journies = res.data;
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });

    this.isLoading = false;
  }

  explore(journey: Journey): void {
    this.onClose.emit();
    this.router.navigateByUrl(
      `/dashboard?journey_id=${journey.ID}&journey_title=${journey.title}`
    );
  }
}
