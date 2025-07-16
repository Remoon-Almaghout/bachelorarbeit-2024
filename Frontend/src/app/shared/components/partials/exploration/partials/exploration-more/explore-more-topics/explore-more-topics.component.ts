import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Topic } from 'src/app/shared/models/Topic';
import { HttpService } from 'src/app/shared/services/http.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'explore-more-topics',
  templateUrl: './explore-more-topics.component.html',
})
export class ExploreMoreTopicsComponent implements OnInit {
  @Output() goToRelated: EventEmitter<any> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Input() topic: Topic;
  public isLoading: boolean;
  public relatedTopics: Topic[];

  constructor(
    private httpService: HttpService,
    private snackbarService: SnackbarService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.isLoading = true;

    await firstValueFrom(this.httpService.getRelatedTopics(this.topic.title))
      .then((res: any) => {
        this.relatedTopics = res.data;
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
