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
        (response);
        try {
          if(response.success){
            this.nrOfSensors = response.success;
            return true;
          }
        }catch (e){
          ("Not authenticated")
        }
      },
      err => {
        (err)
        var errorMessage = err.error.message;
      }
    );
  }
  getSensorList(){
    this.sensorService.sensorList(this.payload).subscribe(
      response => {
        try {
          if(response.success){
            (response);
            this.sensorList = response.success;
          }
        
        }catch (e){
          ("Not authenticated");
        }
      },
      err => {
        var errorMessage = err.error.message;
      });
  }
  getSensorData(){
    this.sensorService.sensorHistory(this.body).pipe(takeUntil(this.destroy$)).subscribe(response => {
      this.sensorData = response.success;
      (this.sensorData);
    },
    err => {
      (err)
    });
  }

  // Switch information
  countSwitches(){
    this.switchService.switches(this.payload).subscribe(
      response => {
        (response);
        if(response.success){
          this.switches =  response.success;
        }
      },
      err => {
        (err)
      }
    );
  }
  getSwitchList(){
    this.switchService.swithcList(this.payload).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if(response.success){
          this.switchList = response.success;
          (response);
          return true;
        }
      },
      err => {
        (err)
      }
    );
  }
  getSwitchData(){
    this.switchService.switchHistory(this.body).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        (response);
        if(response.success){
          this.switchData = response.success;
          (response);
        }
      },
      err => {
        (err);
      }
    );
  }

  // Workstation information
  countWorkstations(){
    this.workstationService.workstations(this.payload).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        (response);
        if(response.success){
          this.workstations = response.success;
        }
      },
      err => {
        (err);
      }
    );
  }
  getWorkstationList(){
    this.workstationService.workstationList(this.payload).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        try{
          if(response.success){
            this.workstationList = response.success;
            (response);
            return true;
          }
        }catch{
          ("Failed to get sensor list");
        }
      },
      err => {
        (err);
      }
    );

  }
  getWorkstationData(){
    this.workstationService.workstationHistory(this.body).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        (response);
        try{
          if(response.success){
            this.workstationData = response.success;
            (response);
          }
        }catch{
          ("Failed to get workstation history");
        }
      },
      err => {
        (err);
      }
    );
  }

  // GPS information
  countGps(){
    this.gpsService.gps(this.payload).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        try{
          if(response.success){
            (response);
            this.gps = response.success;
            return true;
          }
        }catch{
          ("Failed to count gps");
        }
      },
      err => {
        (err);
      }
    );
  }
  getGpsList(){
    this.gpsService.gpsList(this.payload).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        try{
          if(response.success){
            this.gpsList = response.success;
            (response);
            return true;
          }
        }catch{
          ("Failed to get gps list");
        }
      },
      err => {
        (err);
      }
    );
  }
  getGpsData(){
    this.gpsService.gpsHistory(this.body).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        try{
          if(response.success){
            this.gpsData = response.success;
            (response);
          }
        }catch{
          ("Failed to get GPS history");
        }
        
      },
      err => {
        (err)
      }
    );
  }


}
