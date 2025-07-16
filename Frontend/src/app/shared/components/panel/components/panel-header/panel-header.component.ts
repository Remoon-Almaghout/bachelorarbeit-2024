import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'panel-header',
  templateUrl: './panel-header.component.html',
})
export class PanelHeaderComponent implements OnInit {
  @Output() hide: EventEmitter<any> = new EventEmitter();
  @Output() reorder: EventEmitter<any> = new EventEmitter();
  @Input() title: string;
  @Input() count: number;
  @Input() index: number;
  constructor() {}

  ngOnInit(): void {}

  onVisibilityChange($event: any, index: number) {
    if ($event.target.value) {
      this.hide.emit(index);
    }
  }
}
