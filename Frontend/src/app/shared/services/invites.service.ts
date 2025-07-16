import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Invite } from '../models/Invite';
@Injectable({
  providedIn: 'root',
})
export class InvitesService {
  private invitesSubject = new Subject<any>();
  public invitesState = this.invitesSubject.asObservable();
  constructor() {}

  updateInvites(invites: Invite[]) {
    this.invitesSubject.next(invites);
  }
}
