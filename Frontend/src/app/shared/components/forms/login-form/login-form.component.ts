import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppLoaderService } from 'src/app/shared/services/app-loader.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { TopbarService } from 'src/app/shared/services/topbar.service';
import { ValidationService } from 'src/app/shared/services/validation.service';

@Component({
  selector: 'login-form',
  templateUrl: './login-form.component.html',

})
export class LoginFormComponent implements OnInit {
  @ViewChild('form') form: any;
  public itemForm: UntypedFormGroup;
  public hasError: boolean = false;
  public errors: any = {};
  public showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private appLoader: AppLoaderService,
    private router: Router,
    private topbarService:TopbarService
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm() {
    this.itemForm = new UntypedFormGroup({
      email: new UntypedFormControl('', [
        Validators.required,
        ValidationService.emailValidator,
      ]),
      password: new UntypedFormControl('', [Validators.required]),
    });
  }

  async onSubmit() {
    if (this.itemForm.invalid) {
      this.hasError = true;
      this.errors = ValidationService.getValidationErrors(this.itemForm);

      return;
    }

    const { email, password } = this.itemForm.value;
    const credentials = { email, password };

    this.appLoader.open();

    await firstValueFrom(this.authService.login(credentials))
      .then((res: any) => {
        this.router.navigateByUrl('/home');
        this.topbarService.display()
      })
      .catch((e) => {
        this.snackbarService.show(e.error.message, 'danger');
      });

    this.appLoader.close();
  }
  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
