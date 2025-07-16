import { Component, Input, OnInit } from '@angular/core';
import { EducationalPackage } from 'src/app/shared/models/EducationalPackage';

@Component({
  selector: 'educational-package-card',
  templateUrl: './educational-package-card.component.html',
})
export class EducationalPackageCardComponent implements OnInit {
  @Input() educationalPackage: EducationalPackage;
  constructor() {}

  ngOnInit(): void {}
}
