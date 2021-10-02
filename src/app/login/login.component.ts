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
  response_message:string = '';

  constructor(private authenticationService: AuthenticationService) { 
    // To disable the navigation bar
    sessionStorage.clear();
  }

  ngOnInit(): void {
    // To disable the navigation bar
    sessionStorage.clear();
  }
  
  onSubmit(signInForm: NgForm){
    
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
      this.authenticationService.api_failed_message.subscribe(response_message => this.response_message = response_message);
      // if(this.response_message.length == 0){
      //   this.response_message = "Failed to register account";
      // }
    }
  }
}
