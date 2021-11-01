import { Component } from '@angular/core';
import { AuthenticationService } from './service/authentication/authentication.service';

@Component({
  selector: 'cf-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss',
              '../assets/css/material-dashboard.css']
})
export class AppComponent {
  title = 'spoiler';
  login_status:any;
  status: boolean = false;

  constructor(public authenticationService: AuthenticationService){
    authenticationService.isAuthenticated.subscribe(response => this.login_status = response)
  }
  
  clickEvent(){
      this.status = !this.status;   
  }

  logout(){
    this.authenticationService.logout()
  }

  setMinMaxTime(){
    
  }
}
