import { Component, OnInit } from '@angular/core';
import {QueueService} from '../queue.service';
import {Subscription} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {Tap} from '../tap';

@Component({
  selector: 'app-taps-queue',
  templateUrl: './taps-queue.component.html',
  styleUrls: ['./taps-queue.component.css']
})
export class TapsQueueComponent implements OnInit {
  private routeSubscription: Subscription;
  private id: string;
  public taps: Tap[];
  public errorMessage: any;

  constructor(
    private queueService: QueueService,
    private http: HttpClient,
    private route: ActivatedRoute,
  ) {
    this.routeSubscription = route.parent.params.subscribe(
      params => this.id = params['id']);
  }

  ngOnInit() {
    this.queueService.getTaps(this.id).subscribe(
      (taps => {this.taps = taps; }),
      (error1 => {this.errorMessage = error1; })
      );
  }

}
