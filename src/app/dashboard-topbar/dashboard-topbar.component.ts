import { Component, OnInit, Input } from '@angular/core';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-dashboard-topbar',
  templateUrl: './dashboard-topbar.component.html',
  styleUrls: ['./dashboard-topbar.component.css']
})
export class DashboardTopbarComponent implements OnInit {
  public pubs: string[];
  @Input() pub: string;
  private currentUser: string;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.pubs = this.authService.getUserPubs();
    this.currentUser = this.authService.getUserName()
  }

}
