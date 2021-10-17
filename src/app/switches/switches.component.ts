import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataService } from '../service/data/data.service';
import { SwitchesService } from './switches.service';

@Component({
  selector: 'cf-switches',
  templateUrl: './switches.component.html',
  styleUrls: ['./switches.component.scss',
              '../../assets/css/material-dashboard.css']
})
export class SwitchesComponent implements OnInit {
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
  switches:any = 0;
  switchList: any = [];
  switchData: any  = [];
  chartData: any;

  dtOptions: DataTables.Settings = {};

  constructor(private switchService: SwitchesService,
              private dataSertvice: DataService) {
    // const sCountData = this.switchService.countSwitches();
    // this.switchService.sCountSwitches.subscribe(response_message => this.switches = response_message);
    // Number of switches
    this.switchService.switches(this.payload).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        (response);
        if(response.success){
          this.switches = response.success;
        }
      },
      err => {
        (err)
      }
    );

    // Switch list
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
    
    // Switch history
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

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    };
  }

  onSubmit(addDeviceForm: NgForm){
    var switch_owner = sessionStorage.getItem("user_id");
    var switch_name = addDeviceForm.value.switch_name;
    var switch_type = addDeviceForm.value.switch_type;
    var switch_state = "false";
    var switch_status = "Offline";
    var switch_details = "{}";
    var switch_token = this.dataSertvice.getRandomToken(25);
    var last_modified = "1634453839";
    var update_period = addDeviceForm.value.update_period;;

    if(switch_name == "" || switch_type == "" || update_period == ""){
      this.formDataError = true;
    }
    else{
      this.formDataError = false;
      var addSwitchParams = new HttpParams()
      .append('api_key', this.apiKey)
      .append('switch_owner', switch_owner)
      .append('switch_name', switch_name)
      .append('switch_type', switch_type)
      .append('switch_state', switch_state)
      .append('switch_status', switch_status)
      .append('switch_details', switch_details)
      .append('switch_token', switch_token)
      .append('last_modified', last_modified)
      .append('update_period', update_period);

      var params =JSON.stringify(this.request_body);

      this.switchService.addSwitch(addSwitchParams).pipe(takeUntil(this.destroy$)).subscribe(
        response => {
          (response);
          if(response.success){
            this.switchData = response.success;
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
