import { Component, Input, OnInit } from '@angular/core';
import { EducationalPackage } from 'src/app/shared/models/EducationalPackage';

@Component({
  selector: 'exploration-information-educational-package',
  templateUrl: './exploration-information-educational-package.component.html',
})
export class ExplorationInformationEducationalPackageComponent
  implements OnInit
{
  @Input() educationalPackage: EducationalPackage;
  @Input() isLoading: boolean;

  constructor() {}

  ngOnInit(): void {}
}
