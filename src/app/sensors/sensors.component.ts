import { Component, OnInit, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  private chart: am4charts.XYChart;

  nrOfSensors: any = 0;
  sensorList: any;
  sensorData:any;
  chartData: any;

  title = 'datatables';
  dtOptions: DataTables.Settings = {};

  constructor(private sensorService: SensorService,
              @Inject(PLATFORM_ID) private platformId, private zone: NgZone) { 
    const sCountData = this.sensorService.countSensors();
    this.sensorService.sCountData.subscribe(response_message => this.nrOfSensors = response_message);

    const sListData = this.sensorService.getListOfSensors();
    this.sensorService.sListData.subscribe(response_message => this.sensorList = response_message);

    const sHistoryData = this.sensorService.getSensorHistory();
    this.sensorService.sHistoryData.subscribe(response_message => this.sensorData = response_message);
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
