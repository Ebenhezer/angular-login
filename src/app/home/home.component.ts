import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'cf-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss',
              '../../assets/css/material-dashboard.css']
})
export class HomeComponent implements OnInit {
  sensors = 0;
  gps = 3;
  switches = 3;
  workstations = 0;
  constructor() { }

  ngOnInit(): void {
  }

}
