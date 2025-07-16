import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Session } from '../models/Session';
@Injectable({
  providedIn: 'root',
})
export class SessionsService {
  private sessionsSubject = new Subject<any>();
  public sessionsState = this.sessionsSubject.asObservable();
  constructor() {}

  updateSessions(sessions: Session[]) {
    this.sessionsSubject.next(sessions);
  }
}
