import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'tab-menu',
  templateUrl: './tab-menu.component.html',
})
export class TabMenuComponent implements OnInit {
  @Output() onChange: EventEmitter<any> = new EventEmitter();
  @Input() menu: string[];
  @Input() currentSelection?: string;
  constructor() {}

  ngOnInit(): void {
    this.init();
  }

  init() {
    if (!this.currentSelection) {
      this.currentSelection = this.menu[0];
    }
  }
}
