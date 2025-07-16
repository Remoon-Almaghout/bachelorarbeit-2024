import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RecommendationService {
  private recommendationSubject = new Subject<any>();
  public redommendationState = this.recommendationSubject.asObservable();
  constructor() {}

  updateRecommendations(recommendations: any): void {
    this.recommendationSubject.next(recommendations);
  }
}
