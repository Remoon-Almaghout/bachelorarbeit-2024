import { CdkDragEnter, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'panel-system',
  templateUrl: './panel-system.component.html',
})
export class PanelSystemComponent implements OnInit {
  @Input() components: any;
  public hideIndices: number[] = [];
  constructor() {}

  ngOnInit(): void {}

  dragEntered(event: CdkDragEnter<number>) {
    const drag = event.item;
    const dropList = event.container;
    const dragIndex = drag.data;
    const dropIndex = dropList.data;

    const phContainer = dropList.element.nativeElement;
    const phElement = phContainer.querySelector('.cdk-drag-placeholder');
    phContainer.removeChild(phElement);
    phContainer.parentElement.insertBefore(phElement, phContainer);

    moveItemInArray(this.components, dragIndex, dropIndex);
  }

  reorder($event: any) {
    const { currentIndex, newIndex } = $event;
    moveItemInArray(this.components, currentIndex, newIndex);
  }

  hide(index: number) {
    this.hideIndices.push(index);
    this.components.splice(index, 1);
  }
}
