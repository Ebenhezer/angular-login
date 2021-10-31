import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataService } from '../service/data/data.service';
import { WorkstationsService } from './workstations.service';

@Component({
  selector: 'cf-workstations',
  templateUrl: './workstations.component.html',
  styleUrls: ['./workstations.component.scss',
              '../../assets/css/material-dashboard.css']
})
export class WorkstationsComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();
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
  formDataError = false;
  workstations:any = 0;
  workstationList: any = [];
  workstationData: any  = [];

  deleteDeviceID:any;
  deleteDeviceName:any;
  deleteDeviceToken:any;

  editDeviceName:any;
  editDeviceToken:any;
  editDeviceUpdatePerios:any;
  editFormError = false;

  title = 'datatables';
  dtOptions: DataTables.Settings = {};

  constructor(private workstationService: WorkstationsService, private dataSertvice: DataService) { }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    };

    // Number of senstors
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

    // workstation list
    this.workstationService.workstationList(this.payload).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        try{
          if(response.success){
            this.workstationList = response.success;
            (response);
            return true;
          }
        }catch{
          ("Failed to get workstation list");
        }
      },
      err => {
        (err);
      }
    );

    // workstation history
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

  addWorkstation(addDeviceForm: NgForm){

    var workstation_owner = sessionStorage.getItem("user_id");
    var workstation_name = addDeviceForm.value.workstation_name;
    var workstation_type = addDeviceForm.value.workstation_type;
    var workstation_token = this.dataSertvice.getRandomToken(25);
    var last_modified = "1634453839";
    var update_period = addDeviceForm.value.update_period;

    if(workstation_name == "" || workstation_type == "" || update_period == ""){
      this.formDataError = true;
    }
    else{
      this.formDataError = false;
      var addworkstationParams = new HttpParams()
      .append('api_key', this.apiKey)
      .append('ws_owner', workstation_owner)
      .append('ws_name', workstation_name)
      .append('ws_type', workstation_type)
      .append('ws_token', workstation_token)
      .append('last_modified', last_modified)
      .append('update_period', update_period);

      this.workstationService.addWorkstation(addworkstationParams).pipe(takeUntil(this.destroy$)).subscribe(
        response => {
          (response);
          if(response.success){
            this.workstationData = response.success;
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

   setDeleterParams(ws_id, ws_name, ws_token){
    this.deleteDeviceID = Number(ws_id);
    this.deleteDeviceName = String(ws_name);
    this.deleteDeviceToken = String(ws_token);
   }

   deleteDevice(){
    var deleteParams = new HttpParams()
      .append('api_key', this.apiKey)
      .append('ws_id', this.deleteDeviceID)
      .append('ws_token', this.deleteDeviceToken)

    this.workstationService.deleteDevice(deleteParams).pipe(takeUntil(this.destroy$)).subscribe(
        response => {
          if(response.success){
            window.location.reload();
          }
          console.log(response);
        },
        err => {
          console.log(err);
        }
        
      );

   }

   setEditParams(ws_name, ws_token, update_period){
    this.editDeviceName = ws_name;
    this.editDeviceToken = ws_token;
    this.editDeviceUpdatePerios = update_period;
   }
   editDevice(editDeviceForm: NgForm){
    var ws_name = editDeviceForm.value.ws_name;
    var ws_token = editDeviceForm.value.ws_token;
    var update_period = editDeviceForm.value.update_period;

    if(ws_name == "" || ws_token == "" || update_period == ""){
      this.editFormError = true;
    }
    else{
        console.log("Editting..");
    }
   }

}
