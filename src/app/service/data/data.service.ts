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
        if(response.email){
          // sessionStorage.setItem("apiKey", response.access_token);
          this.responseMessage(response);
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
        console.log(err)
        var errorMessage = err.error.message;
        console.log(errorMessage)
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
}
