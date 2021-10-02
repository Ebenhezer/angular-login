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
export class WorkstationsService {

  constructor(private router: Router, private http: HttpClient) { }
  empty = []
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

  private message = new BehaviorSubject<any>("");
  profileData = this.message.asObservable();

  private sCount = new BehaviorSubject<any>("");
  sCountWorkstation = this.sCount.asObservable();

  private sList = new BehaviorSubject<any>("");
  sListData = this.sList.asObservable();

  private sHistory = new BehaviorSubject<any>("");
  sHistoryData = this.sHistory.asObservable();

  workstations(payload): Observable<any> {
    return this.http.get(AUTH_API + 'ws/count',{params: payload});
  }
  countWorkstations(){
    this.workstations(this.payload).subscribe(
      response => {
        console.log(response);
        if(response.success){
          this.sCountResponse(response.success);
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

  workstationList(payload): Observable<any> {
    return this.http.get(AUTH_API + 'ws/list',{params: payload});
  }

  getListOfWorkstation(){
    this.workstationList(this.payload).subscribe(
      response => {
        if(response.success){
          this.sListResponse(response.success);
          console.log(response);
          return true;
        }
        else if(response.failed){
          console.log(response);
          this.sListResponse(this.empty);
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

  workstationHistory(payload): Observable<any> {
    //return this.http.post<any>(AUTH_API + 'ws/data',{params: payload });
    return this.http.post<any>(AUTH_API + 'ws/data', payload, { params: this.request_body, });
  }

  getWorkstationHistory(){
    this.workstationHistory(this.body).subscribe(
      response => {
        console.log(response);
        if(response.success){
          this.sHistoryResponse(response.success);
          console.log(response);
          return true;
        }
        else if(response.failed){
          console.log(response);
          this.sHistoryResponse(this.empty);
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

  responseMessage(message: any){
    return this.message.next(message)
  }
  sCountResponse(sCount: any){
    return this.sCount.next(sCount)
  }
  sListResponse(message: any){
    return this.sList.next(message)
  }
  sHistoryResponse(message: any){
    return this.sHistory.next(message)
  }
}
