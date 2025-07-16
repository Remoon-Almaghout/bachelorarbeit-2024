import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private userProfileSubject = new Subject<any>();
  public userProfileState = this.userProfileSubject.asObservable();
  constructor() {}

  updateUserProfile(userProfile: any) {
    this.userProfileSubject.next(userProfile);
  }
}
