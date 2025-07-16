import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'page-top-bar',
  templateUrl: './page-top-bar.component.html',
})
export class PageTopBarComponent implements OnInit {
  @Input() title: string;
  constructor() {}

  ngOnInit(): void {}
}
