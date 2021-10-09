import { Component, OnInit } from '@angular/core';
import { GpsService } from './gps.service';

@Component({
  selector: 'cf-gps',
  templateUrl: './gps.component.html',
  styleUrls: ['./gps.component.scss',
              '../../assets/css/material-dashboard.css']
})
export class GpsComponent implements OnInit {
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

    const sCountGps = this.gpsService.countGps();
    this.gpsService.sCountGps.subscribe(response_message => this.gps = response_message);

    const sList = this.gpsService.getListOfGps();
    this.gpsService.sListData.subscribe(response_message => this.gpsList = response_message);

    const sHistoryData = this.gpsService.getGpsHistory();
    this.gpsService.sHistoryData.subscribe(response_message => this.gpsData = response_message);
  }

}
