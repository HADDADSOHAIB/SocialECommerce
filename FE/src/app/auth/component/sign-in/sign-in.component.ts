import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth-service/auth.service';
import { AccountService } from 'src/app/services/account-service/account.service';
import { Credentials } from 'src/app/models/credentials';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {
  form=new FormGroup({
    email: new FormControl('',[Validators.required,Validators.email]),
    password:new FormControl('',[Validators.required])
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private accountService: AccountService
  
  ) { }

  Login(){
    let credentials=new Credentials(this.form.get('email').value,this.form.get('password').value);
    this.authService.login(credentials).subscribe(resp=>{
      localStorage.setItem('token',resp.token);
      this.accountService.loadCurrentUser();
      this.router.navigate(["/"]);
    },error=>alert(error));
  }
}