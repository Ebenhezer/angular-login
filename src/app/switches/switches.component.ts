import { Component, OnInit } from '@angular/core';
import { SwitchesService } from './switches.service';

@Component({
  selector: 'cf-switches',
  templateUrl: './switches.component.html',
  styleUrls: ['./switches.component.scss',
              '../../assets/css/material-dashboard.css']
})
export class SwitchesComponent implements OnInit {
  switches:any = 0;
  switchList: any = [];
  switchData: any  = [];
  chartData: any;

  title = 'datatables';
  dtOptions: DataTables.Settings = {};

  constructor(private switchService: SwitchesService) {
    const sCountData = this.switchService.countSwitches();
    this.switchService.sCountSwitches.subscribe(response_message => this.switches = response_message);

    const sListData = this.switchService.getListOfSwitches();
    this.switchService.sListData.subscribe(response_message => this.switchList = response_message);

    const sHistoryData = this.switchService.getSwitchHistory();
    this.switchService.sHistoryData.subscribe(response_message => this.switchData = response_message);
   }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    };
  }

}
