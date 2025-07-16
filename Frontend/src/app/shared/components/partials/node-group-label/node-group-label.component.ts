import { Component, Input, OnInit } from '@angular/core';
import { NodeGroup } from 'src/app/shared/models/NodeGroup';

@Component({
  selector: 'node-group-label',
  templateUrl: './node-group-label.component.html',
})
export class NodeGroupLabelComponent implements OnInit {
  @Input() group: number;
  readonly NODE_GROUP = NodeGroup;
  constructor() {}

  ngOnInit(): void {}
}
