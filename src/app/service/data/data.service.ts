import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams  } from '@angular/common/http';
import { Router } from '@angular/router';
import * as server from "../../../assets/config/server.json";

// const AUTH_API = 'http://192.168.50.142/interface/';
const AUTH_API = server.server_ip;

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private router: Router, private http: HttpClient) { }
  
  apiKey= sessionStorage.getItem("apiKey");
  private message = new BehaviorSubject<string>("");
  profileData = this.message.asObservable();

  payload ={
    "api_key":this.apiKey 
  };
  params = { params: new HttpParams({fromString: "api_key="+this.apiKey}) };

  profile(payload): Observable<any> {
    return this.http.get(AUTH_API + 'user/profile',{params: payload} );
  }
  getProfile(){
    this.profile(this.payload).subscribe(
      response => {
        if(response.success){
          //Assign the profile information to the session
          this.responseMessage(response.success);
          sessionStorage.setItem("user_id", response.success["user_id"]);
          sessionStorage.setItem("email", response.success["email"]);
          sessionStorage.setItem("firstname", response.success["firstname"]);
          sessionStorage.setItem("surname", response.success["surname"]);
          sessionStorage.setItem("gender", response.success["gender"]);
          sessionStorage.setItem("username", response.success["username"]);
          sessionStorage.setItem("api_key", response.success["api_key"]);
          sessionStorage.setItem("cellphone", response.success["cellphone"]);
          sessionStorage.setItem("date_of_birth", response.success["date_of_birth"]);
          return true;
        }
        else if(response.failed){
          this.responseMessage(response.failed);
          sessionStorage.setItem("isAuthenticated", "flase");
          this.router.navigate(['login']);
          return false;
        }
        else{
          this.responseMessage(response);
          sessionStorage.setItem("isAuthenticated", "false");
          this.router.navigate(['login']);
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

  
  switches(payload): Observable<any> {
    return this.http.get(AUTH_API + 'switches',{params: payload});
  }
  workstations(payload): Observable<any> {
    return this.http.get(AUTH_API + 'workstations',{params: payload});
  }
  gps(payload): Observable<any> {
    return this.http.get(AUTH_API + 'gps',{params: payload});
  }

  responseMessage(message: string){
    return this.message.next(message)
  }

  getRandomToken(length) {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for ( var i = 0; i < length; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
  }
}
