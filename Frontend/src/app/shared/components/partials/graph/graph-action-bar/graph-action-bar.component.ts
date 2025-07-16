import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'graph-action-bar',
  templateUrl: './graph-action-bar.component.html',
})
export class GraphActionBarComponent implements OnInit {
  @Output() onScale: EventEmitter<any> = new EventEmitter();
  @Output() onGrab: EventEmitter<any> = new EventEmitter();
  @Input() isGrabModus: boolean;
  public zoom: number = 100;
  readonly ZOOM_STEPS: number = 10;
  readonly ZOOM_SCALE_MAX: number = 200;
  readonly ZOOM_SCALE_MIN: number = 50;
  constructor() {}

  zoomIn() {
    if (this.zoom === this.ZOOM_SCALE_MAX) {
      return;
    }

    this.zoom += this.ZOOM_STEPS;
    this.onScale.emit(this.zoom / 100);
  }

  zoomOut() {
    if (this.zoom === this.ZOOM_SCALE_MIN) {
      return;
    }

    this.zoom -= this.ZOOM_STEPS;
    this.onScale.emit(this.zoom / 100);
  }

  ngOnInit(): void {}
}
