import { Component, OnInit } from '@angular/core';
import { DataService } from '../service/data/data.service';
import { SensorService } from '../sensors/sensor.service';
import { GpsService } from '../gps/gps.service';
import { SwitchesService } from '../switches/switches.service';
import { WorkstationsService } from '../workstations/workstations.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'cf-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss',
              '../../assets/css/material-dashboard.css']
})
export class HomeComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();
  apiKey= sessionStorage.getItem("apiKey");
  payload ={
    "api_key":this.apiKey,
    'min_epoch_tm_sec': 1628353097,
    'max_epoch_tm_sec': 1999999999 
  };
  request_body = new HttpParams()
      .append('api_key', this.apiKey)
      .append('min_epoch_tm_sec', '1633300722')
      .append('max_epoch_tm_sec', '1999999999');

  body=JSON.stringify(this.request_body);
  response_message:any = '';
  
  nrOfSensors:any = 0;
  sensorList: any = [];
  sensorData: any  = [];

  gps: any = 0;
  gpsList: any = [];
  gpsData: any  = [];

  switches:any = 0;
  switchList: any = [];
  switchData: any  = [];

  workstations:any = 0;
  workstationList: any = [];
  workstationData: any  = [];

  dtOptions: DataTables.Settings = {
    "order": [2, "desc"]
  };

  constructor(private dataService: DataService,
              private sensorService: SensorService,
              private switchService: SwitchesService,
              private gpsService: GpsService,
              private workstationService: WorkstationsService,
              private http: HttpClient) { }

  ngOnInit(): void {

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    };
  
    const profileData = this.dataService.getProfile();
    this.dataService.profileData.pipe(takeUntil(this.destroy$)).subscribe(response =>{ 
      this.response_message = response;
      console.log(response);
    });

    this.countSensors();
    this.getSensorData();
    this.getSensorList();

    this.countSwitches();
    this.getSwitchList();
    this.getSwitchData();

    this.countWorkstations();
    this.getWorkstationList();
    this. getWorkstationData();

    this.countGps();
    this.getGpsList();
    this.getGpsData();

  }

  //  Sensor inforomation
  countSensors(){
    this.sensorService.sensors(this.payload).subscribe(
      response => {
        console.log(response);
        try {
          if(response.success){
            this.nrOfSensors = response.success;
            return true;
          }
        }catch (e){
          console.log("Not authenticated")
        }
      },
      err => {
        console.log(err)
        var errorMessage = err.error.message;
        console.log(errorMessage)
      }
    );
  }
  getSensorList(){
    this.sensorService.sensorList(this.payload).subscribe(
      response => {
        try {
          if(response.success){
            console.log(response);
            this.sensorList = response.success;
          }
        
        }catch (e){
          console.log("Not authenticated");
        }
      },
      err => {
        var errorMessage = err.error.message;
        console.log(errorMessage);
      });
  }
  getSensorData(){
    this.sensorService.sensorHistory(this.body).pipe(takeUntil(this.destroy$)).subscribe(response => {
      this.sensorData = response.success;
      console.log(this.sensorData);
    },
    err => {
      console.log(err)
    });
  }

  // Switch information
  countSwitches(){
    this.switchService.switches(this.payload).subscribe(
      response => {
        console.log(response);
        if(response.success){
          this.switches =  response.success;
        }
      },
      err => {
        console.log(err)
      }
    );
  }
  getSwitchList(){
    this.switchService.swithcList(this.payload).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if(response.success){
          this.switchList = response.success;
          console.log(response);
          return true;
        }
      },
      err => {
        console.log(err)
      }
    );
  }
  getSwitchData(){
    this.switchService.switchHistory(this.body).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        console.log(response);
        if(response.success){
          this.switchData = response.success;
          console.log(response);
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  // Workstation information
  countWorkstations(){
    this.workstationService.workstations(this.payload).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        console.log(response);
        if(response.success){
          this.workstations = response.success;
        }
      },
      err => {
        console.log(err);
      }
    );
  }
  getWorkstationList(){
    this.workstationService.workstationList(this.payload).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        try{
          if(response.success){
            this.workstationList = response.success;
            console.log(response);
            return true;
          }
        }catch{
          console.log("Failed to get sensor list");
        }
      },
      err => {
        console.log(err);
      }
    );

  }
  getWorkstationData(){
    this.workstationService.workstationHistory(this.body).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        console.log(response);
        try{
          if(response.success){
            this.workstationData = response.success;
            console.log(response);
          }
        }catch{
          console.log("Failed to get workstation history");
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  // GPS information
  countGps(){
    this.gpsService.gps(this.payload).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        try{
          if(response.success){
            console.log(response);
            this.gps = response.success;
            return true;
          }
        }catch{
          console.log("Failed to count gps");
        }
      },
      err => {
        console.log(err);
      }
    );
  }
  getGpsList(){
    this.gpsService.gpsList(this.payload).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        try{
          if(response.success){
            this.gpsList = response.success;
            console.log(response);
            return true;
          }
        }catch{
          console.log("Failed to get gps list");
        }
      },
      err => {
        console.log(err);
      }
    );
  }
  getGpsData(){
    this.gpsService.gpsHistory(this.body).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        try{
          if(response.success){
            this.gpsData = response.success;
            console.log(response);
          }
        }catch{
          console.log("Failed to get GPS history");
        }
        
      },
      err => {
        console.log(err)
      }
    );
  }


}
