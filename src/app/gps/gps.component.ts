import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataService } from '../service/data/data.service';
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

  formDataError = false;
  gps: any = 0;
  gpsList: any = [];
  gpsData: any  = [];

  title = 'datatables';
  dtOptions: DataTables.Settings = {};

  constructor(private gpsService: GpsService, private dataSertvice: DataService) { }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    };

    //Number of GPS
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

    // GPS list
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

    // GPS history
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

  addGps(addDeviceForm: NgForm){

    var gps_owner = sessionStorage.getItem("user_id");
    var gps_name = addDeviceForm.value.gps_name;
    var gps_type = addDeviceForm.value.gps_type;
    var gps_longitude = "0";
    var gps_latitude = "0";
    var gps_height = "0";
    var gps_status = "Offline";
    var gps_details = "{}";
    var coordinate_system = addDeviceForm.value.coordinate_system
    var gps_token = this.dataSertvice.getRandomToken(25);
    var last_modified = "1634453839";
    var update_period = addDeviceForm.value.update_period;;

    if(gps_name == "" || gps_type == "" || update_period == "" || coordinate_system == ""){
      this.formDataError = true;
    }
    else{
      this.formDataError = false;
      var addgpsParams = new HttpParams()
      .append('api_key', this.apiKey)
      .append('gps_owner', gps_owner)
      .append('gps_name', gps_name)
      .append('gps_type', gps_type)
      .append('gps_longitude', gps_longitude)
      .append('gps_latitude', gps_latitude)
      .append('gps_height', gps_height)
      .append('coordinate_system', coordinate_system)
      .append('gps_status', gps_status)
      .append('gps_details', gps_details)
      .append('gps_token', gps_token)
      .append('last_modified', last_modified)
      .append('update_period', update_period);

      this.gpsService.addGps(addgpsParams).pipe(takeUntil(this.destroy$)).subscribe(
        response => {
          (response);
          if(response.success){
            this.gpsData = response.success;
            (response);
            window.location.reload();
          }
        },
        err => {
          (err);
        }
      );
    }
   }

}
