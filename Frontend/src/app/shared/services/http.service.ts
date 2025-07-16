import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient) {}

  public register(newUser: any) {
    return this.http.post(environment.backendUrl + '/auth/register', newUser);
  }

  public login(credentials: any) {
    return this.http.post(environment.backendUrl + '/auth/login', credentials);
  }


public saveJourney(id:number,title:string){
  return this.http.post(environment.backendUrl + '/journey/create_journey_history', {journey_id:id,journey_title:title},
  this.getToken()
  );
}

  public getTopics() {
    return this.http.get(
      environment.backendUrl + '/topic/get',
      this.getToken()
    );
  }

  public getTopicsByCourse(courseId: number) {
    return this.http.get(
      environment.backendUrl + '/topic/get-by-course?course_id=' + courseId,
      this.getToken()
    );
  }

  public getTopic(topicId: number) {
    return this.http.get(
      environment.backendUrl + '/topic/get-one?topic_id=' + topicId,
      this.getToken()
    );
  }

  public getRelatedTopics(title: string) {
    return this.http.get(
      environment.backendUrl + '/topic/get-related-topics?topic_name=' + title,
      this.getToken()
    );
  }

  public getCourses() {
    return this.http.get(
      environment.backendUrl + '/course/get',
      this.getToken()
    );
  }

  public getCourse(courseId: number) {
    return this.http.get(
      environment.backendUrl + '/course/get-one?course_id=' + courseId,
      this.getToken()
    );
  }

  public getRelatedCourses(title: string) {
    return this.http.get(
      environment.backendUrl +
        '/course/get-related-courses?course_name=' +
        title,
      this.getToken()
    );
  }

  public getCoursesByJourney(journeyId: number) {
    return this.http.get(
      environment.backendUrl + '/course/get-by-journey?journey_id=' + journeyId,
      this.getToken()
    );
  }

  public getEducationalPackage(educationalPackageId: number) {
    return this.http.get(
      environment.backendUrl +
        '/educational-package/get-one?educational_package_id=' +
        educationalPackageId,
      this.getToken()
    );
  }

  public getEducationalPackagesByTopic(topicId: number) {
    return this.http.get(
      environment.backendUrl +
        '/educational-package/get-by-topic?topic_id=' +
        topicId,
      this.getToken()
    );
  }

  public getRelatedEducationalPackages(title: string) {
    return this.http.get(
      environment.backendUrl +
        '/educational-package/get-related-educational-packages?educational_package_name=' +
        title,
      this.getToken()
    );
  }

  public getOER(oerId: number) {
    return this.http.get(
      environment.backendUrl + '/oer/get-one?oer_id=' + oerId,
      this.getToken()
    );
  }

  public getOERsByEducationalPackage(educationalPackageId: number) {
    return this.http.get(
      environment.backendUrl +
        '/oer/get-by-educational-package?educational_package_id=' +
        educationalPackageId,
      this.getToken()
    );
  }

  public storeUserProfile(data: any) {
    return this.http.post(
      environment.backendUrl + '/user-profile/store',
      data,
      this.getToken()
    );
  }

  public getUserProfile() {
    return this.http.get(
      environment.backendUrl + '/user-profile/get',
      this.getToken()
    );
  }

  public getUserJourney(){
    return this.http.get(
      environment.backendUrl + '/journey/get_by_user',
      this.getToken()
    );
  }

  public getRecommendations(data: any) {
    return this.http.post(
      environment.backendUrl + '/recommendation/get',
      data,
      this.getToken()
    );
  }

  public getAllJournies() {
    return this.http.get(
      environment.backendUrl + '/recommendation/get-all-journies',
      this.getToken()
    );
  }

  public getJourneyHistory() {
    return this.http.get(
      environment.backendUrl + '/recommendation/get-journey-history',
      this.getToken()
    );
  }

  public getJourniesByIndustry(industry: string) {
    return this.http.get(
      environment.backendUrl +
        '/recommendation/get-industry-journies?industry=' +
        industry,
      this.getToken()
    );
  }

  public getLinkRelation(
    sourceType: string,
    sourceId: number,
    targetType: string,
    targetId: number
  ) {
    return this.http.get(
      environment.backendUrl +
        `/relation/get-all?source_type=${sourceType}&source_id=${sourceId}&target_type=${targetType}&target_id=${targetId}`,
      this.getToken()
    );
  }

  public getNodeInformation(sourceType: string, sourceId: number) {
    return this.http.get(
      environment.backendUrl +
        `/relation/get-node-information?source_type=${sourceType}&source_id=${sourceId}`,
      this.getToken()
    );
  }

  public getExpandedNodeInformation(nodeId: number, nodeType: string) {
    return this.http.get(
      environment.backendUrl +
        `/relation/get-expanded-node-information?node_id=${nodeId}&node_type=${nodeType}`,
      this.getToken()
    );
  }

  private getToken() {
    if (localStorage.getItem('token') != null) {
      let headers = new HttpHeaders().set(
        'Authorization',
        'Bearer ' + localStorage.getItem('token')
      );
      headers.set('Content-Type', 'application/json');
      return {
        headers,
      };
    }
    return null;
  }
   ////////////////////////////////////////////////////////
  public getSessions() {
    return this.http.get(
      environment.backendUrl + '/session/get',
      this.getToken()
    );
  }

  public getInvites() {
    return this.http.get(
      environment.backendUrl + '/invite/get',
      this.getToken()
    );
  }

  
  public updateInvite(data : any){
    return this.http.post(
      environment.backendUrl + '/invite/update',
      data,
      this.getToken()
    );
  }

  public createSession() {
    return this.http.post(
      environment.backendUrl + '/session/create',
      null,
      this.getToken()
      );
  }

  public getMessages(session_id : string) {
    return this.http.get(
      environment.backendUrl + `/message/get?session_id=${session_id}` ,
      this.getToken()
    );
  }

  public upload(formData : FormData){
    return this.http.post(
      environment.backendUrl + '/file/upload',
      formData,
      this.getToken()
    );
  }

  public sendInvite(expertCategory : any){
    return this.http.post(
      environment.backendUrl + '/invite/create',
      expertCategory,
      this.getToken()
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    // return an observable with a user-facing error message
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }

  public getOERsByEdPackage(id:number) {
    return this.http.get(
      environment.backendUrl + '/oer/get-by-educational-package',
      this.getToken()
    );
  }

  public getOERsAndEPsByTopic(topicId: number) {
    return this.http.get(
      environment.backendUrl + '/oer/get-and-educational-packages-by-topic',
      this.getToken()
    );
  }



  public getEducationPackagesByTopicFromBackend(id:number) {
    return this.http.get(
      environment.backendUrl + '/oer/get-and-educational-packages-by-topic',
      {
        ...this.getToken(),
        params : {
          topic_id : id
        }
      }
    );
  }

  public setOERCompleted(oerId : number) {
    return this.http.post(
      environment.backendUrl + '/user/complete_oer',
      
      {oer_id : oerId},
      this.getToken()
    );
  }

  

  public getAllEducationPackagesFromBackend(){
    return this.http.get(
      environment.backendUrl + '/educational-package/get_all_educational_packages',
      {
        ...this.getToken()
      }
    );
  }

  public getAllCourses(){
    return this.http.get(
      environment.backendUrl + '/course/get',
      {
        ...this.getToken()
      }
    );
  }

  public getAllCoursesByJourneyID(jid: number){
    return this.http.get(
      environment.backendUrl + '/course/get-by-journey',
      {
        ...this.getToken(),
        params : {
          journey_id : jid
        }
      }
    );
  }

  public getAllTopics(){
    return this.http.get(
      environment.backendUrl + '/topic/get',
      {
        ...this.getToken()
      }
    );
  }

  public getAllTopicsByJourneyID(jid: number){
    return this.http.get(
      environment.backendUrl + '/topic/get-by-journey',
      {
        ...this.getToken(),
        params : {
          journey_id : jid
        }
      }
    );
  }

  public getAllOERsFromBackend(){
    return this.http.get(
      environment.backendUrl + '/oer/get_all_OERs',
      {
        ...this.getToken()
      }
    );
  }

  public getNextTopic(currentTopicId : number){
    return this.http.get(
      environment.backendUrl + '/topic/get-next-topic',
      {
        ...this.getToken(),
        params : {
          current_topic_id: currentTopicId
        }
      }
    );
  }

  public getALlTopicsByJourney(journey_id : number){
    return this.http.get(
      environment.backendUrl + '/topic/get-by-journey',
      {
        ...this.getToken()
      }
    );
  }


  public getCurrentSite(){
    return this.http.get(
      environment.backendUrl + '/user/get-current-site',
      {
        ...this.getToken()
      }
    );
  }

  public updateCurrentSite(newCurrentSite : number) {
    return this.http.post(
      environment.backendUrl + '/user/update-current-site',
      
      {new_current_site : newCurrentSite},
      this.getToken()
    );
  }

   //Here add feddback 
   public addFeedback(oer_id:number,rating:number, text:string ) {
    return this.http.post(
      environment.backendUrl + '/oer/add-feedback',
      {oer_id:oer_id,rating:rating ,text:text},
      this.getToken()
      );
  }

  //Here take last Comment by OERID return (comment,feedback_id,rating,timestamp,user_id)
  public getLastComment(oer_id: number) {
    return this.http.get(
      environment.backendUrl + '/oer/get-last-comment',
      {
        params : {
          oer_id : oer_id,
        },
        ...this.getToken()
      }
    );
  }

   //Here send the new Comment by OERid and seny new comment for spical (FeedbackId)  \\ \\
   public editComment(oerId:number,new_text:string,feedback_id:number , new_rating : number) {
    return this.http.post(
      environment.backendUrl + '/oer/edit-comment',
      {oer_id:oerId,new_text:new_text,feedback_id: feedback_id , new_rating},
      this.getToken()
      );
  }

  //Here take last Rating by OERID return(comment,feedback_id,rating,timestamp,user_id )
  public getLastRating(oerId: number) {
    return this.http.get(
      environment.backendUrl + '/oer/get-last-rating',
      {
        params : {
          oer_id : oerId,
        },
        ...this.getToken()
      }
    );
  }

  //Here take All FeedbacksFor One User by OERID retrun( "average_rating =" , "comments"{1.(ID,comment,timestamp,user_id)}{2}{3}
  public getAllFeeddbacksForOneOERFromOneUser(oer_id: number) {
    return this.http.get(
      environment.backendUrl + '/oer/get-feedback',
      {
        params : {
          oer_id : oer_id,
        },
        ...this.getToken()
      }
    );
  }


  //Here take All OERs by Journey 
  public getAllOERsByJourney(journey_id: number) {
    return this.http.get(
      environment.backendUrl + '/oer/get-by-journey',
      {
        params : {
          journey_id : journey_id,
        },
        ...this.getToken()
      }
    );
  }

   //Here take All EPs by Journey 
   public getAllEPsByJourney(journey_id: number) {
    return this.http.get(
      environment.backendUrl + '/educational-package/get-by-topic',
      {
        params : {
          journey_id : journey_id,
        },
        ...this.getToken()
      }
    );
  }

  //Here get last Journey 
  public getLastJourneyID() {
    return this.http.get(
      environment.backendUrl + '/user/get-last-journey',
      {
        ...this.getToken()
      }
    );
  }

//Here set last Journey
public setLastJourneyID(journey_id: number) {
  return this.http.post(
    environment.backendUrl + '/user/set-last-journey',
    {journey_id : journey_id},
    {
      ...this.getToken()
    }
    );
}

//Here get UserId by Token
public getUserID() {
  return this.http.get(
    environment.backendUrl + '/user/get-user-id',
    {
      ...this.getToken()
    }
  );
}


}
