import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SignUpData } from 'src/app/model/signUpData';
import { AuthenticationService } from '../service/authentication/authentication.service';

@Component({
  selector: 'cf-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  isFormInValid = false;
  areCredentialsInvalid = false;
  response_message:string;
  constructor(private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
  }
  onSubmit(signUpForm: NgForm){
    
    if(!signUpForm.valid){
      this.isFormInValid = true;
      this.areCredentialsInvalid = false;
      return;
    }
    this.checkData(signUpForm);
  }

  private checkData(signUpForm: NgForm){
    const signUpData = new SignUpData(signUpForm.value.firstname, 
      signUpForm.value.lastname,
      signUpForm.value.email,
      signUpForm.value.password,
      signUpForm.value.gender,
      signUpForm.value.lastname);
    
    var register = this.authenticationService.signUp(signUpData);
    console.log(register)
    if(!register){
      this.isFormInValid = false;
      this.areCredentialsInvalid= true;
      this.authenticationService.api_failed_message.subscribe(response_message => this.response_message = response_message);

      if(this.response_message.length == 0){
        this.response_message = "Failed to register account";
      }
    }
  }

}
