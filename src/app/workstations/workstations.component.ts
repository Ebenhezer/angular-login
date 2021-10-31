import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataService } from '../service/data/data.service';
import { WorkstationsService } from './workstations.service';

// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

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
  formDataError = false;
  workstations:any = 0;
  workstationList: any = [];
  workstationData: any  = [];

  deleteDeviceID:any;
  deleteDeviceName:any;
  deleteDeviceToken:any;

  editDeviceName:any;
  editDeviceToken:any;
  editDeviceUpdatePerios:any;
  editFormError = false;

  title = 'datatables';
  dtOptions: DataTables.Settings = {};

  constructor(private workstationService: WorkstationsService, private dataSertvice: DataService) { 
    this.getData();
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    };

    
  }

  getData(){
    // Number of senstors
    this.workstationService.workstations(this.payload).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if(response.success){
          this.workstations = response.success;
        }
      },
      err => {
        console.log(err);
      }
    );

    // workstation list
    this.workstationService.workstationList(this.payload).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        try{
          if(response.success){
            this.workstationList = response.success;
            return true;
          }
        }catch{
          console.log("Failed to get workstation list");
        }
      },
      err => {
        console.log(err);
      }
    );

    // workstation history
    this.workstationService.workstationHistory(this.body).pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        try{
          if(response.success){
            this.workstationData = response.success;
            this.drawTrends()
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
  drawTrends(){
    am4core.useTheme(am4themes_animated);

    // Create chart instance
    var chart = am4core.create("workstation-chart", am4charts.XYChart);
    chart.dateFormatter.inputDateFormat = "yyyy-MMM-dd h:m:s";
    chart.exporting.menu = new am4core.ExportMenu();

    // Add data
    var chart_data = this.workstationData;
    console.log(chart_data);
    // Create axis
    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

    // Create series
    function createWorkStationSeries(name, data, series_name) {

    var series = chart.series.push(new am4charts.LineSeries());
    series.data = data;
    series.dataFields.valueY = series_name;
    series.dataFields.dateX = "update_time";
    series.tooltipText = "{name}\n{update_time}   Value: {series_name.formatNumber('#.00')}"
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
    chart.numberFormatter.numberFormat = "#.##";
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

    var i,j;
    for (i = 0; i < chart_data.length; i++){
        var data = chart_data[i];
        var ws_name = data.ws_name;
        var ws_id = data.ws_id;
        var trend_data = data.data

        for (j = 0; j < trend_data.length; j++){
            var ws_total_ram = trend_data.ws_total_ram;
            var ws_used_ram = trend_data.ws_used_ram;
            var ws_total_proc = trend_data.ws_total_proc;
            var ws_used_proc = trend_data. ws_used_proc;
            var ws_total_disk = trend_data.ws_total_disk;
            var ws_used_disk = trend_data.ws_used_disk;
            var ws_details = trend_data.ws_details;

        }
        var series_name:string =  ws_name ;
        var k;
        for (k =0; k <= 2; k++){
            if (k ==0) {
                var series_name = "RAM(" + ws_name +")";
                var trend_name = "ws_ram_used_per";
            }
            else if (k ==1) {
                var series_name = "Processor(" + ws_name +")";
                var trend_name = "ws_proc_used_per";
            }
            else if (k ==2) {
                var series_name = "Disk(" + ws_name +")";
                var trend_name = "ws_disk_used_per";
            }
            createWorkStationSeries(series_name, trend_data, trend_name);
        }
    }

    chart.cursor = new am4charts.XYCursor();
    chart.legend = new am4charts.Legend();

  }

  addWorkstation(addDeviceForm: NgForm){

    var workstation_owner = sessionStorage.getItem("user_id");
    var workstation_name = addDeviceForm.value.workstation_name;
    var workstation_type = addDeviceForm.value.workstation_type;
    var workstation_token = this.dataSertvice.getRandomToken(25);
    var last_modified = "1634453839";
    var update_period = addDeviceForm.value.update_period;

    if(workstation_name == "" || workstation_type == "" || update_period == ""){
      this.formDataError = true;
    }
    else{
      this.formDataError = false;
      var addworkstationParams = new HttpParams()
      .append('api_key', this.apiKey)
      .append('ws_owner', workstation_owner)
      .append('ws_name', workstation_name)
      .append('ws_type', workstation_type)
      .append('ws_token', workstation_token)
      .append('last_modified', last_modified)
      .append('update_period', update_period);

      this.workstationService.addWorkstation(addworkstationParams).pipe(takeUntil(this.destroy$)).subscribe(
        response => {
          (response);
          if(response.success){
            this.workstationData = response.success;
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

   setDeleterParams(ws_id, ws_name, ws_token){
    this.deleteDeviceID = Number(ws_id);
    this.deleteDeviceName = String(ws_name);
    this.deleteDeviceToken = String(ws_token);
   }

   deleteDevice(){
    var deleteParams = new HttpParams()
      .append('api_key', this.apiKey)
      .append('ws_id', this.deleteDeviceID)
      .append('ws_token', this.deleteDeviceToken)

    this.workstationService.deleteDevice(deleteParams).pipe(takeUntil(this.destroy$)).subscribe(
        response => {
          if(response.success){
            window.location.reload();
          }
          console.log(response);
        },
        err => {
          console.log(err);
        }
        
      );

   }

   setEditParams(ws_name, ws_token, update_period){
    this.editDeviceName = ws_name;
    this.editDeviceToken = ws_token;
    this.editDeviceUpdatePerios = update_period;
   }
   editDevice(editDeviceForm: NgForm){
    var ws_name = editDeviceForm.value.ws_name;
    var ws_token = editDeviceForm.value.ws_token;
    var update_period = editDeviceForm.value.update_period;

    if(ws_name == "" || ws_token == "" || update_period == ""){
      this.editFormError = true;
    }
    else{
        console.log("Editting..");
    }
   }

}
