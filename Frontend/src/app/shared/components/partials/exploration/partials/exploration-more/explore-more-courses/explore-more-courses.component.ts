import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Course } from 'src/app/shared/models/Course';
import { HttpService } from 'src/app/shared/services/http.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'explore-more-courses',
  templateUrl: './explore-more-courses.component.html',
})
export class ExploreMoreCoursesComponent implements OnInit {
  @Output() goToRelated: EventEmitter<any> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Input() course: Course;
  public isLoading: boolean;
  public relatedCourses: Course[];
  constructor(
    private httpService: HttpService,
    private snackbarService: SnackbarService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.isLoading = true;

    await firstValueFrom(this.httpService.getRelatedCourses(this.course.title))
      .then((res: any) => {
        this.relatedCourses = res.data;
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });

    this.isLoading = false;
  }

  goToProfile(): void {
    this.onClose.emit();
    this.router.navigateByUrl('/user-profile');
  }
}
