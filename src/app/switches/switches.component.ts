import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
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

  switches:any = 0;
  switchList: any = [];
  switchData: any  = [];
  chartData: any;

  title = 'datatables';
  dtOptions: DataTables.Settings = {};

  constructor(private switchService: SwitchesService) {
    // const sCountData = this.switchService.countSwitches();
    // this.switchService.sCountSwitches.subscribe(response_message => this.switches = response_message);
    // Number of switches
    this.switchService.switches(this.payload).subscribe(
      response => {
        console.log(response);
        if(response.success){
          this.switches = response.success;
        }
      },
      err => {
        console.log(err)
      }
    );

    // Switch list
    this.switchService.swithcList(this.payload).subscribe(
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
    
    // Switch history
    this.switchService.switchHistory(this.body).subscribe(
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

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    };
  }

}
