import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'pill',
  templateUrl: './pill.component.html',
})
export class PillComponent implements OnInit {
  @Input() title: string;
  constructor() {}

  ngOnInit(): void {}
}
