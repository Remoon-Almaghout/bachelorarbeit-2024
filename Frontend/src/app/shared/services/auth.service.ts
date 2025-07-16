import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, tap } from 'rxjs';
import { HttpService } from './http.service';
import jwt_decode, { JwtPayload } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken: string;
  private logged = new ReplaySubject<boolean>(1);
  isLogged = this.logged.asObservable();
  constructor(private httpService: HttpService) {}

  login(data: any): Observable<any> {
    return this.httpService
      .login(data)
      .pipe(tap((res) => this.setUserAndToken(res)));
  }

  register(data: any): Observable<any> {
    return this.httpService
      .register(data)
      .pipe(tap((res) => this.setUserAndToken(res)));
  }

  private setUserAndToken(response: any) {
    const payload: JwtPayload = jwt_decode(response.auth_token);
    const { sub, exp } = payload;

    const expiry = new Date(new Date().getTime() + exp * 1000).toString();

    localStorage.setItem('sub', sub);
    localStorage.setItem('exp', expiry);

    this.token = response.auth_token;
    this.logged.next(true);
  }

  set token(token: string) {
    this.accessToken = token;
    localStorage.setItem('token', token);
  }

  get token(): string {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('token');
    }
    return this.accessToken;
  }

  logout() {
    localStorage.clear();
    // this.token = null;
    this.logged.next(false);
  }

  checkStatus() {
    if (this.token) {
      this.logged.next(true);
    } else {
      this.logged.next(false);
    }
  }
}
