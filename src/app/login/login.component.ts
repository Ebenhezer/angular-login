import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SignInData } from '../model/signInData';
import { AuthenticationService } from '../service/authentication/authentication.service';

@Component({
  selector: 'cf-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isFormInValid = false;
  areCredentialsInvalid = false;

  constructor(private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
  }
  
  onSubmit(signInForm: NgForm){
    console.log(signInForm.value)
    if(!signInForm.valid){
      this.isFormInValid = true;
      this.areCredentialsInvalid = false;
      return;
    }
    this.checkCredentials(signInForm);
  }

  private checkCredentials(signInForm: NgForm){
    const signInData = new SignInData(signInForm.value.email, signInForm.value.password);
    if(!this.authenticationService.authenticate(signInData)){
      this.isFormInValid = false;
      this.areCredentialsInvalid= true;
    }
  }
}
