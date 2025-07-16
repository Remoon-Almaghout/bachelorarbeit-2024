import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { OER } from '../../models/OER';
import { HttpService } from '../../services/http.service';
import { SnackbarService } from '../../services/snackbar.service';
import { MatomoService } from '../../services/matomo.service';

@Component({
  selector: 'app-oer-view',
  templateUrl: './oer-view.component.html',
  styleUrls: ['./oer-view.component.css']
})

export class OerViewComponent implements OnChanges {
  url: any;
  public isLoading: boolean;
  public oer: OER;
  @Input() oerInput: any;
  @Input() classification: any;
  public rating: number = 3;
  public starCount: number = 5;
  public color: string = 'accent';
  @Output() public ratingUpdated = new EventEmitter();
  @Output() finisheEvent = new EventEmitter();
  @Output('goNext') goNext = new EventEmitter();
  public snackBarDuration: number = 2000;
  public ratingArr: any = [];
  isFinished: boolean = false;
  isClicked: boolean = false;
  isClicked2: boolean = false;
  isReceived: boolean = false;
  lastComment = '';
  lastCommentID : number | null = null;
  ratedBefore : boolean = false;
  lastRating : number = 0;
  textAreaDisabled : boolean = false;
  totalPDFPages = 0;

  constructor(
    private httpService: HttpService,
    private snackbarService: SnackbarService,
    private domSanitizer: DomSanitizer,
    private matomoService : MatomoService
  ) { 
  }

   
  title: string = ''
  description: string = ''

  
  ngOnChanges(changes:SimpleChanges) {
    
    if(changes['oerInput']?.currentValue?.ID !== changes['oerInput']?.previousValue?.ID){
      this.lastCommentID = null;
      this.lastComment = '';
    }
    if (this.oerInput) {
      this.getOER();
      this.getLastComment();
      this.getLastRating();
    }

  }

  ngOnInit() {
    
    for (let index = 0; index < this.starCount; index++) {
      this.ratingArr.push(index);
    }

    this.matomoService.trackPageView();
    
  }
  

  async getOER() {
    this.isLoading = true;
    await firstValueFrom(this.httpService.getOER(this.oerInput.ID))
      .then((res: any) => {
        this.oer = res.data;
        this.url = res?.classification !== 'Local Video' && res?.classification !== 'PDF' ? this.getTrustedVideoURL(this.oer.url) : this.oer?.url;
        this.title = this.oer.title;
        this.description = this.oer.description;
        this.oerInput.completed = this.oer?.completed;
        this.oerInput.classification = res?.classification;
        this.matomoService.trackOutlink(this.url,this.oerInput.classification);
        
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });

    this.isLoading = false;
  }

  commentFC = new FormControl();

  onCommentChange() {
  }
  
  onClick(rating: number) {
    this.ratingUpdated.emit(rating);
    this.rating = rating;
    return false;
  }

  showIcon(index: number) {
    if (this.lastRating > index) {
      return 'star';
    } else {
      return 'star_border';
    }
  }

  getTrustedVideoURL(videoURL: string): SafeResourceUrl {
    let srclink = videoURL;

    if (srclink.startsWith('https://www.youtube.com/watch?v=')) {

      let embedlink = srclink.replace('watch?v=', 'embed/')
      return this.domSanitizer.bypassSecurityTrustResourceUrl(embedlink);

    } else if (srclink.startsWith('https://youtu.be')) {

      let embedlink = srclink.replace('https://youtu.be', 'https://www.youtube.com/embed/')
      return this.domSanitizer.bypassSecurityTrustResourceUrl(embedlink);

    }
    else if (srclink.startsWith('https://www.tiktok.com/')) {
      let embedlink = srclink.replace('www.tiktok.com/', 'www.tiktok.com/embed/')
      return this.domSanitizer.bypassSecurityTrustResourceUrl(embedlink);
    }
    else {

      return this.domSanitizer.bypassSecurityTrustResourceUrl(srclink);

    }
  }

  toggleStatus() {
    if (!this.isClicked) {
      this.isFinished = !this.isFinished;
      this.isClicked = true;
    }
  }

  toggleStatus2() {
    if (!this.isClicked2) {
      this.isReceived = !this.isReceived;
      this.isClicked2 = true;
    }
  }

  hasFinished() {
    let done = this.isFinished && this.isReceived;
    this.oerInput.completed = true;
    this.httpService.setOERCompleted(this.oerInput?.ID).subscribe();
    this.finisheEvent.emit({ id: this.oerInput?.ID, status: done });
    this.matomoService.trackEvent('Finish','Completed OER','Completed OER');
  }

  handleNextClick(event:Event){
    event.preventDefault();
    this.goNext.emit(this.oerInput.ID);
    this.matomoService.trackEvent('ButtonNext','Click Next to go to next OER','Next OER');
  }

  setCurrentRating(rating:number): void{
    this.lastRating = rating;
  }

  sendRating():void{
    if(this.lastCommentID){
      this.httpService.editComment(this.oerInput.ID,this.commentFC?.value, this.lastCommentID, this.lastRating).subscribe({
        next : ()=>{
          this.ratedBefore = true;
          this.isReceived = true;
          this.lastComment = this.commentFC?.value;
          this.commentFC?.patchValue(null);
          this.commentFC?.disable();
          this.textAreaDisabled = true;
          this.matomoService.trackEvent('ButtonAddRating','Add Rating click','Add Rating');
        },
        error : ()=>{
          this.isReceived = false;
        }
      }) 
    }
    else{
      this.httpService.addFeedback(this.oerInput.ID,this.lastRating ? this.lastRating : 0,this.commentFC?.value).subscribe({
        next : ()=>{
          this.ratedBefore = true;
          this.isReceived = true;
          this.lastComment = this.commentFC?.value;
          this.commentFC?.patchValue(null);
          this.commentFC?.disable();
          this.textAreaDisabled = true;
          this.getLastComment();
        },
        error : ()=>{
          this.isReceived = false;
        }
      }) 
    }
  } 

  sendFeedback(): void{
    this.httpService.editComment;
    this.matomoService.trackEvent('ButtonAddFeedback','Add Feedback click','Add Feedback');
    
  }

  getLastRating(): void{
    this.httpService?.getLastRating(this.oerInput?.ID).subscribe({
      next : (res:any)=>{
        if(res?.data?.rating){
          this.lastRating = res?.data?.rating;
          this.ratedBefore = true;
        }
        else{
          this.ratedBefore = false;
          this.lastRating = 0;
        }
      },
      error : ()=>{
        this.ratedBefore = false;
        this.lastRating = 0;
      }
    })
  }

  enableCommentArea(): void{
    this.commentFC?.enable();
    this.textAreaDisabled = false;
  }

  getLastComment(): void{
    this.httpService?.getLastComment(this.oerInput?.ID).subscribe({
      next : (res:any)=>{
        this.lastComment = res?.data?.comment;
        this.commentFC?.patchValue(this.lastComment);
        this.isReceived = true;
        this.textAreaDisabled = true;
        this.commentFC?.disable();
        this.lastCommentID = res?.data?.feedback_id;
      },
      error : ()=>{
        this.commentFC?.patchValue('');
        this.lastComment = '';
        this.textAreaDisabled = false;
        this.commentFC?.enable();
        this.isReceived = false;
      }
    })
  }

  handleVideo(event:any):void{
    this.toggleStatus();
    this.hasFinished();
    this.matomoService.trackVideoPlay('Video local play');
    this.matomoService.trackVideoPause('Video Local break');
    this.matomoService.trackEvent('VideoPlay','VideoPlayclick','VideoPlay');
  }

  handlePDFScroll(event:any): void{
    const pageNumber = event?.pageNumber ? event.pageNumber : 1;

    if(pageNumber === this.totalPDFPages){
      this.toggleStatus();
      this.hasFinished();
    }
  }

  afterLoadComplete(data:any): void{
    this.totalPDFPages = data?._pdfInfo?.numPages ? data?._pdfInfo?.numPages : 0;
  }

}



