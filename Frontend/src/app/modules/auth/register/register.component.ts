import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatomoService } from 'src/app/shared/services/matomo.service';
import { TopbarService } from 'src/app/shared/services/topbar.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls:['./register.component.css']
})
export class RegisterComponent implements OnInit {
  constructor(private router: Router,private topbarService:TopbarService , private matomoService : MatomoService) {
    if (localStorage.getItem('token') != null) {
      this.router.navigateByUrl('/home');
      
    }
    this.matomoService.trackPageView();
  }

  ngOnInit(): void {
    this.topbarService.hide();
    this.matomoService.setUserIdByEmail('token');
  }
}
