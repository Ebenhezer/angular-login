import { Component } from '@angular/core';
import { AuthenticationService } from './service/authentication/authentication.service';

@Component({
  selector: 'cf-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'spoiler';

  constructor(public authenticationService: AuthenticationService){

  }

  logout(){
    this.authenticationService.logout()
  }
}
