import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-dashboard-sidebar',
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.css']
})
export class DashboardSidebarComponent implements OnInit {
  @Input() pub: string;
  public isCollapsed = true;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  public navigate(command: string) {
    this.router.navigate(['dashboard', this.pub, command]);
  }

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }
}
