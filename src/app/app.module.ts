import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {JwtHelperService, JwtModule} from '@auth0/angular-jwt';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import {RouterModule, Routes} from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import {AuthGuard} from './auth.guard';
import {root} from 'rxjs/internal-compatibility';
import {tokenGetter} from './auth.service';
import {HttpClientModule} from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { DashboardTopbarComponent } from './dashboard-topbar/dashboard-topbar.component';
import { DashboardSidebarComponent } from './dashboard-sidebar/dashboard-sidebar.component';
import { TapsQueueComponent } from './taps-queue/taps-queue.component';
import { TapsPrintComponent } from './taps-print/taps-print.component';

const itemRoutes: Routes = [
  { path: 'queue', component: TapsQueueComponent},
  { path: 'print', component: TapsPrintComponent},
];

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent},
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  { path: 'dashboard/:id', component: DashboardComponent, canActivate: [AuthGuard]},
  { path: 'dashboard/:id', component: DashboardComponent, canActivate: [AuthGuard], children: itemRoutes},
  { path: '', redirectTo: '/dashboard', pathMatch: 'full'  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PageNotFoundComponent,
    DashboardComponent,
    DashboardTopbarComponent,
    DashboardSidebarComponent,
    TapsQueueComponent,
    TapsPrintComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: ['localhost:3001'],
        blacklistedRoutes: ['localhost:3001/auth/']
      }
    }),
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }


