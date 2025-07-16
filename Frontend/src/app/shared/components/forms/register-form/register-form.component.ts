import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { AppLoaderService } from 'src/app/shared/services/app-loader.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { TopbarService } from 'src/app/shared/services/topbar.service';

@Component({
  selector: 'register-form',
  templateUrl: './register-form.component.html',
})
export class RegisterFormComponent implements OnInit {
  @ViewChild('form') form: any;
  public showPassword: boolean = false;
  public showPasswordConfirm: boolean = false;

  public itemForm: UntypedFormGroup;
  public hasError: boolean = false;
  public errors: any = {};
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
  
    const password = new UntypedFormControl('', [
      Validators.required,
      ValidationService.passwordValidator,
    ]);

    const confirmPassword = new UntypedFormControl('', [
      Validators.required,
      ValidationService.equalTo(password),
    ]);

    this.itemForm = new UntypedFormGroup({
    
      email: new UntypedFormControl('', [
        Validators.required,
        ValidationService.emailValidator,
      ]),
      password: password,
      confirmPassword: confirmPassword,
    });
  }

  async onSubmit() {
    this.hasError = false;

    if (this.itemForm.invalid) {
      this.hasError = true;
      this.errors = ValidationService.getValidationErrors(this.itemForm);
      return;
    }

    const { email, password } = this.itemForm.value;

    const newUser: any = {
      email,
      password,
    };

    this.appLoader.open();

    await firstValueFrom(this.authService.register(newUser))
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
  public togglePasswordConfirmVisibility(): void {
    this.showPasswordConfirm = !this.showPasswordConfirm;
  }
}
