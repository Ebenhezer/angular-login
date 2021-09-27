import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import * as server from "../../assets/config/server.json";

// const AUTH_API = 'http://192.168.50.142/interface/';
const AUTH_API = server.server_ip;

@Injectable({
  providedIn: 'root'
})
export class SwitchesService {

  constructor(private router: Router, private http: HttpClient) { }

  apiKey= sessionStorage.getItem("apiKey");
  payload ={
    "api_key":this.apiKey,
    'min_epoch_tm_sec': 1628353097,
    'max_epoch_tm_sec': 1999999999 
  };
  request_body = new HttpParams()
      .append('api_key', this.apiKey)
      .append('min_epoch_tm_sec', '1628353097')
      .append('max_epoch_tm_sec', '1999999999');

  body=JSON.stringify(this.request_body);

  private message = new BehaviorSubject<string>("");
  profileData = this.message.asObservable();

  private sCount = new BehaviorSubject<string>("");
  sCountSwitches = this.sCount.asObservable();

  private sList = new BehaviorSubject<string>("");
  sListData = this.sList.asObservable();

  private sHistory = new BehaviorSubject<string>("");
  sHistoryData = this.sHistory.asObservable();

  switches(payload): Observable<any> {
    return this.http.get(AUTH_API + 'switch/count',{params: payload});
  }
  countSwitches(){
    this.switches(this.payload).subscribe(
      response => {
        console.log(response);
        if(response.switches){
          this.sCountResponse(response);
          return true;
        }
        else if(response.failed){
          this.sCountResponse(response.failed);
          return false;
        }
        else{
          this.sCountResponse(response);
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
  
  swithcList(payload): Observable<any> {
    return this.http.get(AUTH_API + 'switch/list',{params: payload});
  }

  getListOfSwitches(){
    this.swithcList(this.payload).subscribe(
      response => {
        if(response[0].switch_id){
          // sessionStorage.setItem("apiKey", response.access_token);
          this.sListResponse(response);
          console.log(response);
          return true;
        }
        else if(response.failed){
          console.log(response);
          this.sListResponse(response.failed);
          return false;
        }
        else{
          this.sListResponse(response);
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
  
  switchHistory(payload): Observable<any> {
    //return this.http.post<any>(AUTH_API + 'switch/data',{params: payload });
    return this.http.post<any>(AUTH_API + 'switch/data', payload, { params: this.request_body, });
  }

  getSwitchHistory(){
    this.switchHistory(this.body).subscribe(
      response => {
        console.log(response);
        if(response[0].switch_id){
          this.sHistoryResponse(response);
          console.log(response);
          return true;
        }
        else if(response.failed){
          console.log(response);
          this.sHistoryResponse(response.failed);
          return false;
        }
        else{
          this.sHistoryResponse(response);
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

  responseMessage(message: string){
    return this.message.next(message)
  }
  sCountResponse(sCount: string){
    return this.sCount.next(sCount)
  }
  sListResponse(message: string){
    return this.sList.next(message)
  }
  sHistoryResponse(message: string){
    return this.sHistory.next(message)
  }
}
