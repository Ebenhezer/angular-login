import { Component, OnInit } from '@angular/core';
import { SensorService } from './sensor.service';

// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
@Component({
  selector: 'cf-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.scss',
              '../../assets/css/material-dashboard.css']
})
export class SensorsComponent implements OnInit {
  nrOfSensors: any = 0;
  sensorList: any;
  sensorData:any;
  chartData: any;

  title = 'datatables';
  dtOptions: DataTables.Settings = {};

  constructor(private sensorService: SensorService) { 
    const sCountData = this.sensorService.countSensors();
    this.sensorService.sCountData.subscribe(response_message => this.nrOfSensors = response_message);

    const sListData = this.sensorService.getListOfSensors();
    this.sensorService.sListData.subscribe(response_message => this.sensorList = response_message);

    const sHistoryData = this.sensorService.getSensorHistory();
    this.sensorService.sHistoryData.subscribe(response_message => this.sensorData = response_message);
  }

  ngOnInit(): void {

    this.sensorTrends()
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    };
  }

  openModal(){
    //Used to control the add device modal
  }

  sensorTrends(){
    am4core.useTheme(am4themes_animated);
    
    // Create chart instance
    var chart = am4core.create("sensor-chart", am4charts.XYChart);
    chart.dateFormatter.inputDateFormat = "yyyy-MMM-dd h:m:s";
    chart.exporting.menu = new am4core.ExportMenu();
    
    // Add data
    var chart_data = this.sensorData;

    // Create axis
    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

    // Create series
    function createSeries(name, data) {
      console.log(data)
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
    let i;
    let j;
    console.log(this.sensorData);
    for (i = 0; i < this.sensorData.length; i++){
        var sensor = chart_data[i];
        console.log("Cow")
        var sensor_name = sensor.sensor_name;
        var sensor_id = sensor.sensor_id;
        var trend_data = sensor.data
        console.log(sensor)
        for (j = 0; j < trend_data.length; j++){
            var sensor_value = trend_data.sensor_value;
            var update_time = trend_data.update_time;
        }
        createSeries(sensor_name, trend_data);
        
    }
    chart.cursor = new am4charts.XYCursor();
    chart.legend = new am4charts.Legend();
  }

  

}
