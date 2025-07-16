import { Component, EventEmitter, Input, Output } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { OER } from 'src/app/shared/models/OER';
import { HttpService } from 'src/app/shared/services/http.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { SafePipe } from 'src/app/shared/pipes/safepipe.pipe';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { ExplorationDialogComponent } from 'src/app/shared/components/dialogs/exploration-dialog/exploration-dialog.component';
import { NodeGroup } from 'src/app/shared/models/NodeGroup';
import { RecommendationService } from 'src/app/shared/services/recommendation.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { EducationalPackage } from 'src/app/shared/models/EducationalPackage';
import { Journey } from 'src/app/shared/models/Journey';
import { Course } from 'src/app/shared/models/Course';
import { Topic } from 'src/app/shared/models/Topic';
import { MatomoService } from 'src/app/shared/services/matomo.service';
@Component({
  selector: 'app-show-topic',
  templateUrl: './show-topic.component.html',
  styleUrls: ['./show-topic.component.css'],
})
export class ShowTopicComponent {
  url: any;
  public isLoading: boolean;
  public oer: OER;
  readonly NODE_GROUP = NodeGroup;
  @Input('rating') public rating: number = 3;
  @Input('starCount') public starCount: number = 5;
  @Input('color') public color: string = 'accent';
  @Output() public ratingUpdated = new EventEmitter();

  public snackBarDuration: number = 2000;
  public ratingArr: any = [];
  currentOER: any;
  currentJourneyID : string | null = null;
  currentCourseID : string | null = null;
  currentTopicID : string | null = null;
  currentJourney : Journey = {} as Journey;
  currentCourse : Course = {} as Course;
  currentTopic : Topic = {} as Topic;
  nextTopicID : string | null = null;
  nextCourseID : string | null = null;
  openPackage : number | null = null;
  openOER : number | null = null;
  recommendation : Journey = {} as Journey;

  constructor(
    private httpService: HttpService,
    private matomoService : MatomoService,
    private http: HttpClient,
    private snackbarService: SnackbarService,
    private domSanitizer: DomSanitizer,
    private dialog: MatDialog,
    private recommendationService:RecommendationService,
    private route:ActivatedRoute,
    private router: Router
  ) {

    this.route.paramMap.subscribe({
      next : (params:ParamMap)=>{
        if(params.get('jid'))
          this.currentJourneyID = params.get('jid');
        else
          this.currentJourneyID = null;
        if(params.get('cid'))
          this.currentCourseID = params.get('cid');
        else
          this.currentCourseID = null;
        if(params.get('id'))
          this.currentTopicID = params.get('id');
        else
          this.currentTopicID = null;
        this.topicId = this.currentCourseID;
      }
    })

    this.route.queryParamMap.subscribe({
      next : (params:ParamMap)=>{
        if(params.get('openPackage'))
          this.openPackage = parseInt(params.get('openPackage'));
        else
          this.openPackage = null;
        if(params.get('openOER'))
          this.openOER = parseInt(params.get('openOER'));
        else
          this.openOER = null;
      }
    })

    this.matomoService.trackPageView;
  }
  oerId: any;
  topicId: any;
  topic: any;

  async ngOnInit() {
    this.getRecommendedJouneyData();
    this.getTopicDataFromBackend();
    // await this.getTopic();
    for (let index = 0; index < this.starCount; index++) {
      this.ratingArr.push(index);
    }
  }

  getRecommendedJouneyData(): void{
    this.httpService.getRecommendations({journey_id:1,journey_title:""}).subscribe({
      next : (res:any)=>{
        if(res?.data?.length){
          this.currentJourney = res?.data[0]?.recommended_journey;
          this.recommendation = {...res?.data[0]?.recommended_journey};
          this.currentCourse = this.currentJourney.courses?.reduce((a,o)=> (o.ID === parseInt(this.currentCourseID) && a.push(o), a), [])[0];
          this.currentTopic = this.currentCourse?.topics?.reduce((a,o)=> (o.ID === parseInt(this.currentTopicID) && a.push(o), a), [])[0];
          this.educationalPackages = [...this.currentTopic?.educational_packages];
          if(this.openOER && this.openPackage){
            this.educationalPackages?.forEach(ed => {
              const targetPackage = this.educationalPackages?.filter(ed => ed.ID === this.openPackage)[0];
              const targetOER = targetPackage?.educational_contents?.filter(o => o.ID === this.openOER)[0];
              this.setCurrentOER(targetOER, targetPackage?.ID);
            })
          }
        }
      }
    })
  }

  getTopicDataFromBackend(): void{
    this.httpService.getEducationPackagesByTopicFromBackend(parseInt(this.currentTopicID)).subscribe({
      next : (res:any)=>{
        const returnedTopicPackages : EducationalPackage[] = res?.educational_packages;
        if(returnedTopicPackages?.length){
          for(let i=0; i< this.educationalPackages?.length; i++){
            for(let j=0; j< returnedTopicPackages?.length; j++){
              if(this.educationalPackages[i].ID === returnedTopicPackages[j].ID){
                this.educationalPackages[i].completed = returnedTopicPackages[j].completed;
                for(let n =0; n< this.educationalPackages[i].educational_contents?.length; n++){
                  for(let y =0; y< returnedTopicPackages[i].oers?.length; y++){
                    if(this.educationalPackages[i].educational_contents[n].ID === returnedTopicPackages[i].oers[y]?.oer.ID){
                      this.educationalPackages[i].educational_contents[n].completed = returnedTopicPackages[i].oers[y]?.oer.completed;
                      break;
                    }
                  }
                }
                break;
              }
            }
          }
          this.educationalPackages?.forEach((p,index)=>{
            p?.educational_contents?.forEach((o,index2)=>{
              this.handleOEREnablingStatus(index2, index);
            })
          })
        }
      }
    })
  }

  handleOEREnablingStatus(oer_index:number, package_index:number): void{
    const previousPackages = this.educationalPackages?.filter((p, index) => index < package_index );
    const previousPackagesCompleted = previousPackages?.every(p => p.completed);
    if(previousPackagesCompleted){
      this.educationalPackages[package_index]?.educational_contents?.forEach((oer,index)=>{
        if(oer_index === 0){
          this.educationalPackages[package_index].educational_contents[oer_index].enabled = true;
        }
        else{
          if(this.educationalPackages[package_index].educational_contents[oer_index - 1].completed)
            this.educationalPackages[package_index].educational_contents[oer_index].enabled = true;
          else
            this.educationalPackages[package_index].educational_contents[oer_index].enabled = false;
        }
      });
    }
    else{
      this.educationalPackages[package_index]?.educational_contents?.forEach((oer, index)=>{
        this.educationalPackages[package_index].educational_contents[index].enabled = false;
      })
      this.educationalPackages?.forEach((p, index) => {
        if(index > package_index){
          this.educationalPackages[package_index]?.educational_contents?.forEach((oer, index2)=>{
            this.educationalPackages[package_index].educational_contents[index2].enabled = false;
          })
        }
      });
    }
    if(oer_index === 0 && package_index === 0){
      this.educationalPackages[0].educational_contents[0].enabled = true;
    }
  }


  educationalPackages: Array<EducationalPackage> = [];

  oers: any = [];

  commentFC = new FormControl();
  onCommentChange() {}
  onClick(rating: number) {
    this.ratingUpdated.emit(rating);
    this.rating = rating;
    return false;
  }

  showIcon(index: number) {
    if (this.rating >= index + 1) {
      return 'star';
    } else {
      return 'star_border';
    }
  }
  getTrustedVideoURL(videoURL: string): SafeResourceUrl {
    let srclink = videoURL;

    if (srclink.startsWith('https://www.youtube.com/watch?v=')) {
      let embedlink = srclink.replace('watch?v=', 'embed/');
      return this.domSanitizer.bypassSecurityTrustResourceUrl(embedlink);
    } else if (srclink.startsWith('https://youtu.be')) {
      let embedlink = srclink.replace(
        'https://youtu.be',
        'https://www.youtube.com/embed/'
      );
      return this.domSanitizer.bypassSecurityTrustResourceUrl(embedlink);
    } else if (srclink.startsWith('https://www.tiktok.com/')) {
      let embedlink = srclink.replace(
        'www.tiktok.com/',
        'www.tiktok.com/embed/'
      );
      return this.domSanitizer.bypassSecurityTrustResourceUrl(embedlink);
    } else {
      return this.domSanitizer.bypassSecurityTrustResourceUrl(srclink);
    }
  }

  setCurrentOER(oer:any, pid: any) {
    this.currentOER = {...oer};
    this.router.navigate([], {
      relativeTo : this.route,
      queryParams : {
        openPackage : pid,
        openOER : this.currentOER?.ID
      }
    })
  }
  oerFinished: any = [];
  openExplorationDialog(id: number, title: string, group: NodeGroup): void {
    this.dialog.open(ExplorationDialogComponent, {
      width: '1240px',
      height: '95vh',
      panelClass: 'no-spacing',
      disableClose: true,
      data: {
        id,
        title,
        group,
      },
    });
  }

  activeOer: any;

  finishOER(val: any) {
    for(let i=0; i< this.educationalPackages?.length; i++){
      for(let y=0; y< this.educationalPackages[i]?.educational_contents?.length; y++){
        if(this.educationalPackages[i].ID === this.openPackage){
          if(y === this.educationalPackages[i].educational_contents.length -1){
            this.educationalPackages[i].completed = true;
          }
        }
        this.handleOEREnablingStatus(y, i);
        if(this.educationalPackages[i]?.educational_contents[y]?.ID == parseInt(val.id)){
          this.educationalPackages[i].educational_contents[y].completed = true;
          break;
        }
      }
    }
  }

  goBackDiagram(): void{
    this.router.navigate(['/diagram'], {
      queryParams : {
        journey_id : this.currentJourneyID,
        journey_title : this.recommendation?.title
      }
    })
    this.matomoService.trackEvent('ButtonGoBackDiagram','goBackDiagramClicked','goBackDiagram');
  }

  handleNextClick(event:any): void{
    this.matomoService.trackEvent('NextClickButton','NextClick','Next');
    // Get the current package
    const currentPackage = this.educationalPackages?.filter(p => p.ID === this.openPackage)[0];
    // get current oer index in the current package
    let currentOERIndex = 0;
    // loop until access the index of the opened oer in the opened package
    // then break;
    for(let i=0; i < currentPackage?.educational_contents?.length; i++){
      if(currentPackage.educational_contents[i].ID === this.openOER){
        currentOERIndex = i;
        break;
      }
    }
    // if the current oer index less than the total number of package oers - 1
    // so it is not the last oer in the package
    // get next oer and set it.
    if(currentOERIndex < currentPackage.educational_contents?.length -1){
      const nextOER = currentPackage.educational_contents[currentOERIndex + 1];
      this.currentOER = {...nextOER};
      this.setCurrentOER(nextOER, this.openPackage);
    }
    // if the current oer is the last oer in the opened package
    else{
      // get the current package index
      let currentPackageIndex = 0;
      for(let i=0; i < this.educationalPackages?.length; i++){
        if(this.educationalPackages[i].ID === this.openPackage){
          currentPackageIndex = i;
          break;
        }
      }
      // if the package not the last package in the topic
      // get next package in the topic and set next oer as the 
      // first oer in the new package
      if(currentPackageIndex < this.educationalPackages?.length - 1){
        const nextPackage = this.educationalPackages[currentPackageIndex + 1];
        const nextOER = nextPackage?.educational_contents[0];
        if(nextOER){
          this.currentOER = {...nextOER};
          this.setCurrentOER(nextOER, nextPackage.ID);
        }
      }
      // if the package is the last package in the topic.
      else{
        // Loop courses
        for(let i=0; i < this.recommendation?.courses?.length; i++){
          // loop each course topics
          for(let y=0; y < this.recommendation?.courses[i]?.topics?.length; y++){
            // if the current topic is the same as the opened topic
            if(+(this.currentTopicID) === this.recommendation?.courses[i]?.topics[y]?.ID){
              // if the topic is last topic in the course
              if(y === this.recommendation?.courses[i]?.topics?.length - 1){
                // if the course is last course in the journey
                if(i === this.recommendation?.courses?.length - 1){
                  // message with journey.
                  this.snackbarService.show("You have finished the learning journey.", 'success');
                  this.router.navigate(['/diagram'], {
                    queryParams : {
                      journey_id : this.currentJourneyID,
                      journey_title : this.recommendation?.title
                    }
                  })
                  break;
                }
                // if not the course is lst course
                else{
                  const nextCourseID = this.recommendation?.courses[i + 1]?.ID;
                  const nextTopicID = this.recommendation?.courses[i + 1]?.topics[0]?.ID;
                  const nextPackageID = this.recommendation?.courses[i]?.topics[0]?.educational_packages[0]?.ID;
                  const nextOERID = this.recommendation?.courses[i]?.topics[0]?.educational_packages[0]?.educational_contents[0]?.ID;
                  console.log(nextCourseID);
                  console.log(nextTopicID);
                  console.log(nextOERID);
                  console.log(nextPackageID)
                  if(nextCourseID && nextTopicID && nextPackageID && nextOERID){
                    this.router.navigate(['..', '..' , '..', nextCourseID , 'topic', nextTopicID], {
                      relativeTo : this.route,
                      queryParams : {
                        openPackage : nextPackageID,
                        openOER : nextOERID
                      }
                    }).then(()=> window.location.reload());
                  }
                  break;
                }
              }
              // if the topic is not the last topic in the course
              else{
                // theres a topic existing after this topic, get it and continue
                const nextTopicID = String(this.recommendation?.courses[i]?.topics[y+1]?.ID);
                const nextPackageID = this.recommendation?.courses[i]?.topics[y+1]?.educational_packages[0]?.ID;
                const nextOERID = this.recommendation?.courses[i]?.topics[y+1]?.educational_packages[0]?.educational_contents[0]?.ID;
                if(nextTopicID && nextPackageID && nextOERID){
                  this.router.navigate(['..', nextTopicID], {
                    relativeTo : this.route,
                    queryParams : {
                      openPackage : nextPackageID,
                      openOER : nextOERID
                    }
                  }).then(()=> window.location.reload());
                }
                break;
              }
            }
            else{
              continue;
            }
          }
        }
      }
    }
  }

}
