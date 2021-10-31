import { Component, OnInit, Inject, NgZone, PLATFORM_ID, AfterViewInit, OnChanges, SimpleChange, Input, SimpleChanges } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SensorService } from './sensor.service';
import { DataService } from '../service/data/data.service';

// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from "rxjs/operators";
import { NgForm } from '@angular/forms';

@Component({
  selector: 'cf-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.scss',
              '../../assets/css/material-dashboard.css']
})
export class SensorsComponent implements OnInit, AfterViewInit, OnChanges {
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
  formDataError = false;

  nrOfSensors: any = 0;
  sensorList: any = [];
  sensorData: any = [];
  chartData: any =[];

  deleteSensorID:any;
  deleteSensorName:any;
  deleteSensorToken:any;

  @Input() testData: any ;

  dtOptions: DataTables.Settings = {};

  constructor(private sensorService: SensorService,
              private dataSertvice: DataService,
              @Inject(PLATFORM_ID) private platformId, private zone: NgZone) { 
    
    this.getData();
  }

  ngOnInit(): void {
    
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.testData.firstChange) {
      // only logged upon a change after rendering
      console.log(changes.testData.currentValue);
    }
    console.log(changes.testData.currentValue);
  }

  getData(){
      // Number of sensors
    this.sensorService.sensors(this.payload).pipe(takeUntil(this.destroy$)).subscribe(
        response => {
          try {
            if(response.success){
              this.nrOfSensors = response.success;
              return true;
            }
          }catch (e){
            ("Not authenticated")
          }
        },
        err => {
          var errorMessage = err.error.message;
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
        });
  
      // Sensor history
      this.sensorService.sensorHistory(this.body).pipe(takeUntil(this.destroy$)).subscribe(response_message => {
        if (response_message.length !== 0){
            this.sensorData = response_message.success;
            this.testData = response_message.success;
            this.drawTrends();
            console.log(response_message)
        }
      },
      err => {
        (err)
      });
    //   console.log(this.sensorData);
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
    // this.drawTrends();
  }
  
  ngOnDestroy() {
    // Clean up chart when the component is removed
    this.browserOnly(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }

  drawTrends(){
    // Chart code goes in here
    
    am4core.useTheme(am4themes_animated);

    // Create chart instance
    var chart = am4core.create("sensor-chart", am4charts.XYChart);
    chart.dateFormatter.inputDateFormat = "yyyy-MMM-dd h:m:s";
    chart.exporting.menu = new am4core.ExportMenu();
    
    // Add data
    var chart_data = this.sensorData;
    console.log(chart_data);
    // Create axis
    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

    // Create series
    function createSeries(name, data) {
        var series = chart.series.push(new am4charts.LineSeries());
        series.data = data;
        series.dataFields.valueY = "sensor_value";
        series.dataFields.dateX = "update_time";
        series.tooltipText = "{name}\n{update_time}: {sensor_value}"
        series.strokeWidth = 2;
        series.name = name; 
        series.minBulletDistance = 15;
        series.tooltip.background.cornerRadius = 20;
        series.tooltip.background.strokeOpacity = 0;
        // series.tooltip.pointerOrientation = "vertical";
        series.tooltip.label.minWidth = 40;
        series.tooltip.label.minHeight = 40;
        series.tooltip.label.textAlign = "middle";
        series.tooltip.label.textValign = "middle";

        // Make bullets grow on hover
        var bullet = series.bullets.push(new am4charts.CircleBullet());
        bullet.circle.strokeWidth = 2;
        bullet.circle.radius = 4;
        bullet.circle.fill = am4core.color("#fff");

        var bullethover = bullet.states.create("hover");
        bullethover.properties.scale = 1.3;

        // Make a panning cursor
        chart.cursor = new am4charts.XYCursor();
        chart.cursor.xAxis = dateAxis;
        // chart.cursor.behavior = "panXY"; // Make the graph to move instead of zooming in
        //chart.cursor.snapToSeries = series;

        // Create vertical scrollbar and place it before the value axis
        chart.scrollbarY = new am4core.Scrollbar();
        chart.scrollbarY.parent = chart.leftAxesContainer;
        chart.scrollbarY.toBack();

        // Create a horizontal scrollbar with previe and place it underneath the date axis
        // chart.scrollbarX = new am4charts.XYChartScrollbar();
        // chart.scrollbarX.series.push(series);
        // chart.scrollbarX.parent = chart.bottomAxesContainer;

        //dateAxis.start = 0.79; // used to zoom the trend on start up go towards the end
        dateAxis.keepSelection = true;
    
        // var bullet = series.bullets.push(new am4charts.CircleBullet());
        // bullet.circle.stroke = am4core.color("#fff");
        // bullet.circle.strokeWidth = 2;
    
        return series;
    }
    var i=0, j=0;
    console.log(chart_data);
    for (i = 0; i < chart_data.length; i++){
        var sensor = chart_data[i];
        var sensor_name = sensor.sensor_name;
        var sensor_id = sensor.sensor_id;
        var trend_data = sensor.data
        for (j = 0; j < trend_data.length; j++){
            var sensor_value = trend_data["sensor_value"];
            var update_time = trend_data["update_time"];
        }
        createSeries(sensor_name, trend_data);
        
    }
    chart.cursor = new am4charts.XYCursor();
    chart.legend = new am4charts.Legend();

      this.chart = chart;
  }

  addSensor(addDeviceForm: NgForm){

    var sensor_owner = sessionStorage.getItem("user_id");
    var sensor_name = addDeviceForm.value.sensor_name;
    var sensor_type = addDeviceForm.value.sensor_type;
    var sensor_value = "22";
    var sensor_status = "Offline";
    var sensor_details = "{}";
    var sensor_token = this.dataSertvice.getRandomToken(25);
    var last_modified = "1634453839";
    var update_period = addDeviceForm.value.update_period;;

    if(sensor_name == "" || sensor_type == "" || update_period == ""){
      this.formDataError = true;
    }
    else{
      this.formDataError = false;
      var addSensorParams = new HttpParams()
      .append('api_key', this.apiKey)
      .append('sensor_owner', sensor_owner)
      .append('sensor_name', sensor_name)
      .append('sensor_type', sensor_type)
      .append('sensor_value', sensor_value)
      .append('sensor_status', sensor_status)
      .append('sensor_details', sensor_details)
      .append('sensor_token', sensor_token)
      .append('last_modified', last_modified)
      .append('update_period', update_period);

      this.sensorService.addSensor(addSensorParams).pipe(takeUntil(this.destroy$)).subscribe(
        response => {
          if(response.success){
            this.sensorData = response.success;
            window.location.reload();
          }
        },
        err => {
          console.log(err);
        }
      );
    }
   }

   deleteSensor(sensor_id, sensor_name, sensor_token){
    this.deleteSensorID = sensor_id;
    this.deleteSensorName = sensor_name;
    this.deleteSensorToken = sensor_token;


   }
  
  localData(){
    return [
      {
          "sensor_id": 16296337361965496,
          "sensor_name": "DIYWS",
          "sensor_type": "TODO",
          "data": [
              {
                  "sensor_value": 19.6,
                  "update_time": "2021-10-05T08:53:03"
              },
              {
                  "sensor_value": 19.5,
                  "update_time": "2021-10-05T08:53:49"
              },
              {
                  "sensor_value": 19.8,
                  "update_time": "2021-10-05T08:59:53"
              },
              {
                  "sensor_value": 34.6,
                  "update_time": "2021-10-05T09:05:57"
              },
              {
                  "sensor_value": 34.8,
                  "update_time": "2021-10-05T09:12:01"
              },
              {
                  "sensor_value": 35,
                  "update_time": "2021-10-05T09:18:05"
              },
              {
                  "sensor_value": 33.9,
                  "update_time": "2021-10-05T09:24:10"
              },
              {
                  "sensor_value": 32.6,
                  "update_time": "2021-10-05T09:30:14"
              },
              {
                  "sensor_value": 31.2,
                  "update_time": "2021-10-05T09:36:18"
              },
              {
                  "sensor_value": 31.1,
                  "update_time": "2021-10-05T09:42:22"
              },
              {
                  "sensor_value": 30.1,
                  "update_time": "2021-10-05T09:48:26"
              },
              {
                  "sensor_value": 30.6,
                  "update_time": "2021-10-05T09:54:30"
              },
              {
                  "sensor_value": 30.9,
                  "update_time": "2021-10-05T10:00:34"
              },
              {
                  "sensor_value": 30.7,
                  "update_time": "2021-10-05T10:06:38"
              },
              {
                  "sensor_value": 30.5,
                  "update_time": "2021-10-05T10:12:43"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-05T10:18:47"
              },
              {
                  "sensor_value": 30.2,
                  "update_time": "2021-10-05T10:24:51"
              },
              {
                  "sensor_value": 30.5,
                  "update_time": "2021-10-05T10:30:55"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-05T10:36:59"
              },
              {
                  "sensor_value": 30.2,
                  "update_time": "2021-10-05T10:43:03"
              },
              {
                  "sensor_value": 29.3,
                  "update_time": "2021-10-05T10:49:07"
              },
              {
                  "sensor_value": 29.7,
                  "update_time": "2021-10-05T10:55:11"
              },
              {
                  "sensor_value": 29.7,
                  "update_time": "2021-10-05T11:01:16"
              },
              {
                  "sensor_value": 29.1,
                  "update_time": "2021-10-05T11:07:20"
              },
              {
                  "sensor_value": 29.8,
                  "update_time": "2021-10-05T11:13:24"
              },
              {
                  "sensor_value": 29.6,
                  "update_time": "2021-10-05T11:19:29"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-05T11:25:33"
              },
              {
                  "sensor_value": 29.5,
                  "update_time": "2021-10-05T11:31:37"
              },
              {
                  "sensor_value": 29.4,
                  "update_time": "2021-10-05T11:37:41"
              },
              {
                  "sensor_value": 29.2,
                  "update_time": "2021-10-05T11:43:45"
              },
              {
                  "sensor_value": 29.7,
                  "update_time": "2021-10-05T11:49:50"
              },
              {
                  "sensor_value": 29.3,
                  "update_time": "2021-10-05T11:55:54"
              },
              {
                  "sensor_value": 29.5,
                  "update_time": "2021-10-05T12:01:58"
              },
              {
                  "sensor_value": 29.7,
                  "update_time": "2021-10-05T12:08:02"
              },
              {
                  "sensor_value": 29.4,
                  "update_time": "2021-10-05T12:14:06"
              },
              {
                  "sensor_value": 29.3,
                  "update_time": "2021-10-05T12:20:10"
              },
              {
                  "sensor_value": 29.5,
                  "update_time": "2021-10-05T12:26:14"
              },
              {
                  "sensor_value": 29.3,
                  "update_time": "2021-10-05T12:32:19"
              },
              {
                  "sensor_value": 28.8,
                  "update_time": "2021-10-05T12:38:23"
              },
              {
                  "sensor_value": 29.1,
                  "update_time": "2021-10-05T12:44:27"
              },
              {
                  "sensor_value": 28.8,
                  "update_time": "2021-10-05T12:50:31"
              },
              {
                  "sensor_value": 28.5,
                  "update_time": "2021-10-05T12:56:35"
              },
              {
                  "sensor_value": 28.4,
                  "update_time": "2021-10-05T13:02:39"
              },
              {
                  "sensor_value": 28.1,
                  "update_time": "2021-10-05T13:08:43"
              },
              {
                  "sensor_value": 28.3,
                  "update_time": "2021-10-05T13:14:48"
              },
              {
                  "sensor_value": 27.5,
                  "update_time": "2021-10-05T13:20:52"
              },
              {
                  "sensor_value": 28.8,
                  "update_time": "2021-10-05T13:26:56"
              },
              {
                  "sensor_value": 28.1,
                  "update_time": "2021-10-05T13:33:00"
              },
              {
                  "sensor_value": 27.7,
                  "update_time": "2021-10-05T13:39:04"
              },
              {
                  "sensor_value": 27.9,
                  "update_time": "2021-10-05T13:45:08"
              },
              {
                  "sensor_value": 27.8,
                  "update_time": "2021-10-05T13:51:15"
              },
              {
                  "sensor_value": 27.4,
                  "update_time": "2021-10-05T13:57:19"
              },
              {
                  "sensor_value": 27.9,
                  "update_time": "2021-10-05T14:03:23"
              },
              {
                  "sensor_value": 27.8,
                  "update_time": "2021-10-05T14:09:28"
              },
              {
                  "sensor_value": 27.7,
                  "update_time": "2021-10-05T14:15:31"
              },
              {
                  "sensor_value": 20.9,
                  "update_time": "2021-10-06T10:14:20"
              },
              {
                  "sensor_value": 20.9,
                  "update_time": "2021-10-06T10:20:24"
              },
              {
                  "sensor_value": 40.5,
                  "update_time": "2021-10-06T10:26:28"
              },
              {
                  "sensor_value": 41.3,
                  "update_time": "2021-10-06T10:32:32"
              },
              {
                  "sensor_value": 42.6,
                  "update_time": "2021-10-06T10:38:36"
              },
              {
                  "sensor_value": 41.7,
                  "update_time": "2021-10-06T10:44:40"
              },
              {
                  "sensor_value": 41.6,
                  "update_time": "2021-10-06T10:50:44"
              },
              {
                  "sensor_value": 40.9,
                  "update_time": "2021-10-06T10:56:49"
              },
              {
                  "sensor_value": 43.7,
                  "update_time": "2021-10-06T11:02:53"
              },
              {
                  "sensor_value": 41.5,
                  "update_time": "2021-10-06T11:08:57"
              },
              {
                  "sensor_value": 41.8,
                  "update_time": "2021-10-06T11:15:01"
              },
              {
                  "sensor_value": 43.2,
                  "update_time": "2021-10-06T11:21:05"
              },
              {
                  "sensor_value": 40.6,
                  "update_time": "2021-10-06T11:27:09"
              },
              {
                  "sensor_value": 41.2,
                  "update_time": "2021-10-06T11:33:13"
              },
              {
                  "sensor_value": 41.5,
                  "update_time": "2021-10-06T11:39:17"
              },
              {
                  "sensor_value": 39.5,
                  "update_time": "2021-10-06T11:45:21"
              },
              {
                  "sensor_value": 43.2,
                  "update_time": "2021-10-06T11:51:25"
              },
              {
                  "sensor_value": 42.1,
                  "update_time": "2021-10-06T11:57:30"
              },
              {
                  "sensor_value": 41.6,
                  "update_time": "2021-10-06T12:03:34"
              },
              {
                  "sensor_value": 43.2,
                  "update_time": "2021-10-06T12:09:38"
              },
              {
                  "sensor_value": 42.1,
                  "update_time": "2021-10-06T12:15:43"
              },
              {
                  "sensor_value": 44,
                  "update_time": "2021-10-06T12:21:47"
              },
              {
                  "sensor_value": 44.3,
                  "update_time": "2021-10-06T12:27:51"
              },
              {
                  "sensor_value": 43.1,
                  "update_time": "2021-10-06T12:33:55"
              },
              {
                  "sensor_value": 43.6,
                  "update_time": "2021-10-06T12:40:00"
              },
              {
                  "sensor_value": 44.3,
                  "update_time": "2021-10-06T12:46:04"
              },
              {
                  "sensor_value": 43,
                  "update_time": "2021-10-06T12:52:08"
              },
              {
                  "sensor_value": 41.5,
                  "update_time": "2021-10-06T12:58:12"
              },
              {
                  "sensor_value": 35.3,
                  "update_time": "2021-10-06T13:04:16"
              },
              {
                  "sensor_value": 33,
                  "update_time": "2021-10-06T13:10:20"
              },
              {
                  "sensor_value": 32.3,
                  "update_time": "2021-10-06T13:16:24"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-06T13:22:28"
              },
              {
                  "sensor_value": 31.5,
                  "update_time": "2021-10-06T13:28:32"
              },
              {
                  "sensor_value": 31,
                  "update_time": "2021-10-06T13:34:35"
              },
              {
                  "sensor_value": 31.1,
                  "update_time": "2021-10-06T13:40:39"
              },
              {
                  "sensor_value": 30.7,
                  "update_time": "2021-10-06T13:46:43"
              },
              {
                  "sensor_value": 30.4,
                  "update_time": "2021-10-06T13:52:48"
              },
              {
                  "sensor_value": 30.2,
                  "update_time": "2021-10-06T13:58:52"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T14:04:56"
              },
              {
                  "sensor_value": 29.7,
                  "update_time": "2021-10-06T14:11:00"
              },
              {
                  "sensor_value": 29.4,
                  "update_time": "2021-10-06T14:17:04"
              },
              {
                  "sensor_value": 29.2,
                  "update_time": "2021-10-06T14:23:07"
              },
              {
                  "sensor_value": 28.8,
                  "update_time": "2021-10-06T14:29:11"
              },
              {
                  "sensor_value": 20.4,
                  "update_time": "2021-10-14T13:53:18"
              },
              {
                  "sensor_value": 20.3,
                  "update_time": "2021-10-14T13:59:23"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-14T14:05:27"
              },
              {
                  "sensor_value": 20.4,
                  "update_time": "2021-10-14T14:11:31"
              },
              {
                  "sensor_value": 20.4,
                  "update_time": "2021-10-14T14:17:35"
              },
              {
                  "sensor_value": 20.4,
                  "update_time": "2021-10-14T14:23:39"
              },
              {
                  "sensor_value": 20.4,
                  "update_time": "2021-10-14T14:29:44"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-14T14:35:48"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-14T14:41:52"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-14T14:47:56"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-14T14:54:00"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-14T15:00:04"
              },
              {
                  "sensor_value": 20.6,
                  "update_time": "2021-10-14T15:06:08"
              },
              {
                  "sensor_value": 20.6,
                  "update_time": "2021-10-14T15:12:12"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-14T15:18:17"
              },
              {
                  "sensor_value": 20.6,
                  "update_time": "2021-10-14T15:24:21"
              },
              {
                  "sensor_value": 20.6,
                  "update_time": "2021-10-14T15:30:25"
              },
              {
                  "sensor_value": 20.6,
                  "update_time": "2021-10-14T15:36:29"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-14T15:42:33"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-14T15:48:37"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-14T15:54:41"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-14T16:00:45"
              },
              {
                  "sensor_value": 20.4,
                  "update_time": "2021-10-14T16:06:49"
              },
              {
                  "sensor_value": 20.4,
                  "update_time": "2021-10-14T16:12:53"
              },
              {
                  "sensor_value": 20.3,
                  "update_time": "2021-10-14T16:18:58"
              },
              {
                  "sensor_value": 20.2,
                  "update_time": "2021-10-14T16:25:02"
              },
              {
                  "sensor_value": 20.2,
                  "update_time": "2021-10-14T16:31:06"
              },
              {
                  "sensor_value": 20.2,
                  "update_time": "2021-10-14T16:37:10"
              },
              {
                  "sensor_value": 20.1,
                  "update_time": "2021-10-14T16:43:14"
              },
              {
                  "sensor_value": 20.1,
                  "update_time": "2021-10-14T16:49:18"
              },
              {
                  "sensor_value": 20,
                  "update_time": "2021-10-14T16:55:26"
              },
              {
                  "sensor_value": 19.9,
                  "update_time": "2021-10-14T17:01:30"
              },
              {
                  "sensor_value": 19.8,
                  "update_time": "2021-10-14T17:07:34"
              },
              {
                  "sensor_value": 19.8,
                  "update_time": "2021-10-14T17:13:39"
              },
              {
                  "sensor_value": 19.7,
                  "update_time": "2021-10-14T17:19:43"
              },
              {
                  "sensor_value": 19.9,
                  "update_time": "2021-10-14T17:25:47"
              },
              {
                  "sensor_value": 19.8,
                  "update_time": "2021-10-14T17:31:51"
              },
              {
                  "sensor_value": 19.8,
                  "update_time": "2021-10-14T17:37:56"
              },
              {
                  "sensor_value": 19.9,
                  "update_time": "2021-10-14T17:44:00"
              },
              {
                  "sensor_value": 19.7,
                  "update_time": "2021-10-14T17:50:04"
              },
              {
                  "sensor_value": 19.7,
                  "update_time": "2021-10-14T17:56:08"
              },
              {
                  "sensor_value": 19.7,
                  "update_time": "2021-10-14T18:02:12"
              },
              {
                  "sensor_value": 19.7,
                  "update_time": "2021-10-14T18:08:17"
              },
              {
                  "sensor_value": 19.8,
                  "update_time": "2021-10-14T18:14:21"
              },
              {
                  "sensor_value": 19.8,
                  "update_time": "2021-10-14T18:20:25"
              },
              {
                  "sensor_value": 19.9,
                  "update_time": "2021-10-14T18:26:29"
              },
              {
                  "sensor_value": 19.8,
                  "update_time": "2021-10-14T18:32:33"
              },
              {
                  "sensor_value": 19.7,
                  "update_time": "2021-10-14T18:38:37"
              },
              {
                  "sensor_value": 19.7,
                  "update_time": "2021-10-14T18:44:41"
              },
              {
                  "sensor_value": 19.7,
                  "update_time": "2021-10-14T18:50:46"
              },
              {
                  "sensor_value": 19.7,
                  "update_time": "2021-10-14T18:56:50"
              },
              {
                  "sensor_value": 19.9,
                  "update_time": "2021-10-14T19:02:54"
              },
              {
                  "sensor_value": 19.9,
                  "update_time": "2021-10-14T19:08:58"
              },
              {
                  "sensor_value": 20,
                  "update_time": "2021-10-14T19:15:02"
              },
              {
                  "sensor_value": 20,
                  "update_time": "2021-10-14T19:21:06"
              },
              {
                  "sensor_value": 20,
                  "update_time": "2021-10-14T19:27:11"
              },
              {
                  "sensor_value": 19.9,
                  "update_time": "2021-10-14T19:33:15"
              },
              {
                  "sensor_value": 19.9,
                  "update_time": "2021-10-14T19:39:20"
              },
              {
                  "sensor_value": 19.9,
                  "update_time": "2021-10-14T19:45:24"
              },
              {
                  "sensor_value": 20,
                  "update_time": "2021-10-14T19:51:28"
              },
              {
                  "sensor_value": 20,
                  "update_time": "2021-10-14T19:57:33"
              },
              {
                  "sensor_value": 20,
                  "update_time": "2021-10-14T20:03:37"
              },
              {
                  "sensor_value": 20,
                  "update_time": "2021-10-14T20:09:41"
              },
              {
                  "sensor_value": 19.9,
                  "update_time": "2021-10-14T20:15:45"
              },
              {
                  "sensor_value": 19.9,
                  "update_time": "2021-10-14T20:21:49"
              },
              {
                  "sensor_value": 19.8,
                  "update_time": "2021-10-14T20:27:53"
              },
              {
                  "sensor_value": 19.8,
                  "update_time": "2021-10-14T20:33:58"
              },
              {
                  "sensor_value": 19.8,
                  "update_time": "2021-10-14T20:40:02"
              },
              {
                  "sensor_value": 19.9,
                  "update_time": "2021-10-14T20:46:06"
              },
              {
                  "sensor_value": 19.9,
                  "update_time": "2021-10-14T20:52:11"
              },
              {
                  "sensor_value": 19.6,
                  "update_time": "2021-10-14T20:58:15"
              },
              {
                  "sensor_value": 19.5,
                  "update_time": "2021-10-14T21:04:19"
              },
              {
                  "sensor_value": 19.4,
                  "update_time": "2021-10-14T21:10:23"
              },
              {
                  "sensor_value": 19.4,
                  "update_time": "2021-10-14T21:16:27"
              },
              {
                  "sensor_value": 19.3,
                  "update_time": "2021-10-14T21:22:32"
              },
              {
                  "sensor_value": 19.3,
                  "update_time": "2021-10-14T21:28:36"
              },
              {
                  "sensor_value": 19.2,
                  "update_time": "2021-10-14T21:34:40"
              },
              {
                  "sensor_value": 19.3,
                  "update_time": "2021-10-14T21:40:44"
              },
              {
                  "sensor_value": 19.2,
                  "update_time": "2021-10-14T21:46:48"
              },
              {
                  "sensor_value": 19.1,
                  "update_time": "2021-10-14T21:52:52"
              },
              {
                  "sensor_value": 19,
                  "update_time": "2021-10-14T21:58:56"
              },
              {
                  "sensor_value": 19,
                  "update_time": "2021-10-14T22:05:00"
              },
              {
                  "sensor_value": 18.9,
                  "update_time": "2021-10-14T22:11:04"
              },
              {
                  "sensor_value": 18.9,
                  "update_time": "2021-10-14T22:17:08"
              },
              {
                  "sensor_value": 19,
                  "update_time": "2021-10-14T22:23:13"
              },
              {
                  "sensor_value": 19,
                  "update_time": "2021-10-14T22:29:17"
              },
              {
                  "sensor_value": 19,
                  "update_time": "2021-10-14T22:35:21"
              },
              {
                  "sensor_value": 18.9,
                  "update_time": "2021-10-14T22:41:26"
              },
              {
                  "sensor_value": 18.9,
                  "update_time": "2021-10-14T22:47:29"
              },
              {
                  "sensor_value": 18.8,
                  "update_time": "2021-10-14T22:53:33"
              },
              {
                  "sensor_value": 18.8,
                  "update_time": "2021-10-14T22:59:38"
              },
              {
                  "sensor_value": 18.7,
                  "update_time": "2021-10-14T23:05:42"
              },
              {
                  "sensor_value": 18.8,
                  "update_time": "2021-10-14T23:11:46"
              },
              {
                  "sensor_value": 18.8,
                  "update_time": "2021-10-14T23:17:50"
              },
              {
                  "sensor_value": 18.8,
                  "update_time": "2021-10-14T23:23:54"
              },
              {
                  "sensor_value": 18.8,
                  "update_time": "2021-10-14T23:29:58"
              },
              {
                  "sensor_value": 18.7,
                  "update_time": "2021-10-14T23:36:02"
              },
              {
                  "sensor_value": 18.7,
                  "update_time": "2021-10-14T23:42:06"
              },
              {
                  "sensor_value": 18.7,
                  "update_time": "2021-10-14T23:48:11"
              },
              {
                  "sensor_value": 18.6,
                  "update_time": "2021-10-14T23:54:14"
              },
              {
                  "sensor_value": 18.6,
                  "update_time": "2021-10-15T00:00:19"
              },
              {
                  "sensor_value": 18.7,
                  "update_time": "2021-10-15T00:06:23"
              },
              {
                  "sensor_value": 18.7,
                  "update_time": "2021-10-15T00:12:27"
              },
              {
                  "sensor_value": 18.7,
                  "update_time": "2021-10-15T00:18:31"
              },
              {
                  "sensor_value": 18.7,
                  "update_time": "2021-10-15T00:24:35"
              },
              {
                  "sensor_value": 18.6,
                  "update_time": "2021-10-15T00:30:39"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T00:36:44"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T00:42:48"
              },
              {
                  "sensor_value": 18.4,
                  "update_time": "2021-10-15T00:48:52"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T00:54:56"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T01:01:00"
              },
              {
                  "sensor_value": 18.6,
                  "update_time": "2021-10-15T01:07:04"
              },
              {
                  "sensor_value": 18.6,
                  "update_time": "2021-10-15T01:13:08"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T01:19:13"
              },
              {
                  "sensor_value": 18.4,
                  "update_time": "2021-10-15T01:25:17"
              },
              {
                  "sensor_value": 18.4,
                  "update_time": "2021-10-15T01:31:21"
              },
              {
                  "sensor_value": 18.3,
                  "update_time": "2021-10-15T01:37:25"
              },
              {
                  "sensor_value": 18.3,
                  "update_time": "2021-10-15T01:43:30"
              },
              {
                  "sensor_value": 18.3,
                  "update_time": "2021-10-15T01:49:34"
              },
              {
                  "sensor_value": 18.3,
                  "update_time": "2021-10-15T01:55:38"
              },
              {
                  "sensor_value": 18.4,
                  "update_time": "2021-10-15T02:01:42"
              },
              {
                  "sensor_value": 18.4,
                  "update_time": "2021-10-15T02:07:46"
              },
              {
                  "sensor_value": 18.3,
                  "update_time": "2021-10-15T02:13:50"
              },
              {
                  "sensor_value": 18.3,
                  "update_time": "2021-10-15T02:19:54"
              },
              {
                  "sensor_value": 18.2,
                  "update_time": "2021-10-15T02:25:59"
              },
              {
                  "sensor_value": 18.1,
                  "update_time": "2021-10-15T02:32:03"
              },
              {
                  "sensor_value": 18.1,
                  "update_time": "2021-10-15T02:38:07"
              },
              {
                  "sensor_value": 18.1,
                  "update_time": "2021-10-15T02:44:11"
              },
              {
                  "sensor_value": 18.1,
                  "update_time": "2021-10-15T02:50:15"
              },
              {
                  "sensor_value": 18.2,
                  "update_time": "2021-10-15T02:56:19"
              },
              {
                  "sensor_value": 18.2,
                  "update_time": "2021-10-15T03:02:23"
              },
              {
                  "sensor_value": 18.1,
                  "update_time": "2021-10-15T03:08:27"
              },
              {
                  "sensor_value": 18.1,
                  "update_time": "2021-10-15T03:14:32"
              },
              {
                  "sensor_value": 18.1,
                  "update_time": "2021-10-15T03:20:36"
              },
              {
                  "sensor_value": 18.2,
                  "update_time": "2021-10-15T03:26:40"
              },
              {
                  "sensor_value": 18.3,
                  "update_time": "2021-10-15T03:32:44"
              },
              {
                  "sensor_value": 18.3,
                  "update_time": "2021-10-15T03:38:48"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T03:44:52"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T03:50:57"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T03:57:01"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T04:03:06"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T04:09:10"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T04:15:14"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T04:21:18"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T04:27:22"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T04:33:26"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T04:39:30"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T04:45:34"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T04:51:38"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T04:57:43"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T05:03:47"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T05:09:51"
              },
              {
                  "sensor_value": 18.6,
                  "update_time": "2021-10-15T05:15:55"
              },
              {
                  "sensor_value": 18.6,
                  "update_time": "2021-10-15T05:21:59"
              },
              {
                  "sensor_value": 18.7,
                  "update_time": "2021-10-15T05:28:03"
              },
              {
                  "sensor_value": 18.7,
                  "update_time": "2021-10-15T05:34:07"
              },
              {
                  "sensor_value": 18.7,
                  "update_time": "2021-10-15T05:40:11"
              },
              {
                  "sensor_value": 18.7,
                  "update_time": "2021-10-15T05:46:16"
              },
              {
                  "sensor_value": 18.7,
                  "update_time": "2021-10-15T05:52:20"
              },
              {
                  "sensor_value": 18.7,
                  "update_time": "2021-10-15T05:58:24"
              },
              {
                  "sensor_value": 18.8,
                  "update_time": "2021-10-15T06:04:28"
              },
              {
                  "sensor_value": 18.8,
                  "update_time": "2021-10-15T06:10:33"
              },
              {
                  "sensor_value": 18.8,
                  "update_time": "2021-10-15T06:16:37"
              },
              {
                  "sensor_value": 18.8,
                  "update_time": "2021-10-15T06:22:41"
              },
              {
                  "sensor_value": 18.8,
                  "update_time": "2021-10-15T06:28:45"
              },
              {
                  "sensor_value": 18.8,
                  "update_time": "2021-10-15T06:34:49"
              },
              {
                  "sensor_value": 18.8,
                  "update_time": "2021-10-15T06:40:53"
              },
              {
                  "sensor_value": 18.8,
                  "update_time": "2021-10-15T06:46:57"
              },
              {
                  "sensor_value": 18.8,
                  "update_time": "2021-10-15T06:53:01"
              },
              {
                  "sensor_value": 18.9,
                  "update_time": "2021-10-15T06:59:05"
              },
              {
                  "sensor_value": 19,
                  "update_time": "2021-10-15T07:05:09"
              },
              {
                  "sensor_value": 19.1,
                  "update_time": "2021-10-15T07:11:13"
              },
              {
                  "sensor_value": 19.3,
                  "update_time": "2021-10-15T07:17:17"
              },
              {
                  "sensor_value": 19.5,
                  "update_time": "2021-10-15T07:23:22"
              },
              {
                  "sensor_value": 19.5,
                  "update_time": "2021-10-15T07:29:26"
              },
              {
                  "sensor_value": 19.5,
                  "update_time": "2021-10-15T07:35:30"
              },
              {
                  "sensor_value": 19.5,
                  "update_time": "2021-10-15T07:41:34"
              },
              {
                  "sensor_value": 19.6,
                  "update_time": "2021-10-15T07:47:38"
              },
              {
                  "sensor_value": 19.7,
                  "update_time": "2021-10-15T07:53:42"
              },
              {
                  "sensor_value": 19.8,
                  "update_time": "2021-10-15T07:59:46"
              },
              {
                  "sensor_value": 19.8,
                  "update_time": "2021-10-15T08:05:50"
              },
              {
                  "sensor_value": 19.8,
                  "update_time": "2021-10-15T08:11:54"
              },
              {
                  "sensor_value": 19.9,
                  "update_time": "2021-10-15T08:17:59"
              },
              {
                  "sensor_value": 19.9,
                  "update_time": "2021-10-15T08:24:03"
              },
              {
                  "sensor_value": 19.9,
                  "update_time": "2021-10-15T08:30:07"
              },
              {
                  "sensor_value": 20.2,
                  "update_time": "2021-10-15T08:36:11"
              },
              {
                  "sensor_value": 20.3,
                  "update_time": "2021-10-15T08:42:15"
              },
              {
                  "sensor_value": 20.3,
                  "update_time": "2021-10-15T08:48:20"
              },
              {
                  "sensor_value": 20.4,
                  "update_time": "2021-10-15T08:54:24"
              },
              {
                  "sensor_value": 20.4,
                  "update_time": "2021-10-15T09:00:28"
              },
              {
                  "sensor_value": 20.4,
                  "update_time": "2021-10-15T09:06:32"
              },
              {
                  "sensor_value": 20.4,
                  "update_time": "2021-10-15T09:12:37"
              },
              {
                  "sensor_value": 20.3,
                  "update_time": "2021-10-15T09:18:41"
              },
              {
                  "sensor_value": 20.3,
                  "update_time": "2021-10-15T09:24:45"
              },
              {
                  "sensor_value": 20.2,
                  "update_time": "2021-10-15T09:30:49"
              },
              {
                  "sensor_value": 20,
                  "update_time": "2021-10-15T09:36:53"
              },
              {
                  "sensor_value": 20,
                  "update_time": "2021-10-15T09:42:57"
              },
              {
                  "sensor_value": 20,
                  "update_time": "2021-10-15T09:49:01"
              },
              {
                  "sensor_value": 20,
                  "update_time": "2021-10-15T09:55:06"
              },
              {
                  "sensor_value": 20.2,
                  "update_time": "2021-10-15T10:01:10"
              },
              {
                  "sensor_value": 20.4,
                  "update_time": "2021-10-15T10:07:14"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-15T10:13:19"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-15T10:19:24"
              },
              {
                  "sensor_value": 20.4,
                  "update_time": "2021-10-15T10:25:28"
              },
              {
                  "sensor_value": 20.3,
                  "update_time": "2021-10-15T10:31:32"
              },
              {
                  "sensor_value": 20.3,
                  "update_time": "2021-10-15T10:37:36"
              },
              {
                  "sensor_value": 20.4,
                  "update_time": "2021-10-15T10:43:41"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-15T10:49:45"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-15T10:55:49"
              },
              {
                  "sensor_value": 20.6,
                  "update_time": "2021-10-15T11:01:53"
              },
              {
                  "sensor_value": 20.7,
                  "update_time": "2021-10-15T11:07:57"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-15T11:14:01"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-15T11:20:05"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-15T11:26:09"
              },
              {
                  "sensor_value": 20.6,
                  "update_time": "2021-10-15T11:32:13"
              },
              {
                  "sensor_value": 20.6,
                  "update_time": "2021-10-15T11:38:18"
              },
              {
                  "sensor_value": 20.7,
                  "update_time": "2021-10-15T11:44:22"
              },
              {
                  "sensor_value": 20.7,
                  "update_time": "2021-10-15T11:50:26"
              },
              {
                  "sensor_value": 20.8,
                  "update_time": "2021-10-15T11:56:30"
              },
              {
                  "sensor_value": 21,
                  "update_time": "2021-10-15T12:02:34"
              },
              {
                  "sensor_value": 21,
                  "update_time": "2021-10-15T12:08:38"
              },
              {
                  "sensor_value": 21,
                  "update_time": "2021-10-15T12:14:42"
              },
              {
                  "sensor_value": 21,
                  "update_time": "2021-10-15T12:20:46"
              },
              {
                  "sensor_value": 21.1,
                  "update_time": "2021-10-15T12:26:51"
              },
              {
                  "sensor_value": 21.2,
                  "update_time": "2021-10-15T12:32:55"
              },
              {
                  "sensor_value": 21.2,
                  "update_time": "2021-10-15T12:38:59"
              },
              {
                  "sensor_value": 21.2,
                  "update_time": "2021-10-15T12:45:03"
              },
              {
                  "sensor_value": 21.2,
                  "update_time": "2021-10-15T12:51:07"
              },
              {
                  "sensor_value": 21.2,
                  "update_time": "2021-10-15T12:57:11"
              },
              {
                  "sensor_value": 21.2,
                  "update_time": "2021-10-15T13:03:15"
              },
              {
                  "sensor_value": 21.2,
                  "update_time": "2021-10-15T13:09:20"
              },
              {
                  "sensor_value": 21.2,
                  "update_time": "2021-10-15T13:15:24"
              },
              {
                  "sensor_value": 21.2,
                  "update_time": "2021-10-15T13:21:28"
              },
              {
                  "sensor_value": 21.4,
                  "update_time": "2021-10-15T13:27:33"
              },
              {
                  "sensor_value": 21.4,
                  "update_time": "2021-10-15T13:33:37"
              },
              {
                  "sensor_value": 21.5,
                  "update_time": "2021-10-15T13:39:41"
              },
              {
                  "sensor_value": 21.4,
                  "update_time": "2021-10-15T13:45:45"
              },
              {
                  "sensor_value": 21.4,
                  "update_time": "2021-10-15T13:51:49"
              },
              {
                  "sensor_value": 21.3,
                  "update_time": "2021-10-15T13:57:54"
              },
              {
                  "sensor_value": 21.3,
                  "update_time": "2021-10-15T14:03:58"
              },
              {
                  "sensor_value": 21.2,
                  "update_time": "2021-10-15T14:10:02"
              },
              {
                  "sensor_value": 21,
                  "update_time": "2021-10-15T14:16:06"
              },
              {
                  "sensor_value": 21,
                  "update_time": "2021-10-15T14:22:10"
              },
              {
                  "sensor_value": 20.9,
                  "update_time": "2021-10-15T14:28:14"
              },
              {
                  "sensor_value": 20.8,
                  "update_time": "2021-10-15T14:34:18"
              },
              {
                  "sensor_value": 20.8,
                  "update_time": "2021-10-15T14:40:22"
              },
              {
                  "sensor_value": 20.7,
                  "update_time": "2021-10-15T14:46:29"
              },
              {
                  "sensor_value": 20.7,
                  "update_time": "2021-10-15T14:52:34"
              },
              {
                  "sensor_value": 20.6,
                  "update_time": "2021-10-15T14:58:38"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-15T15:04:42"
              },
              {
                  "sensor_value": 20.6,
                  "update_time": "2021-10-15T15:10:46"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-15T15:16:50"
              },
              {
                  "sensor_value": 20.5,
                  "update_time": "2021-10-15T15:22:54"
              },
              {
                  "sensor_value": 20.3,
                  "update_time": "2021-10-15T15:28:58"
              },
              {
                  "sensor_value": 20.2,
                  "update_time": "2021-10-15T15:35:02"
              },
              {
                  "sensor_value": 20.2,
                  "update_time": "2021-10-15T15:41:06"
              },
              {
                  "sensor_value": 20.2,
                  "update_time": "2021-10-15T15:47:10"
              },
              {
                  "sensor_value": 20.2,
                  "update_time": "2021-10-15T15:53:14"
              },
              {
                  "sensor_value": 20.2,
                  "update_time": "2021-10-15T15:59:18"
              },
              {
                  "sensor_value": 20.2,
                  "update_time": "2021-10-15T16:05:22"
              },
              {
                  "sensor_value": 20.1,
                  "update_time": "2021-10-15T16:11:26"
              },
              {
                  "sensor_value": 20,
                  "update_time": "2021-10-15T16:17:30"
              },
              {
                  "sensor_value": 20,
                  "update_time": "2021-10-15T16:23:34"
              },
              {
                  "sensor_value": 19.9,
                  "update_time": "2021-10-15T16:29:39"
              },
              {
                  "sensor_value": 19.9,
                  "update_time": "2021-10-15T16:35:43"
              },
              {
                  "sensor_value": 19.8,
                  "update_time": "2021-10-15T16:41:47"
              },
              {
                  "sensor_value": 19.8,
                  "update_time": "2021-10-15T16:47:51"
              },
              {
                  "sensor_value": 19.7,
                  "update_time": "2021-10-15T16:53:55"
              },
              {
                  "sensor_value": 19.7,
                  "update_time": "2021-10-15T17:00:00"
              },
              {
                  "sensor_value": 19.5,
                  "update_time": "2021-10-15T17:06:04"
              },
              {
                  "sensor_value": 19.4,
                  "update_time": "2021-10-15T17:12:08"
              },
              {
                  "sensor_value": 19.4,
                  "update_time": "2021-10-15T17:18:12"
              },
              {
                  "sensor_value": 19.2,
                  "update_time": "2021-10-15T17:24:16"
              },
              {
                  "sensor_value": 19.2,
                  "update_time": "2021-10-15T17:30:20"
              },
              {
                  "sensor_value": 19.1,
                  "update_time": "2021-10-15T17:36:24"
              },
              {
                  "sensor_value": 19.1,
                  "update_time": "2021-10-15T17:42:28"
              },
              {
                  "sensor_value": 19.4,
                  "update_time": "2021-10-15T17:48:32"
              },
              {
                  "sensor_value": 19.5,
                  "update_time": "2021-10-15T17:54:36"
              },
              {
                  "sensor_value": 19.5,
                  "update_time": "2021-10-15T18:00:41"
              },
              {
                  "sensor_value": 19.4,
                  "update_time": "2021-10-15T18:06:45"
              },
              {
                  "sensor_value": 19.4,
                  "update_time": "2021-10-15T18:12:49"
              },
              {
                  "sensor_value": 19.4,
                  "update_time": "2021-10-15T18:18:53"
              },
              {
                  "sensor_value": 19.4,
                  "update_time": "2021-10-15T18:24:57"
              },
              {
                  "sensor_value": 19.4,
                  "update_time": "2021-10-15T18:31:02"
              },
              {
                  "sensor_value": 19.3,
                  "update_time": "2021-10-15T18:37:06"
              },
              {
                  "sensor_value": 19.3,
                  "update_time": "2021-10-15T18:43:10"
              },
              {
                  "sensor_value": 19.3,
                  "update_time": "2021-10-15T18:49:14"
              },
              {
                  "sensor_value": 19.2,
                  "update_time": "2021-10-15T18:55:18"
              },
              {
                  "sensor_value": 19.2,
                  "update_time": "2021-10-15T19:01:22"
              },
              {
                  "sensor_value": 19.2,
                  "update_time": "2021-10-15T19:07:30"
              },
              {
                  "sensor_value": 19.2,
                  "update_time": "2021-10-15T19:13:34"
              },
              {
                  "sensor_value": 19.2,
                  "update_time": "2021-10-15T19:19:38"
              },
              {
                  "sensor_value": 19.1,
                  "update_time": "2021-10-15T19:25:42"
              },
              {
                  "sensor_value": 19.1,
                  "update_time": "2021-10-15T19:31:47"
              },
              {
                  "sensor_value": 19.1,
                  "update_time": "2021-10-15T19:37:51"
              },
              {
                  "sensor_value": 19,
                  "update_time": "2021-10-15T19:43:55"
              },
              {
                  "sensor_value": 18.9,
                  "update_time": "2021-10-15T19:49:59"
              },
              {
                  "sensor_value": 19,
                  "update_time": "2021-10-15T19:56:03"
              },
              {
                  "sensor_value": 18.9,
                  "update_time": "2021-10-15T20:02:07"
              },
              {
                  "sensor_value": 18.8,
                  "update_time": "2021-10-15T20:08:12"
              },
              {
                  "sensor_value": 18.9,
                  "update_time": "2021-10-15T20:14:16"
              },
              {
                  "sensor_value": 18.8,
                  "update_time": "2021-10-15T20:20:20"
              },
              {
                  "sensor_value": 18.8,
                  "update_time": "2021-10-15T20:26:24"
              },
              {
                  "sensor_value": 18.8,
                  "update_time": "2021-10-15T20:32:28"
              },
              {
                  "sensor_value": 18.7,
                  "update_time": "2021-10-15T20:38:32"
              },
              {
                  "sensor_value": 18.6,
                  "update_time": "2021-10-15T20:44:36"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T20:50:41"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T20:56:45"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T21:02:49"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T21:08:53"
              },
              {
                  "sensor_value": 18.4,
                  "update_time": "2021-10-15T21:14:57"
              },
              {
                  "sensor_value": 18.4,
                  "update_time": "2021-10-15T21:21:01"
              },
              {
                  "sensor_value": 18.4,
                  "update_time": "2021-10-15T21:27:05"
              },
              {
                  "sensor_value": 18.5,
                  "update_time": "2021-10-15T21:33:10"
              },
              {
                  "sensor_value": 18.4,
                  "update_time": "2021-10-15T21:39:14"
              },
              {
                  "sensor_value": 18.4,
                  "update_time": "2021-10-15T21:45:18"
              },
              {
                  "sensor_value": 18.3,
                  "update_time": "2021-10-15T21:51:22"
              },
              {
                  "sensor_value": 18.2,
                  "update_time": "2021-10-15T21:57:28"
              },
              {
                  "sensor_value": 18.2,
                  "update_time": "2021-10-15T22:03:32"
              },
              {
                  "sensor_value": 18.2,
                  "update_time": "2021-10-15T22:09:36"
              },
              {
                  "sensor_value": 18.1,
                  "update_time": "2021-10-15T22:15:40"
              },
              {
                  "sensor_value": 18.1,
                  "update_time": "2021-10-15T22:21:44"
              },
              {
                  "sensor_value": 18.1,
                  "update_time": "2021-10-15T22:27:48"
              },
              {
                  "sensor_value": 18,
                  "update_time": "2021-10-15T22:33:53"
              },
              {
                  "sensor_value": 18,
                  "update_time": "2021-10-15T22:39:56"
              },
              {
                  "sensor_value": 18,
                  "update_time": "2021-10-15T22:46:00"
              },
              {
                  "sensor_value": 18,
                  "update_time": "2021-10-15T22:52:05"
              },
              {
                  "sensor_value": 18,
                  "update_time": "2021-10-15T22:58:09"
              },
              {
                  "sensor_value": 17.9,
                  "update_time": "2021-10-15T23:04:13"
              },
              {
                  "sensor_value": 17.8,
                  "update_time": "2021-10-15T23:10:17"
              },
              {
                  "sensor_value": 17.7,
                  "update_time": "2021-10-15T23:16:21"
              },
              {
                  "sensor_value": 17.7,
                  "update_time": "2021-10-15T23:22:25"
              },
              {
                  "sensor_value": 17.7,
                  "update_time": "2021-10-15T23:28:30"
              },
              {
                  "sensor_value": 17.7,
                  "update_time": "2021-10-15T23:34:34"
              },
              {
                  "sensor_value": 17.7,
                  "update_time": "2021-10-15T23:40:38"
              },
              {
                  "sensor_value": 17.7,
                  "update_time": "2021-10-15T23:46:42"
              },
              {
                  "sensor_value": 17.7,
                  "update_time": "2021-10-15T23:52:46"
              },
              {
                  "sensor_value": 17.5,
                  "update_time": "2021-10-15T23:58:50"
              },
              {
                  "sensor_value": 17.4,
                  "update_time": "2021-10-16T00:04:54"
              },
              {
                  "sensor_value": 17.4,
                  "update_time": "2021-10-16T00:10:58"
              },
              {
                  "sensor_value": 17.4,
                  "update_time": "2021-10-16T00:17:02"
              },
              {
                  "sensor_value": 17.3,
                  "update_time": "2021-10-16T00:23:06"
              },
              {
                  "sensor_value": 17.3,
                  "update_time": "2021-10-16T00:29:11"
              },
              {
                  "sensor_value": 17.3,
                  "update_time": "2021-10-16T00:35:15"
              },
              {
                  "sensor_value": 17.3,
                  "update_time": "2021-10-16T00:41:19"
              },
              {
                  "sensor_value": 17.3,
                  "update_time": "2021-10-16T00:47:23"
              },
              {
                  "sensor_value": 17.3,
                  "update_time": "2021-10-16T00:53:27"
              },
              {
                  "sensor_value": 17.2,
                  "update_time": "2021-10-16T00:59:31"
              },
              {
                  "sensor_value": 17.1,
                  "update_time": "2021-10-16T01:05:35"
              },
              {
                  "sensor_value": 17,
                  "update_time": "2021-10-16T01:11:39"
              },
              {
                  "sensor_value": 17,
                  "update_time": "2021-10-16T01:17:43"
              },
              {
                  "sensor_value": 16.9,
                  "update_time": "2021-10-16T01:23:48"
              },
              {
                  "sensor_value": 16.8,
                  "update_time": "2021-10-16T01:29:52"
              },
              {
                  "sensor_value": 16.8,
                  "update_time": "2021-10-16T01:35:56"
              },
              {
                  "sensor_value": 16.9,
                  "update_time": "2021-10-16T01:42:00"
              },
              {
                  "sensor_value": 16.9,
                  "update_time": "2021-10-16T01:48:04"
              },
              {
                  "sensor_value": 16.9,
                  "update_time": "2021-10-16T01:54:08"
              },
              {
                  "sensor_value": 16.8,
                  "update_time": "2021-10-16T02:00:12"
              },
              {
                  "sensor_value": 16.7,
                  "update_time": "2021-10-16T02:06:16"
              },
              {
                  "sensor_value": 16.6,
                  "update_time": "2021-10-16T02:12:20"
              },
              {
                  "sensor_value": 16.6,
                  "update_time": "2021-10-16T02:18:24"
              },
              {
                  "sensor_value": 16.5,
                  "update_time": "2021-10-16T02:24:29"
              },
              {
                  "sensor_value": 16.5,
                  "update_time": "2021-10-16T02:30:33"
              },
              {
                  "sensor_value": 16.5,
                  "update_time": "2021-10-16T02:36:37"
              },
              {
                  "sensor_value": 16.5,
                  "update_time": "2021-10-16T02:42:41"
              },
              {
                  "sensor_value": 16.5,
                  "update_time": "2021-10-16T02:48:46"
              },
              {
                  "sensor_value": 16.5,
                  "update_time": "2021-10-16T02:54:50"
              },
              {
                  "sensor_value": 16.5,
                  "update_time": "2021-10-16T03:00:54"
              },
              {
                  "sensor_value": 16.4,
                  "update_time": "2021-10-16T03:06:59"
              },
              {
                  "sensor_value": 16.3,
                  "update_time": "2021-10-16T03:13:03"
              },
              {
                  "sensor_value": 16.2,
                  "update_time": "2021-10-16T03:19:07"
              },
              {
                  "sensor_value": 16.2,
                  "update_time": "2021-10-16T03:25:11"
              },
              {
                  "sensor_value": 16.2,
                  "update_time": "2021-10-16T03:31:16"
              },
              {
                  "sensor_value": 16.2,
                  "update_time": "2021-10-16T03:37:20"
              },
              {
                  "sensor_value": 16.2,
                  "update_time": "2021-10-16T03:43:24"
              },
              {
                  "sensor_value": 16.3,
                  "update_time": "2021-10-16T03:49:28"
              },
              {
                  "sensor_value": 16.3,
                  "update_time": "2021-10-16T03:55:32"
              },
              {
                  "sensor_value": 16.3,
                  "update_time": "2021-10-16T04:01:37"
              },
              {
                  "sensor_value": 16.2,
                  "update_time": "2021-10-16T04:07:41"
              },
              {
                  "sensor_value": 16.1,
                  "update_time": "2021-10-16T04:13:45"
              },
              {
                  "sensor_value": 16,
                  "update_time": "2021-10-16T04:19:49"
              },
              {
                  "sensor_value": 16,
                  "update_time": "2021-10-16T04:25:53"
              },
              {
                  "sensor_value": 15.9,
                  "update_time": "2021-10-16T04:31:57"
              },
              {
                  "sensor_value": 16,
                  "update_time": "2021-10-16T04:38:01"
              },
              {
                  "sensor_value": 16,
                  "update_time": "2021-10-16T04:44:06"
              },
              {
                  "sensor_value": 16.1,
                  "update_time": "2021-10-16T04:50:10"
              },
              {
                  "sensor_value": 16.2,
                  "update_time": "2021-10-16T04:56:14"
              },
              {
                  "sensor_value": 16.2,
                  "update_time": "2021-10-16T05:02:18"
              },
              {
                  "sensor_value": 16.2,
                  "update_time": "2021-10-16T05:08:22"
              },
              {
                  "sensor_value": 16.1,
                  "update_time": "2021-10-16T05:14:26"
              },
              {
                  "sensor_value": 16.1,
                  "update_time": "2021-10-16T05:20:31"
              },
              {
                  "sensor_value": 16.2,
                  "update_time": "2021-10-16T05:26:35"
              },
              {
                  "sensor_value": 16.2,
                  "update_time": "2021-10-16T05:32:39"
              },
              {
                  "sensor_value": 16.2,
                  "update_time": "2021-10-16T05:38:43"
              },
              {
                  "sensor_value": 16.2,
                  "update_time": "2021-10-16T05:44:47"
              },
              {
                  "sensor_value": 16.2,
                  "update_time": "2021-10-16T05:50:51"
              },
              {
                  "sensor_value": 16.3,
                  "update_time": "2021-10-16T05:56:55"
              },
              {
                  "sensor_value": 16.4,
                  "update_time": "2021-10-16T06:02:59"
              },
              {
                  "sensor_value": 16.3,
                  "update_time": "2021-10-16T06:09:03"
              },
              {
                  "sensor_value": 16.3,
                  "update_time": "2021-10-16T06:15:08"
              },
              {
                  "sensor_value": 16.3,
                  "update_time": "2021-10-16T06:21:12"
              },
              {
                  "sensor_value": 16.4,
                  "update_time": "2021-10-16T06:27:16"
              },
              {
                  "sensor_value": 16.5,
                  "update_time": "2021-10-16T06:33:20"
              },
              {
                  "sensor_value": 16.5,
                  "update_time": "2021-10-16T06:39:25"
              },
              {
                  "sensor_value": 16.5,
                  "update_time": "2021-10-16T06:45:29"
              },
              {
                  "sensor_value": 16.5,
                  "update_time": "2021-10-16T06:51:34"
              },
              {
                  "sensor_value": 16.6,
                  "update_time": "2021-10-16T06:57:38"
              },
              {
                  "sensor_value": 16.6,
                  "update_time": "2021-10-16T07:03:42"
              },
              {
                  "sensor_value": 16.7,
                  "update_time": "2021-10-16T07:09:46"
              },
              {
                  "sensor_value": 16.8,
                  "update_time": "2021-10-16T07:15:50"
              },
              {
                  "sensor_value": 16.8,
                  "update_time": "2021-10-16T07:21:54"
              },
              {
                  "sensor_value": 16.8,
                  "update_time": "2021-10-16T07:27:58"
              },
              {
                  "sensor_value": 16.8,
                  "update_time": "2021-10-16T07:34:03"
              },
              {
                  "sensor_value": 17,
                  "update_time": "2021-10-16T07:40:07"
              },
              {
                  "sensor_value": 17,
                  "update_time": "2021-10-16T07:46:11"
              },
              {
                  "sensor_value": 17,
                  "update_time": "2021-10-16T07:52:15"
              },
              {
                  "sensor_value": 17,
                  "update_time": "2021-10-16T07:58:19"
              },
              {
                  "sensor_value": 17.1,
                  "update_time": "2021-10-16T08:04:23"
              },
              {
                  "sensor_value": 17.2,
                  "update_time": "2021-10-16T08:10:27"
              },
              {
                  "sensor_value": 17.4,
                  "update_time": "2021-10-16T08:16:32"
              },
              {
                  "sensor_value": 17.4,
                  "update_time": "2021-10-16T08:22:36"
              },
              {
                  "sensor_value": 17.4,
                  "update_time": "2021-10-16T08:28:43"
              },
              {
                  "sensor_value": 17.6,
                  "update_time": "2021-10-16T08:34:47"
              },
              {
                  "sensor_value": 17.7,
                  "update_time": "2021-10-16T08:40:51"
              },
              {
                  "sensor_value": 17.8,
                  "update_time": "2021-10-16T08:46:55"
              },
              {
                  "sensor_value": 17.9,
                  "update_time": "2021-10-16T08:52:59"
              },
              {
                  "sensor_value": 18.1,
                  "update_time": "2021-10-16T08:59:03"
              },
              {
                  "sensor_value": 18.1,
                  "update_time": "2021-10-16T09:05:08"
              },
              {
                  "sensor_value": 18.2,
                  "update_time": "2021-10-16T09:11:12"
              },
              {
                  "sensor_value": 18.3,
                  "update_time": "2021-10-16T09:17:16"
              },
              {
                  "sensor_value": 18.3,
                  "update_time": "2021-10-16T09:23:20"
              },
              {
                  "sensor_value": 18.2,
                  "update_time": "2021-10-16T09:29:24"
              },
              {
                  "sensor_value": 18.1,
                  "update_time": "2021-10-16T09:35:28"
              },
              {
                  "sensor_value": 18,
                  "update_time": "2021-10-16T09:41:32"
              },
              {
                  "sensor_value": 18.1,
                  "update_time": "2021-10-16T09:47:36"
              },
              {
                  "sensor_value": 18.3,
                  "update_time": "2021-10-16T09:53:40"
              },
              {
                  "sensor_value": 18.4,
                  "update_time": "2021-10-16T09:59:44"
              },
              {
                  "sensor_value": 18.3,
                  "update_time": "2021-10-16T10:05:48"
              },
              {
                  "sensor_value": 18.2,
                  "update_time": "2021-10-16T10:11:52"
              },
              {
                  "sensor_value": 18.2,
                  "update_time": "2021-10-16T10:17:56"
              },
              {
                  "sensor_value": 18.2,
                  "update_time": "2021-10-16T10:24:00"
              },
              {
                  "sensor_value": 18.3,
                  "update_time": "2021-10-16T10:30:04"
              },
              {
                  "sensor_value": 18.2,
                  "update_time": "2021-10-16T10:36:08"
              },
              {
                  "sensor_value": 18.1,
                  "update_time": "2021-10-16T10:42:13"
              },
              {
                  "sensor_value": 18.1,
                  "update_time": "2021-10-16T10:48:17"
              },
              {
                  "sensor_value": 18.1,
                  "update_time": "2021-10-16T10:54:21"
              },
              {
                  "sensor_value": 18.2,
                  "update_time": "2021-10-16T11:00:26"
              }
          ]
      },
      {
          "sensor_id": 16296337732817934,
          "sensor_name": "DIYWS-H",
          "sensor_type": "TODO",
          "data": [
              {
                  "sensor_value": 49,
                  "update_time": "2021-10-05T08:53:05"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-05T08:53:50"
              },
              {
                  "sensor_value": 52,
                  "update_time": "2021-10-05T08:59:54"
              },
              {
                  "sensor_value": 31,
                  "update_time": "2021-10-05T09:05:59"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-05T09:12:03"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-05T09:18:07"
              },
              {
                  "sensor_value": 31,
                  "update_time": "2021-10-05T09:24:11"
              },
              {
                  "sensor_value": 31,
                  "update_time": "2021-10-05T09:30:15"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-05T09:36:19"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-05T09:42:24"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-05T09:48:28"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-05T09:54:32"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-05T10:00:36"
              },
              {
                  "sensor_value": 31,
                  "update_time": "2021-10-05T10:06:40"
              },
              {
                  "sensor_value": 31,
                  "update_time": "2021-10-05T10:12:44"
              },
              {
                  "sensor_value": 31,
                  "update_time": "2021-10-05T10:18:48"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-05T10:24:53"
              },
              {
                  "sensor_value": 31,
                  "update_time": "2021-10-05T10:30:57"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-05T10:37:01"
              },
              {
                  "sensor_value": 31,
                  "update_time": "2021-10-05T10:43:05"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-05T10:49:09"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-05T10:55:13"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-05T11:01:17"
              },
              {
                  "sensor_value": 31,
                  "update_time": "2021-10-05T11:07:22"
              },
              {
                  "sensor_value": 31,
                  "update_time": "2021-10-05T11:13:26"
              },
              {
                  "sensor_value": 31,
                  "update_time": "2021-10-05T11:19:30"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-05T11:25:34"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-05T11:31:39"
              },
              {
                  "sensor_value": 31,
                  "update_time": "2021-10-05T11:37:43"
              },
              {
                  "sensor_value": 31,
                  "update_time": "2021-10-05T11:43:47"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-05T11:49:51"
              },
              {
                  "sensor_value": 31,
                  "update_time": "2021-10-05T11:55:56"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-05T12:02:00"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-05T12:08:04"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-05T12:14:08"
              },
              {
                  "sensor_value": 33,
                  "update_time": "2021-10-05T12:20:12"
              },
              {
                  "sensor_value": 34,
                  "update_time": "2021-10-05T12:26:16"
              },
              {
                  "sensor_value": 34,
                  "update_time": "2021-10-05T12:32:20"
              },
              {
                  "sensor_value": 33,
                  "update_time": "2021-10-05T12:38:24"
              },
              {
                  "sensor_value": 34,
                  "update_time": "2021-10-05T12:44:28"
              },
              {
                  "sensor_value": 34,
                  "update_time": "2021-10-05T12:50:32"
              },
              {
                  "sensor_value": 35,
                  "update_time": "2021-10-05T12:56:37"
              },
              {
                  "sensor_value": 35,
                  "update_time": "2021-10-05T13:02:41"
              },
              {
                  "sensor_value": 36,
                  "update_time": "2021-10-05T13:08:45"
              },
              {
                  "sensor_value": 35,
                  "update_time": "2021-10-05T13:14:49"
              },
              {
                  "sensor_value": 34,
                  "update_time": "2021-10-05T13:20:53"
              },
              {
                  "sensor_value": 33,
                  "update_time": "2021-10-05T13:26:57"
              },
              {
                  "sensor_value": 34,
                  "update_time": "2021-10-05T13:33:01"
              },
              {
                  "sensor_value": 33,
                  "update_time": "2021-10-05T13:39:06"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-05T13:45:13"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-05T13:51:17"
              },
              {
                  "sensor_value": 33,
                  "update_time": "2021-10-05T13:57:21"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-05T14:03:25"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-05T14:09:29"
              },
              {
                  "sensor_value": 32,
                  "update_time": "2021-10-05T14:15:33"
              },
              {
                  "sensor_value": 47,
                  "update_time": "2021-10-06T10:14:22"
              },
              {
                  "sensor_value": 47,
                  "update_time": "2021-10-06T10:20:26"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T10:26:30"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T10:32:34"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T10:38:38"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T10:44:42"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T10:50:46"
              },
              {
                  "sensor_value": 29,
                  "update_time": "2021-10-06T10:56:50"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T11:02:54"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T11:08:59"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T11:15:03"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T11:21:07"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T11:27:11"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T11:33:15"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T11:39:19"
              },
              {
                  "sensor_value": 31,
                  "update_time": "2021-10-06T11:45:22"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T11:51:26"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T11:57:32"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T12:03:36"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T12:09:40"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T12:15:45"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T12:21:49"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T12:27:53"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T12:33:57"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T12:40:02"
              },
              {
                  "sensor_value": 31,
                  "update_time": "2021-10-06T12:46:06"
              },
              {
                  "sensor_value": 31,
                  "update_time": "2021-10-06T12:52:10"
              },
              {
                  "sensor_value": 30,
                  "update_time": "2021-10-06T12:58:14"
              },
              {
                  "sensor_value": 31,
                  "update_time": "2021-10-06T13:04:18"
              },
              {
                  "sensor_value": 33,
                  "update_time": "2021-10-06T13:10:21"
              },
              {
                  "sensor_value": 33,
                  "update_time": "2021-10-06T13:16:25"
              },
              {
                  "sensor_value": 33,
                  "update_time": "2021-10-06T13:22:29"
              },
              {
                  "sensor_value": 34,
                  "update_time": "2021-10-06T13:28:33"
              },
              {
                  "sensor_value": 34,
                  "update_time": "2021-10-06T13:34:37"
              },
              {
                  "sensor_value": 34,
                  "update_time": "2021-10-06T13:40:41"
              },
              {
                  "sensor_value": 34,
                  "update_time": "2021-10-06T13:46:46"
              },
              {
                  "sensor_value": 34,
                  "update_time": "2021-10-06T13:52:50"
              },
              {
                  "sensor_value": 35,
                  "update_time": "2021-10-06T13:58:54"
              },
              {
                  "sensor_value": 36,
                  "update_time": "2021-10-06T14:04:57"
              },
              {
                  "sensor_value": 36,
                  "update_time": "2021-10-06T14:11:01"
              },
              {
                  "sensor_value": 36,
                  "update_time": "2021-10-06T14:17:05"
              },
              {
                  "sensor_value": 37,
                  "update_time": "2021-10-06T14:23:09"
              },
              {
                  "sensor_value": 36,
                  "update_time": "2021-10-06T14:29:13"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T13:53:20"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T13:59:24"
              },
              {
                  "sensor_value": 64,
                  "update_time": "2021-10-14T14:05:28"
              },
              {
                  "sensor_value": 64,
                  "update_time": "2021-10-14T14:11:33"
              },
              {
                  "sensor_value": 64,
                  "update_time": "2021-10-14T14:17:37"
              },
              {
                  "sensor_value": 64,
                  "update_time": "2021-10-14T14:23:41"
              },
              {
                  "sensor_value": 64,
                  "update_time": "2021-10-14T14:29:45"
              },
              {
                  "sensor_value": 64,
                  "update_time": "2021-10-14T14:35:49"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-14T14:41:53"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-14T14:47:57"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-14T14:54:02"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-14T15:00:06"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-14T15:06:10"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-14T15:12:14"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-14T15:18:18"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-14T15:24:22"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-14T15:30:26"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-14T15:36:30"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-14T15:42:35"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-14T15:48:39"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-14T15:54:43"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-14T16:00:47"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-14T16:06:51"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-14T16:12:55"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-14T16:18:59"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-14T16:25:03"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-14T16:31:07"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-14T16:37:11"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-14T16:43:16"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-14T16:49:20"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-14T16:55:27"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-14T17:01:31"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-14T17:07:35"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-14T17:13:40"
              },
              {
                  "sensor_value": 64,
                  "update_time": "2021-10-14T17:19:44"
              },
              {
                  "sensor_value": 64,
                  "update_time": "2021-10-14T17:25:48"
              },
              {
                  "sensor_value": 64,
                  "update_time": "2021-10-14T17:31:53"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-14T17:37:57"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-14T17:44:01"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-14T17:50:05"
              },
              {
                  "sensor_value": 64,
                  "update_time": "2021-10-14T17:56:10"
              },
              {
                  "sensor_value": 64,
                  "update_time": "2021-10-14T18:02:14"
              },
              {
                  "sensor_value": 64,
                  "update_time": "2021-10-14T18:08:18"
              },
              {
                  "sensor_value": 64,
                  "update_time": "2021-10-14T18:14:22"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-14T18:20:26"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T18:26:30"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T18:32:35"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T18:38:39"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T18:44:43"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T18:50:47"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T18:56:51"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T19:02:56"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T19:09:00"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T19:15:04"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T19:21:08"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T19:27:12"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-14T19:33:17"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-14T19:39:21"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-14T19:45:25"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T19:51:30"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T19:57:34"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T20:03:39"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T20:09:43"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T20:15:47"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T20:21:51"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T20:27:55"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T20:33:59"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T20:40:04"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T20:46:08"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T20:52:12"
              },
              {
                  "sensor_value": 64,
                  "update_time": "2021-10-14T20:58:16"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T21:04:20"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T21:10:25"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T21:16:29"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T21:22:33"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T21:28:37"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T21:34:41"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T21:40:46"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T21:46:50"
              },
              {
                  "sensor_value": 65,
                  "update_time": "2021-10-14T21:52:54"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T21:58:58"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T22:05:02"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T22:11:06"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T22:17:10"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T22:23:14"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T22:29:19"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T22:35:23"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T22:41:27"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T22:47:31"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T22:53:35"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T22:59:39"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T23:05:43"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T23:11:47"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T23:17:52"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T23:23:56"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T23:30:00"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T23:36:04"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T23:42:08"
              },
              {
                  "sensor_value": 66,
                  "update_time": "2021-10-14T23:48:12"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-14T23:54:16"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T00:00:20"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T00:06:24"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T00:12:28"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T00:18:33"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T00:24:37"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T00:30:41"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T00:36:45"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T00:42:49"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T00:48:53"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T00:54:57"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T01:01:02"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T01:07:06"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T01:13:10"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T01:19:14"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T01:25:19"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T01:31:23"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T01:37:27"
              },
              {
                  "sensor_value": 68,
                  "update_time": "2021-10-15T01:43:31"
              },
              {
                  "sensor_value": 68,
                  "update_time": "2021-10-15T01:49:36"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T01:55:40"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T02:01:44"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T02:07:48"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T02:13:52"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T02:19:56"
              },
              {
                  "sensor_value": 68,
                  "update_time": "2021-10-15T02:26:00"
              },
              {
                  "sensor_value": 68,
                  "update_time": "2021-10-15T02:32:04"
              },
              {
                  "sensor_value": 68,
                  "update_time": "2021-10-15T02:38:08"
              },
              {
                  "sensor_value": 68,
                  "update_time": "2021-10-15T02:44:13"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T02:50:17"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T02:56:21"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T03:02:25"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T03:08:29"
              },
              {
                  "sensor_value": 68,
                  "update_time": "2021-10-15T03:14:33"
              },
              {
                  "sensor_value": 68,
                  "update_time": "2021-10-15T03:20:37"
              },
              {
                  "sensor_value": 68,
                  "update_time": "2021-10-15T03:26:41"
              },
              {
                  "sensor_value": 68,
                  "update_time": "2021-10-15T03:32:46"
              },
              {
                  "sensor_value": 68,
                  "update_time": "2021-10-15T03:38:50"
              },
              {
                  "sensor_value": 68,
                  "update_time": "2021-10-15T03:44:54"
              },
              {
                  "sensor_value": 69,
                  "update_time": "2021-10-15T03:50:58"
              },
              {
                  "sensor_value": 71,
                  "update_time": "2021-10-15T03:57:03"
              },
              {
                  "sensor_value": 72,
                  "update_time": "2021-10-15T04:03:07"
              },
              {
                  "sensor_value": 72,
                  "update_time": "2021-10-15T04:09:11"
              },
              {
                  "sensor_value": 73,
                  "update_time": "2021-10-15T04:15:15"
              },
              {
                  "sensor_value": 72,
                  "update_time": "2021-10-15T04:21:20"
              },
              {
                  "sensor_value": 72,
                  "update_time": "2021-10-15T04:27:24"
              },
              {
                  "sensor_value": 71,
                  "update_time": "2021-10-15T04:33:28"
              },
              {
                  "sensor_value": 71,
                  "update_time": "2021-10-15T04:39:32"
              },
              {
                  "sensor_value": 71,
                  "update_time": "2021-10-15T04:45:36"
              },
              {
                  "sensor_value": 72,
                  "update_time": "2021-10-15T04:51:40"
              },
              {
                  "sensor_value": 72,
                  "update_time": "2021-10-15T04:57:44"
              },
              {
                  "sensor_value": 73,
                  "update_time": "2021-10-15T05:03:49"
              },
              {
                  "sensor_value": 73,
                  "update_time": "2021-10-15T05:09:53"
              },
              {
                  "sensor_value": 73,
                  "update_time": "2021-10-15T05:15:57"
              },
              {
                  "sensor_value": 73,
                  "update_time": "2021-10-15T05:22:01"
              },
              {
                  "sensor_value": 72,
                  "update_time": "2021-10-15T05:28:05"
              },
              {
                  "sensor_value": 71,
                  "update_time": "2021-10-15T05:34:09"
              },
              {
                  "sensor_value": 71,
                  "update_time": "2021-10-15T05:40:13"
              },
              {
                  "sensor_value": 71,
                  "update_time": "2021-10-15T05:46:17"
              },
              {
                  "sensor_value": 70,
                  "update_time": "2021-10-15T05:52:22"
              },
              {
                  "sensor_value": 70,
                  "update_time": "2021-10-15T05:58:26"
              },
              {
                  "sensor_value": 70,
                  "update_time": "2021-10-15T06:04:30"
              },
              {
                  "sensor_value": 70,
                  "update_time": "2021-10-15T06:10:34"
              },
              {
                  "sensor_value": 69,
                  "update_time": "2021-10-15T06:16:38"
              },
              {
                  "sensor_value": 69,
                  "update_time": "2021-10-15T06:22:42"
              },
              {
                  "sensor_value": 69,
                  "update_time": "2021-10-15T06:28:46"
              },
              {
                  "sensor_value": 69,
                  "update_time": "2021-10-15T06:34:50"
              },
              {
                  "sensor_value": 69,
                  "update_time": "2021-10-15T06:40:54"
              },
              {
                  "sensor_value": 69,
                  "update_time": "2021-10-15T06:46:58"
              },
              {
                  "sensor_value": 68,
                  "update_time": "2021-10-15T06:53:02"
              },
              {
                  "sensor_value": 68,
                  "update_time": "2021-10-15T06:59:07"
              },
              {
                  "sensor_value": 68,
                  "update_time": "2021-10-15T07:05:11"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T07:11:15"
              },
              {
                  "sensor_value": 67,
                  "update_time": "2021-10-15T07:17:19"
              },
              {
                  "sensor_value": 64,
                  "update_time": "2021-10-15T07:23:23"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-15T07:29:27"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-15T07:35:32"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-15T07:41:36"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T07:47:40"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T07:53:44"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-15T07:59:48"
              },
              {
                  "sensor_value": 59,
                  "update_time": "2021-10-15T08:05:52"
              },
              {
                  "sensor_value": 59,
                  "update_time": "2021-10-15T08:11:56"
              },
              {
                  "sensor_value": 59,
                  "update_time": "2021-10-15T08:18:00"
              },
              {
                  "sensor_value": 59,
                  "update_time": "2021-10-15T08:24:04"
              },
              {
                  "sensor_value": 59,
                  "update_time": "2021-10-15T08:30:09"
              },
              {
                  "sensor_value": 58,
                  "update_time": "2021-10-15T08:36:13"
              },
              {
                  "sensor_value": 58,
                  "update_time": "2021-10-15T08:42:17"
              },
              {
                  "sensor_value": 58,
                  "update_time": "2021-10-15T08:48:22"
              },
              {
                  "sensor_value": 57,
                  "update_time": "2021-10-15T08:54:26"
              },
              {
                  "sensor_value": 57,
                  "update_time": "2021-10-15T09:00:30"
              },
              {
                  "sensor_value": 57,
                  "update_time": "2021-10-15T09:06:34"
              },
              {
                  "sensor_value": 56,
                  "update_time": "2021-10-15T09:12:38"
              },
              {
                  "sensor_value": 56,
                  "update_time": "2021-10-15T09:18:42"
              },
              {
                  "sensor_value": 56,
                  "update_time": "2021-10-15T09:24:46"
              },
              {
                  "sensor_value": 55,
                  "update_time": "2021-10-15T09:30:51"
              },
              {
                  "sensor_value": 55,
                  "update_time": "2021-10-15T09:36:55"
              },
              {
                  "sensor_value": 55,
                  "update_time": "2021-10-15T09:42:59"
              },
              {
                  "sensor_value": 55,
                  "update_time": "2021-10-15T09:49:03"
              },
              {
                  "sensor_value": 55,
                  "update_time": "2021-10-15T09:55:07"
              },
              {
                  "sensor_value": 55,
                  "update_time": "2021-10-15T10:01:12"
              },
              {
                  "sensor_value": 54,
                  "update_time": "2021-10-15T10:07:16"
              },
              {
                  "sensor_value": 54,
                  "update_time": "2021-10-15T10:13:21"
              },
              {
                  "sensor_value": 54,
                  "update_time": "2021-10-15T10:19:25"
              },
              {
                  "sensor_value": 54,
                  "update_time": "2021-10-15T10:25:30"
              },
              {
                  "sensor_value": 54,
                  "update_time": "2021-10-15T10:31:34"
              },
              {
                  "sensor_value": 54,
                  "update_time": "2021-10-15T10:37:38"
              },
              {
                  "sensor_value": 54,
                  "update_time": "2021-10-15T10:43:42"
              },
              {
                  "sensor_value": 54,
                  "update_time": "2021-10-15T10:49:46"
              },
              {
                  "sensor_value": 53,
                  "update_time": "2021-10-15T10:55:50"
              },
              {
                  "sensor_value": 53,
                  "update_time": "2021-10-15T11:01:55"
              },
              {
                  "sensor_value": 53,
                  "update_time": "2021-10-15T11:07:59"
              },
              {
                  "sensor_value": 52,
                  "update_time": "2021-10-15T11:14:03"
              },
              {
                  "sensor_value": 52,
                  "update_time": "2021-10-15T11:20:07"
              },
              {
                  "sensor_value": 52,
                  "update_time": "2021-10-15T11:26:11"
              },
              {
                  "sensor_value": 52,
                  "update_time": "2021-10-15T11:32:15"
              },
              {
                  "sensor_value": 52,
                  "update_time": "2021-10-15T11:38:19"
              },
              {
                  "sensor_value": 52,
                  "update_time": "2021-10-15T11:44:23"
              },
              {
                  "sensor_value": 51,
                  "update_time": "2021-10-15T11:50:27"
              },
              {
                  "sensor_value": 51,
                  "update_time": "2021-10-15T11:56:31"
              },
              {
                  "sensor_value": 52,
                  "update_time": "2021-10-15T12:02:36"
              },
              {
                  "sensor_value": 51,
                  "update_time": "2021-10-15T12:08:40"
              },
              {
                  "sensor_value": 52,
                  "update_time": "2021-10-15T12:14:44"
              },
              {
                  "sensor_value": 51,
                  "update_time": "2021-10-15T12:20:48"
              },
              {
                  "sensor_value": 51,
                  "update_time": "2021-10-15T12:26:52"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T12:32:56"
              },
              {
                  "sensor_value": 51,
                  "update_time": "2021-10-15T12:39:00"
              },
              {
                  "sensor_value": 51,
                  "update_time": "2021-10-15T12:45:05"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T12:51:09"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T12:57:13"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T13:03:17"
              },
              {
                  "sensor_value": 49,
                  "update_time": "2021-10-15T13:09:21"
              },
              {
                  "sensor_value": 49,
                  "update_time": "2021-10-15T13:15:25"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T13:21:30"
              },
              {
                  "sensor_value": 49,
                  "update_time": "2021-10-15T13:27:34"
              },
              {
                  "sensor_value": 49,
                  "update_time": "2021-10-15T13:33:39"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T13:39:43"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T13:45:47"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T13:51:51"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T13:57:55"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T14:03:59"
              },
              {
                  "sensor_value": 51,
                  "update_time": "2021-10-15T14:10:03"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T14:16:08"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T14:22:12"
              },
              {
                  "sensor_value": 49,
                  "update_time": "2021-10-15T14:28:16"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T14:34:20"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T14:40:27"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T14:46:31"
              },
              {
                  "sensor_value": 49,
                  "update_time": "2021-10-15T14:52:35"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T14:58:39"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T15:04:44"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T15:10:48"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T15:16:52"
              },
              {
                  "sensor_value": 51,
                  "update_time": "2021-10-15T15:22:56"
              },
              {
                  "sensor_value": 50,
                  "update_time": "2021-10-15T15:29:00"
              },
              {
                  "sensor_value": 51,
                  "update_time": "2021-10-15T15:35:04"
              },
              {
                  "sensor_value": 51,
                  "update_time": "2021-10-15T15:41:07"
              },
              {
                  "sensor_value": 51,
                  "update_time": "2021-10-15T15:47:11"
              },
              {
                  "sensor_value": 51,
                  "update_time": "2021-10-15T15:53:16"
              },
              {
                  "sensor_value": 51,
                  "update_time": "2021-10-15T15:59:20"
              },
              {
                  "sensor_value": 51,
                  "update_time": "2021-10-15T16:05:24"
              },
              {
                  "sensor_value": 52,
                  "update_time": "2021-10-15T16:11:28"
              },
              {
                  "sensor_value": 52,
                  "update_time": "2021-10-15T16:17:32"
              },
              {
                  "sensor_value": 52,
                  "update_time": "2021-10-15T16:23:36"
              },
              {
                  "sensor_value": 52,
                  "update_time": "2021-10-15T16:29:40"
              },
              {
                  "sensor_value": 52,
                  "update_time": "2021-10-15T16:35:44"
              },
              {
                  "sensor_value": 52,
                  "update_time": "2021-10-15T16:41:49"
              },
              {
                  "sensor_value": 52,
                  "update_time": "2021-10-15T16:47:53"
              },
              {
                  "sensor_value": 53,
                  "update_time": "2021-10-15T16:53:57"
              },
              {
                  "sensor_value": 53,
                  "update_time": "2021-10-15T17:00:01"
              },
              {
                  "sensor_value": 53,
                  "update_time": "2021-10-15T17:06:05"
              },
              {
                  "sensor_value": 54,
                  "update_time": "2021-10-15T17:12:09"
              },
              {
                  "sensor_value": 54,
                  "update_time": "2021-10-15T17:18:13"
              },
              {
                  "sensor_value": 55,
                  "update_time": "2021-10-15T17:24:18"
              },
              {
                  "sensor_value": 55,
                  "update_time": "2021-10-15T17:30:22"
              },
              {
                  "sensor_value": 56,
                  "update_time": "2021-10-15T17:36:26"
              },
              {
                  "sensor_value": 56,
                  "update_time": "2021-10-15T17:42:30"
              },
              {
                  "sensor_value": 56,
                  "update_time": "2021-10-15T17:48:34"
              },
              {
                  "sensor_value": 57,
                  "update_time": "2021-10-15T17:54:38"
              },
              {
                  "sensor_value": 57,
                  "update_time": "2021-10-15T18:00:42"
              },
              {
                  "sensor_value": 57,
                  "update_time": "2021-10-15T18:06:46"
              },
              {
                  "sensor_value": 57,
                  "update_time": "2021-10-15T18:12:51"
              },
              {
                  "sensor_value": 57,
                  "update_time": "2021-10-15T18:18:55"
              },
              {
                  "sensor_value": 58,
                  "update_time": "2021-10-15T18:24:59"
              },
              {
                  "sensor_value": 58,
                  "update_time": "2021-10-15T18:31:03"
              },
              {
                  "sensor_value": 58,
                  "update_time": "2021-10-15T18:37:07"
              },
              {
                  "sensor_value": 58,
                  "update_time": "2021-10-15T18:43:12"
              },
              {
                  "sensor_value": 58,
                  "update_time": "2021-10-15T18:49:16"
              },
              {
                  "sensor_value": 58,
                  "update_time": "2021-10-15T18:55:20"
              },
              {
                  "sensor_value": 58,
                  "update_time": "2021-10-15T19:01:27"
              },
              {
                  "sensor_value": 58,
                  "update_time": "2021-10-15T19:07:31"
              },
              {
                  "sensor_value": 59,
                  "update_time": "2021-10-15T19:13:36"
              },
              {
                  "sensor_value": 59,
                  "update_time": "2021-10-15T19:19:40"
              },
              {
                  "sensor_value": 59,
                  "update_time": "2021-10-15T19:25:44"
              },
              {
                  "sensor_value": 59,
                  "update_time": "2021-10-15T19:31:48"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-15T19:37:52"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-15T19:43:57"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-15T19:50:01"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-15T19:56:05"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-15T20:02:09"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-15T20:08:13"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-15T20:14:18"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-15T20:20:22"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-15T20:26:26"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-15T20:32:30"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T20:38:34"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T20:44:38"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T20:50:42"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T20:56:46"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-15T21:02:51"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-15T21:08:55"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T21:14:59"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T21:21:03"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T21:27:07"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T21:33:11"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T21:39:16"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T21:45:20"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T21:51:25"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T21:57:29"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T22:03:33"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T22:09:37"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T22:15:42"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-15T22:21:46"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T22:27:50"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T22:33:54"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T22:39:58"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T22:46:02"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T22:52:06"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T22:58:10"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-15T23:04:15"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-15T23:10:19"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-15T23:16:23"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-15T23:22:27"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-15T23:28:31"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-15T23:34:35"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-15T23:40:39"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-15T23:46:43"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-15T23:52:47"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-15T23:58:51"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T00:04:55"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T00:11:00"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T00:17:04"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T00:23:08"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T00:29:12"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T00:35:16"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T00:41:20"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T00:47:24"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T00:53:28"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T00:59:32"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T01:05:37"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T01:11:41"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T01:17:45"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T01:23:49"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T01:29:53"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T01:35:57"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T01:42:01"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T01:48:05"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T01:54:10"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T02:00:14"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T02:06:18"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T02:12:22"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T02:18:26"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T02:24:30"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T02:30:34"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T02:36:38"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T02:42:43"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T02:48:48"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T02:54:52"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T03:00:56"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T03:07:00"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T03:13:05"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T03:19:09"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T03:25:13"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T03:31:17"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T03:37:21"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T03:43:26"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T03:49:30"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T03:55:34"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T04:01:38"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T04:07:42"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T04:13:47"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T04:19:51"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T04:25:55"
              },
              {
                  "sensor_value": 60,
                  "update_time": "2021-10-16T04:31:59"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T04:38:03"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T04:44:07"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T04:50:12"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T04:56:16"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T05:02:20"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T05:08:24"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T05:14:28"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T05:20:32"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T05:26:36"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T05:32:40"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T05:38:44"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T05:44:48"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T05:50:53"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T05:56:57"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T06:03:01"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T06:09:05"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T06:15:09"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T06:21:13"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T06:27:17"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T06:33:22"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T06:39:27"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T06:45:31"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T06:51:35"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T06:57:39"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T07:03:43"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T07:09:48"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T07:15:52"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T07:21:56"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T07:28:00"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T07:34:04"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T07:40:08"
              },
              {
                  "sensor_value": 64,
                  "update_time": "2021-10-16T07:46:12"
              },
              {
                  "sensor_value": 64,
                  "update_time": "2021-10-16T07:52:17"
              },
              {
                  "sensor_value": 64,
                  "update_time": "2021-10-16T07:58:21"
              },
              {
                  "sensor_value": 64,
                  "update_time": "2021-10-16T08:04:25"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T08:10:29"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T08:16:33"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T08:22:37"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T08:28:44"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T08:34:48"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T08:40:53"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T08:46:57"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T08:53:01"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T08:59:05"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T09:05:09"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T09:11:13"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T09:17:18"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T09:23:22"
              },
              {
                  "sensor_value": 61,
                  "update_time": "2021-10-16T09:29:26"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T09:35:30"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T09:41:34"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T09:47:38"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T09:53:42"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T09:59:46"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T10:05:50"
              },
              {
                  "sensor_value": 62,
                  "update_time": "2021-10-16T10:11:54"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T10:17:58"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T10:24:02"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T10:30:06"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T10:36:10"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T10:42:14"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T10:48:18"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T10:54:22"
              },
              {
                  "sensor_value": 63,
                  "update_time": "2021-10-16T11:00:27"
              }
          ]
      }
  ]
  }

}
