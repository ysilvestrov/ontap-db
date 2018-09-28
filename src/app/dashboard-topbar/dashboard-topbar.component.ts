import { Component, OnInit, Input } from '@angular/core';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-dashboard-topbar',
  templateUrl: './dashboard-topbar.component.html',
  styleUrls: ['./dashboard-topbar.component.css']
})
export class DashboardTopbarComponent implements OnInit {
  public pubs: string[];
  @Input() pub: string;
  public currentUser: string;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.pubs = this.authService.getUserPubs();
    this.currentUser = this.authService.getUserName();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigate(pub) {
    this.router.navigate(['/dashboard', pub, 'queue']);
  }

}
