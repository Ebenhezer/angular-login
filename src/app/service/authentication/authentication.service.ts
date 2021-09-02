import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SignInData } from 'src/app/model/signInData';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private readonly mockedUser = new SignInData('emabotha@gmail.com', '1234567');
  isAuthenticated = sessionStorage.getItem("isAuthenticated");

  constructor(private router: Router) { }
  authenticate(signInData:SignInData): boolean {

    if(this.isAuthenticated == "true"){
      sessionStorage.setItem("isAuthenticated", "true");
      this.router.navigate(['home'])
      return true;
    }

    if(this.checkCredentials(signInData)){
      sessionStorage.setItem("apiKey", "56565656566565656656");
      sessionStorage.setItem("isAuthenticated", "true");

      this.isAuthenticated = "true";
      this.router.navigate(['home'])
      return true;
    }

    sessionStorage.setItem("isAuthenticated", "false");
    return false;
      
  }

  private checkCredentials(signInData): boolean{
    return this.checkEmail(signInData.getEmail()) && this.checkPassword(signInData.getPassword());
  }

  private checkEmail(email: string): boolean{
    return email === this.mockedUser.getEmail();
  }

  private checkPassword(password: string): boolean{
    return password === this.mockedUser.getPassword();
  }

  logout(){
    sessionStorage.clear();
    this.router.navigate([''])
    
    location.reload();// This sis a bit of a hack. There should be a better way. 
    //If removed, the navigation remains after logout but disappers after refresh
  }
}
