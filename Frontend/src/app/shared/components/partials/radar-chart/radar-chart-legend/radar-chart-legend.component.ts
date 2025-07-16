import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'radar-chart-legend',
  templateUrl: './radar-chart-legend.component.html',
})
export class RadarChartLegendComponent implements OnInit {
  @Input() colors: any[];
  constructor() {}

  ngOnInit(): void {}
}
