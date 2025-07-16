import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { TopbarService } from 'src/app/shared/services/topbar.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './app-top-bar.component.html',
  styleUrls:['./app-top-bar.component.css']
})
export class AppTopBarComponent implements OnInit {
  public isLoggedIn: boolean;
  constructor(private authService: AuthService, private router: Router,public topbarService:TopbarService) {}

  ngOnInit(): void {
    this.authService.isLogged.subscribe((logged) => {
      this.isLoggedIn = logged;
    });
    this.authService.checkStatus();
  }
  navito(): void {
    this.router.navigate(['learning-package'])
  }
  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/');
    // this.topbarService.hide()
  }
}
