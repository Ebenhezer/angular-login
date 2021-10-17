import { Injectable, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SignInData } from 'src/app/model/signInData';
import { SignUpData } from 'src/app/model/signUpData';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import * as server from "../../../assets/config/server.json";
import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';

// const AUTH_API = 'http://192.168.50.142/interface/';
const AUTH_API = server.server_ip;

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private authStatus = new BehaviorSubject<string>(this.getAuthStatus());
  isAuthenticated = this.authStatus.asObservable();
  
  private message = new BehaviorSubject<string>("");
  api_failed_message = this.message.asObservable();

  constructor(private router: Router, private http: HttpClient) { }

  
  getAuthStatus(){
    var sessionAuthStatus = sessionStorage.getItem("isAuthenticated");
    var auth: any;
    if (sessionAuthStatus == null || sessionAuthStatus == undefined){
      auth = "false";
    }else{
      return sessionAuthStatus;
    }
  }
  login(payload): Observable<any> {
    (AUTH_API);
    return this.http.post(AUTH_API + 'login', payload, httpOptions);
  }
  register(payload): Observable<any> {
    return this.http.post(AUTH_API + 'signup', payload, httpOptions);
  }

  authenticate(signInData:SignInData): boolean {
    const payload ={
      "username": signInData.getEmail(),
      "password": signInData.getPassword(),
    };

    // if(this.isAuthenticated == "true"){

    //   sessionStorage.setItem("isAuthenticated", "true");
    //   this.router.navigate(['home'])
    //   return true;
    // }

    this.login(payload).subscribe(
      response => {
        (response);
        if(response.access_token){
          sessionStorage.setItem("apiKey", response.access_token);
          sessionStorage.setItem("isAuthenticated", "true");
          this.setAuthStatus("true")
          this.router.navigate(['home'])
          return true;
        }
        else if (response.failed){
          this.responseMesage(response.failed);
          this.setAuthStatus("false")
          return false;
        }
        else{
          sessionStorage.setItem("isAuthenticated", "false");
          //this.isAuthenticated = "false";
        }
      },
      err => {
        return false;
      }
      );

    sessionStorage.setItem("isAuthenticated", "false");
    return false;
      
  }

  signUp(signUpData: SignUpData){
    const payload ={
      "firstname": signUpData.getFirstname(),
      "lastname": signUpData.getLastname(),
      "email": signUpData.getEmail(),
      "password": signUpData.getPassword(),
      "gender": signUpData.getGender(),
      "cellphone": signUpData.getCellphone()
    };

    // if(this.isAuthenticated == "true"){

    //   sessionStorage.setItem("isAuthenticated", "true");
    //   this.router.navigate(['home'])
    //   return true;
    // }

    this.register(payload).subscribe(
      response => {
        if(response.success){
          sessionStorage.setItem("apiKey", response.access_token);
          this.router.navigate(['login']);
          return true;
        }
        else if(response.failed){
          this.responseMesage(response.failed);
          return false;
        }
        else{
          this.responseMesage(response);
        }
      },
      err => {
        (err)
        var errorMessage = err.error.message;
        (errorMessage)
      }
      );
    return false;
  }
  logout(){
    //sessionStorage.clear();
    this.router.navigate(['login']);
    this.setAuthStatus("false");
    sessionStorage.setItem("isAuthenticated", "false")
    location.reload();// This sis a bit of a hack. There should be a better way. 
    //If removed, the navigation remains after logout but disappers after refresh
  }

  responseMesage(message: string){
    return this.message.next(message)
  }

  setAuthStatus(status: string){
    return this.authStatus.next(status)
  }
}
