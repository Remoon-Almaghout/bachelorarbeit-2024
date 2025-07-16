import { Component } from '@angular/core';
import { MatomoService } from 'src/app/shared/services/matomo.service';

@Component({
  selector: 'not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent {
  constructor(private matomoService :MatomoService){
    this.matomoService.trackPageView();
  }

}
