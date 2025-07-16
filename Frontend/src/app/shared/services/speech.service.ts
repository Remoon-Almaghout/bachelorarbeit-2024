import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class SpeechService {
  private textMessageSubject = new Subject<any>();
  public textMessageState = this.textMessageSubject.asObservable();
  private voiceMessageSubject = new Subject<any>();
  public  voiceMessageState = this.voiceMessageSubject.asObservable();
  constructor() {}

  updateTextMessage(textMessage: string) {
    this.textMessageSubject.next(textMessage);
  }
  updateVoiceMessage(voiceMessage: string) {
    this.voiceMessageSubject.next(voiceMessage);
  }
}
