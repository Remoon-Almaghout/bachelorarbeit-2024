import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Recommendation } from 'src/app/shared/models/Recommendation';

@Component({
  selector: 'recommendation-selector',
  templateUrl: './recommendation-selector.component.html',
})
export class RecommendationSelectorComponent implements OnInit {
  @Output() change: EventEmitter<any> = new EventEmitter();
  @Input() recommendations: Recommendation[];
  @Input() limit?: number = 3;
  @Input() selected: Recommendation[] = [];
  public itemForm: UntypedFormGroup;
  public unselected: Recommendation[] = [];

  ngOnInit(): void {
    this.setLimit();
    this.setUnselected();
    this.buildForm();
  }

  buildForm() {
    this.itemForm = new UntypedFormGroup({});

    this.selected.forEach((item: Recommendation, index: number) => {
      this.itemForm.addControl(
        `recommendation_${index + 1}`,
        new UntypedFormControl(item.id)
      );
    });

    this.itemForm.valueChanges.subscribe((result) => {
      this.selected = this.recommendations.filter(
        (recommendation: Recommendation) =>
          this.isSelectedRecommendation(recommendation.id)
      );
      this.setUnselected();
      this.change.emit(this.selected);
    });
  }

  setLimit() {
    if (this.limit > this.recommendations.length) {
      this.limit = this.recommendations.length;
    }
  }

  isSelectedRecommendation(id: number): boolean {
    return (
      Object.keys(this.itemForm.value).findIndex(
        (key: string) => this.itemForm.get(key).value === id
      ) != -1
    );
  }

  setUnselected() {
    this.unselected = this.recommendations.filter(
      (recommendation: Recommendation) => !this.isSelected(recommendation.id)
    );
  }

  isSelected(id: number): boolean {
    return this.selected.findIndex((item: any) => item.id === id) != -1;
  }

  getNextUnselected() {
    return this.unselected[0];
  }

  add() {
    this.selected.push(this.getNextUnselected());
    this.buildForm();
    this.setUnselected();

    this.change.emit(this.selected);
  }

  remove(index: number) {
    const value = this.itemForm.get(`recommendation_${index + 1}`).value;
    this.removeSelected(value);
  }

  removeSelected(id: number) {
    const index = this.selected.findIndex(
      (item: Recommendation) => item.id === id
    );

    if (index != -1) {
      this.selected.splice(index, 1);
    }

    this.buildForm();
    this.setUnselected();

    this.change.emit(this.selected);
  }
}
