import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { UntypedFormControl } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Topic } from 'src/app/shared/models/Topic';
import { Course } from 'src/app/shared/models/Course';

@Component({
  selector: 'chips-autocomplete',
  templateUrl: './chips-autocomplete.component.html',
})
export class ChipsAutocompleteComponent implements OnInit {
  @ViewChild('inputElement') inputElement: ElementRef<HTMLInputElement>;
  @Input() control: UntypedFormControl;
  @Input() data: any;
  @Input() isLoading: boolean = false;
  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public inputCtrl = new UntypedFormControl();
  public filteredItems: Observable<any[]>;
  public selectedItems: any[] = [];
  public unselectedItems: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.selectedItems = this.control.value;

    this.filteredItems = this.inputCtrl.valueChanges.pipe(
      startWith(null),
      map((item: string | null) =>
        item ? this._filter(item) : this.data.slice()
      )
    );
  }

  private _filter(value: any | string) {
    let filterValue = typeof value === 'string' ? value : value.title;
    filterValue = filterValue.toLowerCase();

    return this.data.filter((item: any) =>
      item.title.toLowerCase().includes(filterValue)
    );
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const id = event.option.value.ID;

    const value = this.data.find((item: any) => item.ID === id);
    this.selectedItems.push(value);
    this.inputElement.nativeElement.value = '';
    this.inputCtrl.setValue(null);

    this.updateControlValue();
  }

  add(event: any): void {
    this.inputCtrl.setValue(null);
  }

  remove(value: any): void {
    const index = this.selectedItems.findIndex((item) => item.ID == value.ID);

    if (index >= 0) {
      this.selectedItems.splice(index, 1);
    }

    this.updateControlValue();
  }

  updateControlValue() {
    this.control.setValue(this.selectedItems);
  }
}
