import { Component, OnInit } from '@angular/core';
import {QueueService} from '../queue.service';
import {Subscription} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {Beer, BeerKegOnTap, ITap, Tap} from '../ontap.models';
import * as moment from 'moment';

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
  public weights: number[];

  constructor(
    private queueService: QueueService,
    private http: HttpClient,
    private route: ActivatedRoute,
  ) {
    this.routeSubscription = route.parent.params.subscribe(
      params => {this.id = params['id']; this.getTaps(); }
      );
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
        this.weights = [];
        this.taps.forEach(
          t => {
            const kegOnTaps = t.beerKegsOnTap
              .filter(bk =>
                bk.deinstallTime == null || moment(bk.deinstallTime).isSameOrAfter(moment())
              );
            if (kegOnTaps.length > 0) {
              this.kegs[t.number] = kegOnTaps.length > 1 ?
                kegOnTaps.reduce((bk1, bk2) =>
                  bk1.installTime < bk2.installTime ? bk2 : bk1) : kegOnTaps[0];

              const keg = this.kegs[t.number];
              if (keg && keg.keg && keg.keg.keg) {
                const bkeg = keg.keg;
                const bbkeg = keg.keg.keg;
                const beer = bkeg.beer;
                this.weights[t.number] = bkeg.weights.length <= 0 ?
                  bbkeg.volume :
                  (bkeg.weights[bkeg.weights.length - 1].weight - bbkeg.emptyWeight)
                  / (
                  (beer.gravity || 10) * 0.04
                  - 0.0000753 * (beer.alcohol || 5));
              }
            }
          });
      }),
      (error1 => {
        this.errorMessage = error1.message;
      })
    );
  }
}
