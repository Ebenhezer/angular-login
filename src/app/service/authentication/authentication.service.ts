import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SignInData } from 'src/app/model/signInData';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const AUTH_API = 'http://192.168.50.142/interface/';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  isAuthenticated = sessionStorage.getItem("isAuthenticated");

  constructor(private router: Router, private http: HttpClient) { }

  login(payload): Observable<any> {
    return this.http.post(AUTH_API + 'login', payload, httpOptions);
  }

  authenticate(signInData:SignInData): boolean {
    const payload ={
      "username": signInData.getEmail(),
      "password": signInData.getPassword(),
    };

    if(this.isAuthenticated == "true"){

      sessionStorage.setItem("isAuthenticated", "true");
      this.router.navigate(['home'])
      return true;
    }

    this.login(payload).subscribe(
      response => {
        console.log(response)
        if(response.access_token){
          sessionStorage.setItem("apiKey", response.access_token);
          sessionStorage.setItem("isAuthenticated", "true");
          this.isAuthenticated = "true";
          this.router.navigate(['home'])
          return true;
        }
      },
      err => {
        console.log(err)
        var errorMessage = err.error.message;
        console.log(errorMessage)
      }
      );


    sessionStorage.setItem("isAuthenticated", "false");
    return false;
      
  }

  logout(){
    sessionStorage.clear();
    this.router.navigate([''])
    
    location.reload();// This sis a bit of a hack. There should be a better way. 
    //If removed, the navigation remains after logout but disappers after refresh
  }
}
