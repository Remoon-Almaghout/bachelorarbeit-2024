import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EducationalPackage } from 'src/app/shared/models/EducationalPackage';

@Component({
  selector: 'explore-educational-package-card',
  templateUrl: './explore-educational-package-card.component.html',
})
export class ExploreEducationalPackageCardComponent implements OnInit {
  @Output() goToRelated: EventEmitter<any> = new EventEmitter();
  @Output() goToProfile: EventEmitter<any> = new EventEmitter();
  @Input() educationalPackage: EducationalPackage;
  constructor() {}

  ngOnInit(): void {}

  onSelect($event: any): void {
    $event.preventDefault();
    $event.stopPropagation();

    this.goToRelated.emit(this.educationalPackage);
  }
}
