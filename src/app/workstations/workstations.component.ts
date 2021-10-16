import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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

  workstations:any = 0;
  workstationList: any = [];
  workstationData: any  = [];

  title = 'datatables';
  dtOptions: DataTables.Settings = {};

  constructor(private workstationService: WorkstationsService) { }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    };

    // Number of senstors
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

    // Sensor list
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

    // Sensor history
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

}
