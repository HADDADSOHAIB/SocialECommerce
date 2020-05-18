import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MustMatch } from '../../custom-validators/password-must-match';

import { take, last } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService } from 'src/app/services/auth-service/auth.service';
import { User } from 'src/app/models/user';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {
  credentials: User;
  form: FormGroup;
  emailOk = false;
  emailDisabled = false;
  accountCreated = false;
  creationResult$: Subject<string> = new Subject<string>();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group(
      {
        userEmail: ['', [Validators.required, Validators.email]],
        userName: ['', Validators.required],
        firstName: [''],
        lastName: [''],
        phoneNumber: [''],
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordConfirmation: ['', Validators.required],
      },
      {
        validator: MustMatch('password', 'passwordConfirmation'),
      }
    );
  }

  createAccount() {
    if (!this.form.valid) {
      this.openSnackBar('please fill or fix the red fields');
    } else {
      const { userEmail, userName, firstName, lastName, phoneNumber, password, passwordConfirmation } = this.form.value;
      const newUser = new User(
        null,
        userEmail,
        userName,
        firstName,
        lastName,
        phoneNumber,
        null,
        null,
        password,
        passwordConfirmation
      );

      this.authService
        .createAccount(newUser)
        .pipe(take(1))
        .subscribe(
          (res) => {
            this.cookieService.set("token", res.token, 30);
            this.openSnackBar("Account Created sucessfully");
            this.router.navigate(['/']);
          },
          (err) => {
            let message = "Error.";
            if(err.error.includes("Email already exist")){
              message += " Email already exist."
            }
            if(err.error.includes(" User name already exist")){
              message += " User name already exist."
            }

            this.openSnackBar(message);
          }
        );
    }
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Ok', {
      duration: 5000,
    });
  }

  checkValidity(controleName, error) {
    return this.form.get(controleName).touched && this.form.get(controleName).hasError(error);
  }
}
