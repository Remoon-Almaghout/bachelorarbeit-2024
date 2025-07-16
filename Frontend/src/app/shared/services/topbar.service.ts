import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class TopbarService {
showNavBar:BehaviorSubject<boolean>;
constructor(){
  this.showNavBar=new BehaviorSubject(true);
}
hide(){
  this.showNavBar.next(false)
}
display(){
  this.showNavBar.next(true)
}
}
