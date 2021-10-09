import { Component, OnInit } from '@angular/core';
import { DataService } from '../service/data/data.service';
import { SensorService } from '../sensors/sensor.service';
import { GpsService } from '../gps/gps.service';
import { SwitchesService } from '../switches/switches.service';
import { WorkstationsService } from '../workstations/workstations.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'cf-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss',
              '../../assets/css/material-dashboard.css']
})
export class HomeComponent implements OnInit {
  response_message:any = '';
  
  sensors:any = 0;
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

  title = 'datatables';
  dtOptions: DataTables.Settings = {};

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
    this.dataService.profileData.subscribe(response_message => this.response_message = response_message);

    const sCountSensor = this.sensorService.countSensors();
    this.sensorService.sCountData.subscribe(response_message => this.sensors = response_message);

    const sCountSwitches = this.switchService.countSwitches();
    this.switchService.sCountSwitches.subscribe(response_message => this.switches = response_message);

    const sCountGps = this.gpsService.countGps();
    this.gpsService.sCountGps.subscribe(response_message => this.gps = response_message);

    const sCountData = this.workstationService.countWorkstations();
    this.workstationService.sCountWorkstation.subscribe(response_message => this.workstations = response_message);

    this.getSensorData();
    this.getSensorList();

    this.getSwitchList();
    this.getSwitchData();

    this.getWorkstationList();
    this. getWorkstationData();

    this.getGpsList();
    this.getGpsData();

  }

  getSensorList(){
    const sList = this.sensorService.getListOfSensors();
    this.sensorService.sListData.subscribe(response_message => this.sensorList = response_message);

  }
  getSensorData(){
    const sHistoryData = this.sensorService.getSensorHistory();
    this.sensorService.sHistoryData.subscribe(response_message => this.sensorData = response_message);
    console.log(sHistoryData);
  }

  getSwitchList(){
    const sList = this.switchService.getListOfSwitches();
    this.sensorService.sListData.subscribe(response_message => this.switchList = response_message);

  }
  getSwitchData(){
    const sHistoryData = this.switchService.getSwitchHistory();
    this.switchService.sHistoryData.subscribe(response_message => this.switchData = response_message);
    console.log(sHistoryData);
  }

  getWorkstationList(){
    const sList = this.workstationService.getListOfWorkstation();
    this.workstationService.sListData.subscribe(response_message => this.workstationList = response_message);

  }
  getWorkstationData(){
    const sHistoryData = this.workstationService.getWorkstationHistory();
    this.workstationService.sHistoryData.subscribe(response_message => this.workstationData = response_message);
    console.log(sHistoryData);
  }

  getGpsList(){
    const sList = this.gpsService.getListOfGps();
    this.gpsService.sListData.subscribe(response_message => this.sensorList = response_message);

  }
  getGpsData(){
    const sHistoryData = this.gpsService.getGpsHistory();
    this.gpsService.sHistoryData.subscribe(response_message => this.gpsData = response_message);
    console.log(sHistoryData);
  }


}
