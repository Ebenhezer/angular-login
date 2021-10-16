import { Component, OnInit, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SensorService } from './sensor.service';

// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from "rxjs/operators";

@Component({
  selector: 'cf-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.scss',
              '../../assets/css/material-dashboard.css']
})
export class SensorsComponent implements OnInit {
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
  
  private chart: am4charts.XYChart;

  nrOfSensors: any = 0;
  sensorList: any = [];
  sensorData: any = [];
  chartData: any =[];

  title = 'datatables';
  dtOptions: DataTables.Settings = {};

  constructor(private sensorService: SensorService,
              @Inject(PLATFORM_ID) private platformId, private zone: NgZone) { 

    // Number of sensors
    this.sensorService.sensors(this.payload).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        console.log(response);
        try {
          if(response.success){
            this.nrOfSensors = response.success;
            return true;
          }
        }catch (e){
          console.log("Not authenticated")
        }
      },
      err => {
        console.log(err)
        var errorMessage = err.error.message;
        console.log(errorMessage)
      }
    );

    // Sensor list
    this.sensorService.sensorList(this.payload).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        try {
          if(response.success){
            console.log(response);
            this.sensorList = response.success;
        }
        
        }catch (e){
          console.log("Not authenticated");
        }
      },
      err => {
        var errorMessage = err.error.message;
        console.log(errorMessage);
      });

    // Sensor history
    this.sensorService.sensorHistory(this.body).pipe(takeUntil(this.destroy$)).subscribe(response_message => {
      this.sensorData = response_message.success;
      console.log(this.sensorData);
    },
    err => {
      console.log(err)
    });

  }

  ngOnInit(): void {

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    };
  }
  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  ngAfterViewInit() {
    // Chart code goes in here
    
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);

      let chart = am4core.create("sensor-chart", am4charts.XYChart);

      chart.paddingRight = 20;

      let data = [];
      let visits = 10;
      for (let i = 1; i < 366; i++) {
        visits += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
        data.push({ date: new Date(2018, 0, i), name: "name" + i, value: visits });
      }

      chart.data = data;

      let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.grid.template.location = 0;

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.tooltip.disabled = true;
      valueAxis.renderer.minWidth = 35;

      let series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.dateX = "date";
      series.dataFields.valueY = "value";
      series.tooltipText = "{valueY.value}";

      chart.cursor = new am4charts.XYCursor();

      // let scrollbarX = new am4charts.XYChartScrollbar();
      // scrollbarX.series.push(series);
      // chart.scrollbarX = scrollbarX;

      this.chart = chart;
    });
  }
  
  ngOnDestroy() {
    // Clean up chart when the component is removed
    this.browserOnly(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }

  openModal(){
    //Used to control the add device modal
  }

}
