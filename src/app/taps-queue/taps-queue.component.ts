import {Component, OnInit} from '@angular/core';
import {QueueService} from '../queue.service';
import {Subscription} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {BeerKegOnTap, ITap, Tap} from '../ontap.models';
import * as moment from 'moment';

@Component({
  selector: 'app-taps-queue',
  templateUrl: './taps-queue.component.html',
  styleUrls: ['./taps-queue.component.css']
})
export class TapsQueueComponent implements OnInit {
  constructor(
    private queueService: QueueService,
    private http: HttpClient,
    private route: ActivatedRoute,
  ) {
    this.routeSubscription = route.parent.params.subscribe(
      params => {
        this.id = params['id'];
        this.getTaps();
      }
    );
  }
  private routeSubscription: Subscription;
  private id: string;
  public taps: Tap[];
  public errorMessage: any;
  public kegs: BeerKegOnTap[];
  public queue: BeerKegOnTap[];
  public straightQueue: BeerKegOnTap[][];
  public weights: number[];

  private static calculateRemainingVolume(weight, emptyWeight, gravity, alcohol) {
    return (weight - emptyWeight) / (gravity * 0.04 - 0.0000753 * alcohol);
  }

  private static isNumber(value: string | number): boolean {
    return !isNaN(Number(value.toString()));
  }
  private  static tapsCompare(a: ITap, b: ITap) {
    if (TapsQueueComponent.isNumber(a.number) && TapsQueueComponent.isNumber(b.number)) {
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
  }

  private static timeCompare(a, b) {
    if (!a.installTime && b.installTime) {
      return 1;
    }
    if (a.installTime && !b.installTime) {
      return -1;
    }
    if (a.installTime < b.installTime) {
      return -1;
    }
    if (a.installTime > b.installTime) {
      return 1;
    }
      return 0;
  }


  private static sortByPriority(a: BeerKegOnTap, b: BeerKegOnTap) {
    return a.priority > b.priority ? -1 : a.priority < b.priority ? 1 : 0;
  }

  ngOnInit() {
    // this.getTaps();
  }

  private getTaps() {
    this.queueService.getTaps(this.id).subscribe(
      taps => {
        this.taps = taps.sort(TapsQueueComponent.tapsCompare);
        this.kegs = [];
        this.weights = [];
        this.straightQueue = [];
        this.queue = [];
        this.taps.forEach(
          t => {
            const kegOnTaps = t.beerKegsOnTap
              .filter(bk =>
                bk.deinstallTime == null
                || bk.installTime == null
                || moment(bk.deinstallTime).isSameOrAfter(moment())
              );
            if (kegOnTaps.length > 0) {
              kegOnTaps.sort(TapsQueueComponent.timeCompare);

              this.kegs[t.number] = kegOnTaps[0];
              this.straightQueue[t.number] = kegOnTaps.slice(1);

              const keg = this.kegs[t.number];
              if (keg && keg.keg && keg.keg.keg) {
                const bkeg = keg.keg;
                const bbkeg = keg.keg.keg;
                const beer = bkeg.beer;
                this.weights[t.number] = bkeg.weights.length <= 0 ?
                  bbkeg.volume :
                  TapsQueueComponent.calculateRemainingVolume(
                    bkeg.weights[bkeg.weights.length - 1].weight,
                    bbkeg.emptyWeight,
                    beer.gravity || 10,
                    beer.alcohol || 5
                  );
              }
            }
          });
        this.queueService.getQueue(this.id).subscribe(
          queue => {
            queue
              .sort(TapsQueueComponent.sortByPriority)
              .forEach( (value, number) => {
                if (this.taps && this.taps[number]) {
                  this.queue[this.taps[number].number] = value;
                }
            });
          });
      },
      (error1 => {
        this.errorMessage = error1.message;
      })
    );
  }

}
