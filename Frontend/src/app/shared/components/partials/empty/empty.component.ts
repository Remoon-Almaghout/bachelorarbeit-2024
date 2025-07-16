import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'empty',
  templateUrl: './empty.component.html',
  styleUrls: ['empty.css'],
})
export class emptyComponent implements OnInit {
  constructor() {}

  @Input() message : string;

  ngOnInit(): void {}
}
