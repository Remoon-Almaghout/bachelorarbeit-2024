import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { firstValueFrom, map, Observable, startWith } from 'rxjs';
import { Country } from 'src/app/shared/models/Country';
import { Course } from 'src/app/shared/models/Course';
import { Topic } from 'src/app/shared/models/Topic';
import { AppLoaderService } from 'src/app/shared/services/app-loader.service';
import { HttpService } from 'src/app/shared/services/http.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import countries from '../../../../sample_data/countries.json';
import { Router } from '@angular/router';
import { MatomoService } from 'src/app/shared/services/matomo.service';

@Component({
  selector: 'user-profile-form',
  templateUrl: './user-profile-form.component.html',
})
export class UserProfileFormComponent implements OnInit {
  @ViewChild('form') form: any;
  public itemForm: UntypedFormGroup;
  public filteredCountryOptions: Observable<Country[]>;
  public todayDate: string = new Date().toISOString().slice(0, 10);
  public topics: Topic[] = [];
  public courses: Course[] = [];
  public profile: any;
  public isLoading: boolean = true;

  constructor(
    private router: Router,
    private httpService: HttpService,
    private snackbarService: SnackbarService,
    private appLoader: AppLoaderService,
    private matomoService: MatomoService
  ) {}

  async ngOnInit() {
    this.appLoader.open();

    await firstValueFrom(this.httpService.getUserProfile())
      .then((res: any) => {
        this.profile = res.data;
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });

    this.isLoading = false;
    this.appLoader.close();

    this.buildForm();

    this.getTopics();
    this.getCourses();

    this.initCountryFilter();
  }

  private buildForm() {
    this.itemForm = new UntypedFormGroup({
      name: new UntypedFormControl(this.profile.name),
      country: new UntypedFormControl(this.profile.country),
      city: new UntypedFormControl(this.profile.city),
      dateOfBirth: new UntypedFormControl(
        this.profile.date_of_birth
          ? new Date(this.profile.date_of_birth).toISOString().slice(0, 10)
          : this.todayDate
      ),
      company: new UntypedFormControl(this.profile.company),
      biography: new UntypedFormControl(this.profile.biography),
      topics: new UntypedFormControl(this.profile.topics),
      courses: new UntypedFormControl(this.profile.courses),
      numberOfWeeks: new UntypedFormControl(
        this.profile.number_of_weeks ? this.profile.number_of_weeks : 4
      ),
      hoursPerWeek: new UntypedFormControl(
        this.profile.number_of_hours_per_week
          ? this.profile.number_of_hours_per_week
          : 8
      ),
      graphExplorationPreference: new UntypedFormControl(
        this.profile.graph_exploration_preference
          ? this.profile.graph_exploration_preference
          : 0
      ),
      educationalContentLength: new UntypedFormControl(
        this.profile.educational_content_length_preference
          ? this.profile.educational_content_length_preference
          : 1
      ),
      levelOfDetail: new UntypedFormControl(
        this.profile.level_of_detail_preference
          ? this.profile.level_of_detail_preference
          : 1
      ),
      contentType: new UntypedFormControl(
        this.profile.content_type_preference
          ? this.profile.content_type_preference
          : 0
      ),
      moreThanOneTopic: new UntypedFormControl(
        this.profile.more_than_one_topic ? this.profile.more_than_one_topic : 1
      ),
      contentInClassroom: new UntypedFormControl(
        this.profile.content_given_in_classroom
          ? this.profile.content_given_in_classroom
          : 1
      ),
      degreeVideo: new UntypedFormControl(
        this.profile.delivery_format_video
          ? this.profile.delivery_format_video
          : 3
      ),
      degreeBookChapters: new UntypedFormControl(
        this.profile.delivery_format_book_chapter
          ? this.profile.delivery_format_book_chapter
          : 3
      ),
      degreeWebpages: new UntypedFormControl(
        this.profile.delivery_format_web_pages
          ? this.profile.delivery_format_web_pages
          : 3
      ),
      degreeSlides: new UntypedFormControl(
        this.profile.delivery_format_slides
          ? this.profile.delivery_format_slides
          : 3
      ),
      degreePapers: new UntypedFormControl(
        this.profile.delivery_format_papers
          ? this.profile.delivery_format_papers
          : 3
      ),
    });
  }

  private initCountryFilter() {
    this.filteredCountryOptions = this.itemForm.controls[
      'country'
    ].valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  private _filter(value: string): Country[] {
    const filterValue = value.toLowerCase();

    return countries.filter((country: Country) =>
      country.name.toLowerCase().includes(filterValue)
    );
  }

  getCourses() {
    this.httpService.getCourses().subscribe(
      (res: any) => {
        this.courses = res.data;
      },
      (e) => {
        this.snackbarService.show(e.error.message, 'danger');
      }
    );
  }

  getTopics() {
    this.httpService.getTopics().subscribe(
      (res: any) => {
        this.topics = res.data;
      },
      (e) => {
        this.snackbarService.show(e.error.message, 'danger');
      }
    );
  }

  async onSubmit() {
    const value = this.itemForm.value;
    let currentStep = 1;
    this.appLoader.open();
    await firstValueFrom(this.httpService.getCurrentSite())
    .then((res: any) => {
      if(!isNaN(res?.current_site)){
        currentStep = res?.current_site;
      }
    }) 
    await firstValueFrom(this.httpService.updateCurrentSite( currentStep < 3 ? 2 : 3))
    .then((res: any) => {
      console.log(res);
    })
    .catch((e) => {
      this.snackbarService.show(e.error.message, 'danger');
    });
    await firstValueFrom(this.httpService.storeUserProfile(value))
      .then((res: any) => {
        this.snackbarService.show(
          'Your changes have been successfully saved',
          'success'
        );
        const ref = this.appLoader.close();
        ref.afterClosed().subscribe((res) => {
          document.body.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'start',
          });
        });
        this.router.navigate(['/home']);
        
        try {
        } catch (error: any) {
          this.snackbarService.show(error.message, 'danger');
        }
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });
  }
}
