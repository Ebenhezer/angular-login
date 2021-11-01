import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './service/authentication/authentication.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'cf-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss',
              '../assets/css/material-dashboard.css']
})
export class AppComponent implements OnInit {
  title = 'spoiler';
  login_status:any;
  status: boolean = false;
  session_start_date: any;
  session_end_date: any;

  constructor(public authenticationService: AuthenticationService){
    authenticationService.isAuthenticated.subscribe(response => this.login_status = response)
  }

  ngOnInit(){
    
    //Set the min max values
    // this.session_start_date = sessionStorage.getItem("min_date");
    // this.session_end_date = sessionStorage.getItem("max_date");
    // var min_date = new Date(Number(this.session_start_date)).toISOString();
    // var max_date = new Date(Number(this.session_end_date)).toISOString();

    //Set the initial time to between now and 5 days ago
    if (sessionStorage.getItem("min_date") == null){
      console.log("No session time set");
      var min_date = Math.floor((Date.now() / 1000) - 420000) ; // 5 days ago
      var max_date = Math.floor(Date.now() / 1000);

      sessionStorage.setItem("min_date", String(min_date))
      sessionStorage.setItem("max_date", String(max_date))
    }
      

  }
  clickEvent(){
      this.status = !this.status;   
  }

  logout(){
    this.authenticationService.logout()
  }

  setMinMaxTime(dateForm: NgForm){

    var min_date = new Date(dateForm.value.start_date).getTime()/1000;
    var max_date = new Date(dateForm.value.end_date).getTime()/1000;

    // Set the min and max date to the current session
    sessionStorage.setItem("min_date", String(min_date));
    sessionStorage.setItem("max_date",  String(max_date));

    // Reload the current window 
    window.location.reload();

  }
}
