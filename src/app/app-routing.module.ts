import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GpsComponent } from './gps/gps.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './home/home.component';
import { LiveComponent } from './live/live.component';
import { LoginComponent } from './login/login.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';
import { SensorsComponent } from './sensors/sensors.component';
import { SwitchesComponent } from './switches/switches.component';
import { WorkstationsComponent } from './workstations/workstations.component';


const routes: Routes = [
  {path:'', component: HomeComponent, canActivate:[AuthGuard]},
  {path:'login', component: LoginComponent},
  {path:'register', component: RegisterComponent},
  {path:'home', component: HomeComponent, canActivate:[AuthGuard]},
  {path:'sensors', component: SensorsComponent, canActivate:[AuthGuard]},
  {path:'switches', component: SwitchesComponent, canActivate:[AuthGuard]},
  {path:'workstations', component: WorkstationsComponent, canActivate:[AuthGuard]},
  {path:'gps', component: GpsComponent, canActivate:[AuthGuard]},
  {path:'profile', component: ProfileComponent, canActivate:[AuthGuard]},
  {path:'notifications', component: NotificationsComponent, canActivate:[AuthGuard]},
  {path:'live', component: LiveComponent, canActivate:[AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
