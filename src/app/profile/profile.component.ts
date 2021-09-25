import { Component, OnInit } from '@angular/core';
import { DataService } from '../service/data/data.service';

@Component({
  selector: 'cf-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  response_message:any = '';
  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    const profileData = this.dataService.getProfile();
    this.dataService.profileData.subscribe(response_message => this.response_message = response_message);

  }

}
