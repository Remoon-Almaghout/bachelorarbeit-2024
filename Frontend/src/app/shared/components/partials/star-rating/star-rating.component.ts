import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'star-rating',
  templateUrl: './star-rating.component.html',
})
export class StarRatingComponent implements OnInit {
  @Input() control: UntypedFormControl;
  @Input() count?: number = 5;
  public id: string;

  constructor() {}

  ngOnInit(): void {}

  hoverStateIn($event: any): void {
    const index = $event.target.dataset.index;
    const stars = document.querySelectorAll('.rating-star');
  }

  hoverStateOut($event: any): void {}

  setValue(value: number) {
    this.control.setValue(value);
  }
}
