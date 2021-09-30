import { Component, OnInit } from '@angular/core';
import { SensorService } from './sensor.service';

@Component({
  selector: 'cf-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.scss',
              '../../assets/css/material-dashboard.css']
})
export class SensorsComponent implements OnInit {
  nrOfSensors: any = 0;
  sensorList: any;
  sensorHistory:any;

  constructor(private sensorService: SensorService) { }

  ngOnInit(): void {

    const sCountData = this.sensorService.countSensors();
    this.sensorService.sCountData.subscribe(response_message => this.nrOfSensors = response_message);
    console.log(sCountData);

    const sListData = this.sensorService.getListOfSensors();
    this.sensorService.sListData.subscribe(response_message => this.sensorList = response_message);
    console.log(sListData);

    const sHistoryData = this.sensorService.getSensorHistory();
    this.sensorService.sHistoryData.subscribe(response_message => this.sensorHistory = response_message);
    console.log(sHistoryData);
  }

  openModal(){
    
  }

  

}
