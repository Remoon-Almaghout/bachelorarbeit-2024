import { Injectable } from '@angular/core';
import {
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  constructor() {}

  static equalTo(equalControl: UntypedFormControl): any {
    return (control: UntypedFormControl) => {
      var v = control.value;
      return equalControl.value === v ? null : { equalTo: true };
    };
  }

  static passwordValidator(control: UntypedFormControl) {
    // {8,100}           - Assert password is between 8 and 100 characters
    // (?=.*[0-9])       - Assert a string has at least one number
    // (?=.*[!@#$%^&*])  - Assert a string has at least one special character.
    // (?=.*[a-z])       - Should contain at least one lower case
    // (?=.*[A-Z])       - Should contain at least one upper case

    const match = control.value.match(
      /^(?=.*[0-9])(?=.*[~!@#$%^&*-+=`|\(){}\[\]:;"'<>,.?])(?=.*[a-z])(?=.*[A-Z]).{8,100}$/
    );

    return match ? null : { invalidPassword: true };
  }

  static emailValidator(control: UntypedFormControl) {
    // RFC 2822 compliant regex
    const match = control.value.match(
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    );

    return match ? null : { invalidEmailAddress: true };
  }

  static getValidatorErrorMessage(
    validatorName: string,
    validatorValue: any = {}
  ): string {
    const config: any = {
      required: 'Field is required',
      invalidEmailAddress: 'Email Address is invalid',
      invalidPassword: 'Password is invalid',
      equalTo: 'Not equal',
    };

    return config[validatorName];
  }

  static getValidationErrors(form: UntypedFormGroup): any {
    const errors: any = {};
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      const controlErrors: ValidationErrors = control.errors;
      if (controlErrors != null) {
        const error = Object.keys(control.errors)[0];
        errors[key] = ValidationService.getValidatorErrorMessage(
          error,
          control.errors['validatorValue'] || {}
        );
      }
    });
    return errors;
  }
}
