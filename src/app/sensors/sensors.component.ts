import { Component, OnInit } from '@angular/core';
import { SensorService } from './sensor.service';

@Component({
  selector: 'cf-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.scss']
})
export class SensorsComponent implements OnInit {
  response_message: any = ''
  constructor(private sensorService: SensorService) { }

  ngOnInit(): void {
    const sCountData = this.sensorService.countSensors();
    this.sensorService.sCountData.subscribe(response_message => this.response_message = response_message);
    console.log(sCountData);
  }

}
