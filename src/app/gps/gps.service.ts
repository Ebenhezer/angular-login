import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as server from "../../assets/config/server.json";

// const AUTH_API = 'http://192.168.50.142/interface/';
const AUTH_API = server.server_ip;
@Injectable({
  providedIn: 'root'
})
export class GpsService {

  constructor(private router: Router, private http: HttpClient) { }
  
  destroy$: Subject<boolean> = new Subject<boolean>();
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

  gps(payload): Observable<any> {
    return this.http.get(AUTH_API + 'gps/count',{params: payload});
  }

  gpsList(payload): Observable<any> {
    return this.http.get(AUTH_API + 'gps/list',{params: payload});
  }
  
  gpsHistory(payload): Observable<any> {
    //return this.http.post<any>(AUTH_API + 'gps/data',{params: payload });
    return this.http.post<any>(AUTH_API + 'gps/data', payload, { params: this.request_body, });
  }

  addGps(payload): Observable<any> {
    //return this.http.post<any>(AUTH_API + 'sensor/data',{params: payload });
    return this.http.post<any>(AUTH_API + 'add/gps', payload, { params: payload });
  }

}
