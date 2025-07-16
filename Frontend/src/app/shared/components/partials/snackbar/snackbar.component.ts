import { Component, OnInit } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';
import { Subscription } from 'rxjs';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'snackbar',
  templateUrl: './snackbar.component.html',
  animations: [
    trigger('state', [
      transition(':enter', [
        style({
          top: '333px',
          transform: 'scale(0.3)',
        }),
        animate(
          '500ms cubic-bezier(0, 0, 0.2, 1)',
          style({
            transform: 'scale(1)',
            opacity: 1,
            top: '83px',
          })
        ),
      ]),
      transition(':leave', [
        animate(
          '500ms cubic-bezier(0.4, 0.0, 1, 1)',
          style({
            transform: 'scale(0.3)',
            opacity: 0,
            top: '133px',
          })
        ),
      ]),
    ]),
  ],
})
export class SnackbarComponent implements OnInit {
  public show = false;
  public message: string = '';
  public type: string = 'success';
  private snackbarSubscription: Subscription;

  constructor(private snackbarService: SnackbarService) {}
  ngOnInit() {
    this.snackbarSubscription = this.snackbarService.snackbarState.subscribe(
      (state) => {
        if (state.type) {
          this.type = state.type;
        } else {
          this.type = 'success';
        }

        this.message = state.message;
        this.show = state.show;
        setTimeout(() => {
          this.show = false;
        }, 5000);
      }
    );
  }

  ngOnDestroy() {
    this.snackbarSubscription.unsubscribe();
  }
}
