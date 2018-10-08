import { Component, OnInit } from '@angular/core';
import {AuthService} from '../auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  public id: string;
  private routeSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.routeSubscription = route.params.subscribe(params => this.id = params['id']);
  }

  ngOnInit() {
    if (!this.id) {
      const pubs = this.authService.getUserPubs();
      if (pubs) {
        this.router.navigate(['dashboard', pubs[0], 'queue']);
      }
    }
  }

}
