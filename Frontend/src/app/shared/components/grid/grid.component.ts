import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'grid',
  templateUrl: './grid.component.html',
})
export class GridComponent implements OnInit {
  @Input() cols: number = 3;
  @Input() mdCols: number = 2;
  @Input() smCols: number = 1;
  @Input() gap: number = 4;

  constructor() {}

  ngOnInit(): void {}
}
