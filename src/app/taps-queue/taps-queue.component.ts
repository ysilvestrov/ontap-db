import { Component, OnInit } from '@angular/core';
import {QueueService} from '../queue.service';
import {Subscription} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {Beer, BeerKegOnTap, ITap, Tap} from '../ontap.models';

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
  public kegs: BeerKegOnTap[];

  constructor(
    private queueService: QueueService,
    private http: HttpClient,
    private route: ActivatedRoute,
  ) {
    this.routeSubscription = route.parent.params.subscribe(
      params => {this.id = params['id']; this.getTaps()});
  }

  ngOnInit() {
    // this.getTaps();
  }

  private isNumber(value: string | number): boolean {
    return !isNaN(Number(value.toString()));
  }

  private getTaps() {
    this.queueService.getTaps(this.id).subscribe(
      (taps => {
        this.taps = taps.sort((a: ITap, b: ITap) => {
          if (this.isNumber(a.number) && this.isNumber(b.number)) {
            if (Number(a.number) < Number(b.number)) {
              return -1;
            } else if (Number(a.number) > Number(b.number)) {
              return 1;
            } else {
              return 0;
            }
          } else if (a.number < b.number) {
            return -1;
          } else if (a.number > b.number) {
            return 1;
          } else {
            return 0;
          }
        });
        this.kegs = [];
        this.taps.forEach(
          t => {
            this.kegs[t.number] = t.beerKegsOnTap.reduce((bk1, bk2) =>
              bk1.installTime < bk2.installTime ? bk1 : bk2);
          });
      }),
      (error1 => {
        this.errorMessage = error1;
      })
    );
  }
}
