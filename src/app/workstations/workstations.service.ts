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
      .append('min_epoch_tm_sec', sessionStorage.getItem("min_date"))
      .append('max_epoch_tm_sec', sessionStorage.getItem("max_date"));

  body=JSON.stringify(this.request_body);

  workstations(payload): Observable<any> {
    return this.http.get(AUTH_API + 'ws/count',{params: payload});
  }

  workstationList(payload): Observable<any> {
    return this.http.get(AUTH_API + 'ws/list',{params: payload});
  }

  workstationHistory(payload): Observable<any> {
    //return this.http.post<any>(AUTH_API + 'ws/data',{params: payload });
    return this.http.post<any>(AUTH_API + 'ws/data', payload, { params: this.request_body, });
  }

  addWorkstation(payload): Observable<any> {
    //return this.http.post<any>(AUTH_API + 'sensor/data',{params: payload });
    return this.http.post<any>(AUTH_API + 'add/ws', payload, { params: payload });
  }

  deleteDevice(payload): Observable<any> {
    //return this.http.post<any>(AUTH_API + 'sensor/data',{params: payload });
    return this.http.post<any>(AUTH_API + 'delete/ws', payload, { params: payload, });
  }

}
