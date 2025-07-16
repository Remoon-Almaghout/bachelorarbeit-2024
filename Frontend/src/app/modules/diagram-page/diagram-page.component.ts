import { Component } from '@angular/core';
import { firstValueFrom, forkJoin, map } from 'rxjs';
import { ActivatedRoute, NavigationExtras, ParamMap, Router } from '@angular/router';
import { HttpService } from 'src/app/shared/services/http.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatDialog } from '@angular/material/dialog';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { ExplorationDialogComponent } from 'src/app/shared/components/dialogs/exploration-dialog/exploration-dialog.component';
import { ElementNode } from 'src/app/shared/models/ElementNode';
import { FlatNode } from 'src/app/shared/models/FlatNode';
import { NodeGroup } from 'src/app/shared/models/NodeGroup';
import { Recommendation } from 'src/app/shared/models/Recommendation';
import { Course } from 'src/app/shared/models/Course';
import { Topic } from 'src/app/shared/models/Topic';
import { OER } from 'src/app/shared/models/OER';
import { MatomoService } from 'src/app/shared/services/matomo.service';

@Component({
  selector: 'app-diagram-page',
  templateUrl: './diagram-page.component.html',
  styleUrls: ['./diagram-page.component.css']
})
export class DiagramPageComponent {
  recommendations: any;
  completedCourses=2;
  totalCourses:number=0;
  selectedRecommendations: Recommendation[] = [];
  readonly NODE_GROUP = NodeGroup;
  public isLoading: boolean;
  public journeyId: number;
  public journeyTitle: string;
  public currentJourneyID : string | null = null;
  public currentCourseID : string | null = null;
  allCoursesList : any[] = [];
  allTopicsList : any[] = [];
  journeyTotalCourses = 0;
  journeyProgress = 0;
  atLeastORCompleted : boolean = false;
  recommendationJourneyIDs = [3000001, 3000002];
  selectedJourneyID : any;
  
 
  constructor(
    private dialog: MatDialog,
    private router:Router,
    private route:ActivatedRoute,
    private snackbarService: SnackbarService,
    private httpService:HttpService,
    private matomoService : MatomoService
  ) {

    this.route.queryParamMap.subscribe({
      next : (params:ParamMap)=>{
        if(params?.get('journey_id')){
          this.currentJourneyID = params?.get('journey_id');
          this.selectedJourneyID = parseInt(this.currentJourneyID);
        }
        else{
          this.currentJourneyID = null;
          this.selectedJourneyID = null;
        }
        if(params?.get('course_id'))
          this.currentCourseID = params?.get('course_id');
        else
          this.currentCourseID = null;
      }
    });
    this.matomoService.trackPageView;
  }
data:any;
journeytitle:any='';
courses:any;
topics:any=[];

isPreviousPage:boolean;

  async ngOnInit() {
    this.data=history.state['data'];
    if(!this.recommendationJourneyIDs?.includes(parseInt(this.currentJourneyID))){
      this.router.navigate([],{
        relativeTo: this.route,
        queryParams : {
          journey_id : String(this.recommendationJourneyIDs[0])
        }
      }).then(()=>{
        this.fetchData();
      })
    }
    else{
      this.fetchData();
    }
  }

  fetchData(): void{
    forkJoin([
      this.httpService.getRecommendations({journey_id:this.currentJourneyID,journey_title:""}),
      this.httpService.getAllCoursesByJourneyID(parseInt(this.currentJourneyID)),
      this.httpService.getAllTopicsByJourneyID(parseInt(this.currentJourneyID)),
      this.httpService.getAllOERsByJourney(parseInt(this.currentJourneyID))
    ]).pipe(
      map(([res, allCoursesRes, allTopicsRes, allOERRes])=>{
        this.recommendations = (res as any)?.data;
        this.selectedRecommendations = [];
        this.selectedRecommendations.push(this.recommendations?.filter( (r:any) => parseInt(this.currentJourneyID) === r?.recommended_journey?.id)[0]);
        this.journeytitle=this.selectedRecommendations[0]?.recommended_journey?.title;
        this.courses=this.selectedRecommendations[0]?.recommended_journey?.courses;
        this.totalCourses=this.selectedRecommendations[0]?.recommended_journey?.courses?.length;
        this.router.navigate([],{
          relativeTo : this.route ,
          queryParams : {
            journey_title : this.journeytitle,
          },
          queryParamsHandling : 'merge'
        })
        // ***************************************************************************************
        // ***************************************************************************************
        const journeyCourses : Course[] = (allCoursesRes as any)?.data?.length ? (allCoursesRes as any)?.data : [];
        const journeyTopics : Topic[] = (allTopicsRes as any)?.data?.length ? (allTopicsRes as any)?.data : [];
        const journeyOERs : OER[] = (allOERRes as any)?.data?.length ? (allOERRes as any)?.data : [];
        
         // Set status of oers
         for(let i = 0; i < this.courses?.length; i++){
          for(let y = 0; y < this.courses[i]?.topics?.length; y++){
            for(let z = 0; z < this.courses[i]?.topics[y]?.educational_packages?.length; z++){
              for(let x = 0; x < this.courses[i]?.topics[y]?.educational_packages[z]?.educational_contents?.length; x++){
                const oerExisitInDatabase = journeyOERs?.some(o => o.ID === this.courses[i]?.topics[y]?.educational_packages[z]?.educational_contents[x]?.ID);
                if(oerExisitInDatabase){
                  const targetOER = journeyOERs?.filter(o => o.ID === this.courses[i]?.topics[y]?.educational_packages[z]?.educational_contents[x]?.ID);
                  if(targetOER?.length){
                    this.courses[i].topics[y].educational_packages[z].educational_contents[x].completed = targetOER[0]?.completed;
                  }
                  this.courses[i].topics[y].educational_packages[z].educational_contents[x].exist = true;
                }
                else{
                  this.courses[i].topics[y].educational_packages[z].educational_contents[x].completed = true;
                  this.courses[i].topics[y].educational_packages[z].educational_contents[x].exist = false;
                }
                const oerCompleted : boolean = this.courses[i]?.topics[y]?.educational_packages[z]?.educational_contents[x]?.completed;
                if(oerCompleted && !this.atLeastORCompleted){
                  this.atLeastORCompleted = true;
                }
              }
            }
          }
        }

        // set status of packages
        for(let i = 0; i < this.courses?.length; i++){
          for(let y = 0; y < this.courses[i]?.topics?.length; y++){
            for(let z = 0; z < this.courses[i]?.topics[y]?.educational_packages?.length; z++){
              const allOERsCompleted = this.courses[i]?.topics[y]?.educational_packages[z]?.educational_contents?.every((p:any) => p.completed);
              if(allOERsCompleted){
                this.courses[i].topics[y].educational_packages[z].completed = true;
              }
              else{
                this.courses[i].topics[y].educational_packages[z].completed = false;
              }
              const totalOERS = this.courses[i]?.topics[y]?.educational_packages[z]?.educational_contents?.length;
              const completedOERS = this.courses[i]?.topics[y]?.educational_packages[z]?.educational_contents?.filter((p:any) => p.exist && p.completed)?.length;
              //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
              this.courses[i].topics[y].educational_packages[z].total = totalOERS;
              this.courses[i].topics[y].educational_packages[z].progress = completedOERS;
            }
          }
        }

        //set status for topics
        for(let i = 0; i < this.courses?.length; i++){
          for(let y = 0; y < this.courses[i]?.topics?.length; y++){
            const allPackagessCompleted = this.courses[i]?.topics[y]?.educational_packages?.every((p:any) => p.completed);
              if(allPackagessCompleted){
                this.courses[i].topics[y].completed = true;
              }
              else{
                this.courses[i].topics[y].completed = false;
              }
              const totalPackages = this.courses[i]?.topics[y]?.educational_packages?.length;
              const completedPackages = this.courses[i]?.topics[y]?.educational_packages?.filter((p:any) => p.completed)?.length;
              this.courses[i].topics[y].total = totalPackages;
              this.courses[i].topics[y].progress = completedPackages;
          }
        }

        //set status for courses
        for(let i = 0; i < this.courses?.length; i++){
          const allTopicsCompleted = this.courses[i]?.topics?.every((t:any) => t.completed);
              if(allTopicsCompleted){
                this.courses[i].completed = true;
              }
              else{
                this.courses[i].completed = false;
              }
              const totalTopics = this.courses[i]?.topics?.length;
              const completedTopics = this.courses[i]?.topics?.filter((t:any) => t.completed)?.length;
              this.courses[i].total = totalTopics;
              this.courses[i].progress = completedTopics;
        }

        // Set Journey Progress

        this.journeyTotalCourses = this.courses?.length;
        this.journeyProgress = this.courses?.filter((c:any) => c.completed)?.length;
        
      })
    ).subscribe();
    this.httpService.setLastJourneyID(+(this.currentJourneyID)).subscribe({
      next : ()=>{
      }
    })
  }

  toString(val:any): string{
    return String(val);
  }

  toNumber(val:string): number{
    return parseInt(val);
  }

  openExplorationDialog(id: number, title: string, group: NodeGroup, cid?:number): void {  
    this.selectedRecommendations[0].id = this.recommendations[0]?.recommended_journey?.id;
    this.dialog.open(ExplorationDialogComponent, {
      width: '1240px',
      height: '95vh',
      panelClass: 'no-spacing',
      disableClose: true,
      data: {
        id,
        title,
        group,
        cid : cid,
        recommendation: this.selectedRecommendations[0]?.recommended_journey,
      },
    });
  
  }
  getTopics(id:any,i:any){
    this.topics[i]=this.courses.filter((res:any)=>{
    return  res.ID==id
    })[0].topics;
  }

  navigateToTopicFromStart(): void{
   let first_topic_first_course_id = null;
   if(this.courses[0]?.topics[0]){
    first_topic_first_course_id = this.courses[0]?.topics[0].ID;
    this.currentCourseID = this.courses[0].ID;
    this.navigateToTopic(first_topic_first_course_id, this.currentCourseID);
   }
   this.matomoService.trackEvent('ButtonGotoFirstTopic','StartTopicClicked','GotoFirstTopic');
  }

  async navigateToTopic(id:any, cid:any){
    await firstValueFrom(this.httpService.updateCurrentSite(3))
    .then((res: any) => {
    })
    .catch((e) => {
      this.snackbarService.show(e.error.message, 'danger');
    });
    this.currentCourseID = cid;
    const navigationExtras: NavigationExtras = {
      state:{id:id}
    };
    this.router.navigateByUrl(`/show-topic/journey/${this.currentJourneyID}/course/${this.currentCourseID}/topic/${id}`,navigationExtras)
  }
  isExpanded:boolean=false;
  collapseAll(){
    this.isExpanded=false;
    this.matomoService.trackEvent('ButtoncollapseAll','collapseAllClicked','collapseAll');
  }
  expandAll(){
    this.isExpanded=true;
    this.matomoService.trackEvent('ButtonexpandAll','expandAllClicked','expandAll');
  }
  getPercentage(){
    return Math.floor(this.completedCourses*100/this.totalCourses);
  }
  
  continueLearning(): void{
    let targetCourseID = null;
    let targetTopicID = null;
    let targetPackageID = null;
    let targetOERID = null;
    for(let i = 0; i < this.courses?.length; i++){
      if(this.courses[i]?.completed){
        continue; 
      }
      else{
        for(let y = 0; y < this.courses[i]?.topics?.length; y++){
          if(this.courses[i]?.topics[y]?.completed){
            continue; 
          }
          else{
            for(let z = 0; z < this.courses[i]?.topics[y]?.educational_packages?.length; z++){
              if(this.courses[i]?.topics[y]?.educational_packages[z]?.completed){
                continue; 
              }
              else{
                for(let x = 0; x < this.courses[i]?.topics[y]?.educational_packages[z]?.educational_contents?.length; x++){
                  if(this.courses[i]?.topics[y]?.educational_packages[z]?.educational_contents[x]?.completed){
                    continue; 
                  }
                  else{
                    targetCourseID = this.courses[i]?.ID;
                    targetTopicID = this.courses[i]?.topics[y]?.ID;
                    targetPackageID = this.courses[i]?.topics[y]?.educational_packages[z]?.ID;
                    targetOERID = this.courses[i]?.topics[y]?.educational_packages[z]?.educational_contents[x]?.ID;
                    if(this.currentJourneyID && targetCourseID && targetTopicID && targetPackageID && targetOERID){
                      this.router.navigate(['..','show-topic', 'journey',this.currentJourneyID , 'course' , targetCourseID, 'topic' , targetTopicID] , {
                        relativeTo : this.route,
                        queryParams : {
                          openPackage : targetPackageID,
                          openOER : targetOERID
                        }
                      })
                    }
                    break;
                  }
                }
                if(targetCourseID && targetOERID && targetPackageID && targetTopicID){
                  break;
                }
              }
            }
            if(targetCourseID && targetOERID && targetPackageID && targetTopicID){
              break;
            }
          }
        }
        if(targetCourseID && targetOERID && targetPackageID && targetTopicID){
          break;
        }
      }
    }
    this.matomoService.trackEvent('ButtonContinueLearning','continueLearningClicked','continueLearning');
  }

  selectedJourneyChange(event:any): void{
    this.matomoService.trackEvent('ButtonselectedJourneyChange','selectedJourneyChange','selectedJourneyChange');
    if(event?.value){
      this.router.navigate([], {
        relativeTo : this.route,
        queryParams : {
          journey_id : event.value
        }
      }).then(()=>{
        this.fetchData();
      })
    }
  }

}

