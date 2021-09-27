import { Component, OnInit } from '@angular/core';
import { DataService } from '../service/data/data.service';
import { SensorService } from '../sensors/sensor.service';
import { GpsService } from '../gps/gps.service';
import { SwitchesService } from '../switches/switches.service';
import { WorkstationsService } from '../workstations/workstations.service';

@Component({
  selector: 'cf-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss',
              '../../assets/css/material-dashboard.css']
})
export class HomeComponent implements OnInit {
  response_message:any = '';
  
  sensors:any = 0;
  gps: any = 0;
  switches:any = 0;
  workstations:any = 0;

  constructor(private dataService: DataService,
              private sensorService: SensorService,
              private switchService: SwitchesService,
              private gpsService: GpsService,
              private workstationService: WorkstationsService) { }

  ngOnInit(): void {
    const profileData = this.dataService.getProfile();
    this.dataService.profileData.subscribe(response_message => this.response_message = response_message);

    const sCountSensor = this.sensorService.countSensors();
    this.sensorService.sCountData.subscribe(response_message => this.sensors = response_message);

    const sCountSwitches = this.switchService.countSwitches();
    this.switchService.sCountSwitches.subscribe(response_message => this.switches = response_message);

    const sCountGps = this.gpsService.countGps();
    this.gpsService.sCountGps.subscribe(response_message => this.gps = response_message);

    const sCountData = this.workstationService.countWorkstations();
    this.workstationService.sCountWorkstation.subscribe(response_message => this.workstations = response_message);


  }


}
