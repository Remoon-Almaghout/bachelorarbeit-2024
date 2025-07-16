import { Component, Input, OnInit } from '@angular/core';
import { OER } from 'src/app/shared/models/OER';

@Component({
  selector: 'oer-card',
  templateUrl: './oer-card.component.html',
})
export class OerCardComponent implements OnInit {
  @Input() oer: OER;
  constructor() {}

  ngOnInit(): void {}
}
