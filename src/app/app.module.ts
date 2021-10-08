import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { SensorsComponent } from './sensors/sensors.component';
import { RegisterComponent } from './register/register.component';
import { HttpClientModule } from '@angular/common/http';
import { GpsComponent } from './gps/gps.component';
import { WorkstationsComponent } from './workstations/workstations.component';
import { ProfileComponent } from './profile/profile.component';
import { SwitchesComponent } from './switches/switches.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { LiveComponent } from './live/live.component';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    SensorsComponent,
    RegisterComponent,
    GpsComponent,
    WorkstationsComponent,
    ProfileComponent,
    SwitchesComponent,
    NotificationsComponent,
    LiveComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    DataTablesModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
