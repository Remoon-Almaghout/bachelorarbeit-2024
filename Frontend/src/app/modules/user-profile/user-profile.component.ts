import { Component, OnInit, ViewChild } from '@angular/core';
import { UserProfileFormComponent } from 'src/app/shared/components/forms/user-profile-form/user-profile-form.component';
import { Router } from '@angular/router';
import { MatomoService } from 'src/app/shared/services/matomo.service';
import { HttpService } from 'src/app/shared/services/http.service';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
})
export class UserProfileComponent implements OnInit {
  @ViewChild(UserProfileFormComponent)
  userProfileFormComponent: UserProfileFormComponent;
  constructor(private router: Router, private matomoService: MatomoService , private httpService : HttpService) {}


  ngOnInit(): void {
     this.matomoService.trackPageView();
     
  }

  submit(): void {
    this.userProfileFormComponent.onSubmit();
    this.matomoService.trackEvent('ButtonUserProfileClick','Save in Userprofile GoToHome click','naviToHome');
  }

  // async handleClick(){
  //   console.log('xyz');
  //   await firstValueFrom(this.httpService.getUserEmail())
  //   .then((res: any) => {
  //     const email = email;
  //     this.matomoService.trackEvent(email)
  //   }) 
  // }

}
