import { Component, Input, OnInit } from '@angular/core';
import { OER } from 'src/app/shared/models/OER';

@Component({
  selector: 'exploration-information-oer',
  templateUrl: './exploration-information-oer.component.html',
})
export class ExplorationInformationOerComponent implements OnInit {
  @Input() oer: OER;
  @Input() isLoading: boolean;

  constructor() {}

  ngOnInit(): void {}
}
