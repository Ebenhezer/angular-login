import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GpsService } from './gps.service';

@Component({
  selector: 'cf-gps',
  templateUrl: './gps.component.html',
  styleUrls: ['./gps.component.scss',
              '../../assets/css/material-dashboard.css']
})
export class GpsComponent implements OnInit {

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

  gps: any = 0;
  gpsList: any = [];
  gpsData: any  = [];

  title = 'datatables';
  dtOptions: DataTables.Settings = {};

  constructor(private gpsService: GpsService) { }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    };

    // const sCountGps = this.gpsService.countGps();
    // this.gpsService.sCountGps.subscribe(response_message => this.gps = response_message);
    //Number of GPS
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

    // const sList = this.gpsService.getListOfGps();
    // this.gpsService.sListData.subscribe(response_message => this.gpsList = response_message);
    // Sensor list
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

    // const sHistoryData = this.gpsService.getGpsHistory();
    // this.gpsService.sHistoryData.subscribe(response_message => this.gpsData = response_message);
    // GPS history
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
