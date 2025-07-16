import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor() { }

  isLoggedIn(): boolean{
    if (!localStorage.getItem('token') || new Date(localStorage.getItem('exp')) < new Date()) {
      localStorage.clear();
      return false;
    }
    return true;
  }

}
