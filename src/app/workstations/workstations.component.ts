import { Component, OnInit } from '@angular/core';
import { WorkstationsService } from './workstations.service';

@Component({
  selector: 'cf-workstations',
  templateUrl: './workstations.component.html',
  styleUrls: ['./workstations.component.scss',
              '../../assets/css/material-dashboard.css']
})
export class WorkstationsComponent implements OnInit {
  workstations:any = 0;
  workstationList: any = [];
  workstationData: any  = [];

  title = 'datatables';
  dtOptions: DataTables.Settings = {};

  constructor(private workstationService: WorkstationsService) { }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    };

    const sCountData = this.workstationService.countWorkstations();
    this.workstationService.sCountWorkstation.subscribe(response_message => this.workstations = response_message);

    const sList = this.workstationService.getListOfWorkstation();
    this.workstationService.sListData.subscribe(response_message => this.workstationList = response_message);

    const sHistoryData = this.workstationService.getWorkstationHistory();
    this.workstationService.sHistoryData.subscribe(response_message => this.workstationData = response_message);

  }

}
