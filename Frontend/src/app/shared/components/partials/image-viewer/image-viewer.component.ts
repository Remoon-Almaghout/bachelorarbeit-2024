import { Component, Input, OnInit, Inject  } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['image-viewer.css'],
})
export class ImageViewer implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  @Input()  currentImage: string;
  ngOnInit(): void {
    this.currentImage = this.data.imgSrc

  }
}
