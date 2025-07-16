import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard  {
  public authToken: string;
  private isAuthenticated: boolean = true;

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    this.isAuthenticated = localStorage.getItem('token') ? true : false;

    if (!localStorage.getItem('token') || new Date(localStorage.getItem('exp')) < new Date()) {
      localStorage.clear();
      this.isAuthenticated = false;
      this.router.navigateByUrl('/login');
      return false;
    }

    return true;
  }
}
