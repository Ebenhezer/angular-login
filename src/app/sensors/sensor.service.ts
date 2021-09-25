import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

const AUTH_API = 'http://192.168.50.142/interface/';

@Injectable({
  providedIn: 'root'
})
export class SensorService {

  constructor(private router: Router, private http: HttpClient) { }

  apiKey= sessionStorage.getItem("apiKey");
  payload ={
    "api_key":this.apiKey 
  };

  private message = new BehaviorSubject<string>("");
  profileData = this.message.asObservable();

  private sCount = new BehaviorSubject<string>("");
  sCountData = this.sCount.asObservable();

  private sList = new BehaviorSubject<string>("");
  sListData = this.sList.asObservable();

  private sHistory = new BehaviorSubject<string>("");
  sHistoryData = this.sHistory.asObservable();

  sensors(payload): Observable<any> {
    return this.http.get(AUTH_API + 'sensor/count',{params: payload});
  }
  countSensors(){
    this.sensors(this.payload).subscribe(
      response => {
        console.log(response);
        if(response.sensors){
          // sessionStorage.setItem("apiKey", response.access_token);
          this.sCountResponse(response);
          console.log(response);
          return true;
        }
        else if(response.failed){
          console.log(response);
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

  sensorList(payload): Observable<any> {
    return this.http.get(AUTH_API + 'sensor/list',{params: payload});
  }
  getListOfSensors(){
    this.sensorList(this.payload).subscribe(
      response => {
        if(response[0].sensor_id){
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

  sensorHistory(payload): Observable<any> {
    return this.http.get(AUTH_API + 'sensor/history',{params: payload});
  }
  getSensorHistory(){
    this.sensorList(this.payload).subscribe(
      response => {
        if(response[0].sensor_id){
          // sessionStorage.setItem("apiKey", response.access_token);
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

  // sensor_trend_data = requests.get('http://interface:8888/sensor/history',
  //                     params = {'api_key': api_key}, 
  //                     json = {'min_epoch_tm_sec': session["min_epoch_tm_sec"],
  //                             'max_epoch_tm_sec': session["max_epoch_tm_sec"]})
  // sensor_history = json.loads(sensor_trend_data.content)
  // sensor_list = requests.get('http://interface:8888/sensor/list',
  //                     params = {'api_key': api_key})
  // sensor_details = json.loads(sensor_list.content)
  
  // sensors = requests.get('http://interface:8888/sensor/count',
  //                     params = {'api_key': api_key})
  // nr_sensors = json.loads(sensors.content)
  // number_of_sensors = nr_sensors["sensors"]
}
