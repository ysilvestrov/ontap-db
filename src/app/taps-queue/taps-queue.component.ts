import {Component, OnInit, ViewChild} from '@angular/core';
import {QueueService} from '../queue.service';
import {Subscription} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {BeerKegOnTap, ITap, Tap} from '../ontap.models';
import * as moment from 'moment';
import {ContextMenuComponent} from 'ngx-contextmenu';
import { DndDropEvent } from 'ngx-drag-drop';
import {TapService} from '../tap.service';

@Component({
  selector: 'app-taps-queue',
  templateUrl: './taps-queue.component.html',
  styleUrls: ['./taps-queue.component.css']
})
export class TapsQueueComponent implements OnInit {
  constructor(
    private queueService: QueueService,
    private tapService: TapService,
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

  @ViewChild('tapMenu') public tapMenu: ContextMenuComponent;

  private routeSubscription: Subscription;
  private id: string;
  public taps: Tap[];
  public errorMessage: any;
  public kegs: BeerKegOnTap[];
  public queue: BeerKegOnTap[];
  public directQueue: BeerKegOnTap[][];
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
        this.directQueue = [];
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
              this.processBeerKegsOnTap(kegOnTaps, t.number);
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

  public addToDirectQueue(keg: BeerKegOnTap, tap: Tap) {
    this.tapService.addToDirectQueue(tap.id, keg).subscribe(res => this.processBeerKegsOnTap(res, tap.number));
  }

  public showWeights(tap: Tap) {

  }

  public removeBeer(tap: Tap) {
    this.tapService.sendBackToStorage(tap.id).subscribe(res => this.processBeerKegsOnTap(res, tap.number));
  }

  public setFromDirectQueue(tap: Tap) {
    this.tapService.setFromDirectQueue(tap.id).subscribe(res => this.processBeerKegsOnTap(res, tap.number));
  }

  public processBeerKegsOnTap(kegOnTaps: BeerKegOnTap[], tapNumber) {
    if (kegOnTaps.length > 0) {
      kegOnTaps.sort(TapsQueueComponent.timeCompare);

      const keg = kegOnTaps[0];
      if (keg.installTime != null) {
        this.directQueue[tapNumber] = kegOnTaps.slice(1);
        this.kegs[tapNumber] = keg;
      } else {
        this.directQueue[tapNumber] = kegOnTaps;
      }

      if (keg && keg.keg && keg.keg.keg && keg.installTime != null) {
        const bkeg = keg.keg;
        const bbkeg = keg.keg.keg;
        const beer = bkeg.beer;
        this.weights[tapNumber] = bkeg.weights.length <= 0 ?
          bbkeg.volume :
          TapsQueueComponent.calculateRemainingVolume(
            bkeg.weights[bkeg.weights.length - 1].weight,
            bbkeg.emptyWeight,
            beer.gravity || 10,
            beer.alcohol || 5
          );
      }
    } else {
      this.kegs[tapNumber] = null;
      this.directQueue[tapNumber] = [];
    }
  }

  public hasKegOnTap(tap: Tap) {
    return tap != null
      && tap.beerKegsOnTap.filter(bk =>
        bk.installTime != null && (bk.deinstallTime == null || moment(bk.deinstallTime).isSameOrAfter(moment()))
      ).length > 0;
  }

  public hasKegsInQueue(tap: Tap) {
    return tap != null
      &&
      (
      tap.beerKegsOnTap.filter(bk =>
        bk.installTime == null
      ).length > 0
      ||
      tap.beerKegsOnTap.filter(bk =>
        bk.deinstallTime == null || moment(bk.deinstallTime).isSameOrAfter(moment())
      ).length > 1
      );
  }

  public hasKegsOnlyInQueue(tap: Tap) {
    return tap != null
      &&
      (
        tap.beerKegsOnTap.filter(bk =>
        bk.installTime != null && (bk.deinstallTime == null || moment(bk.deinstallTime).isSameOrAfter(moment()))
      ).length === 0
      )
      &&
      (
        tap.beerKegsOnTap.filter(bk =>
          bk.installTime == null
        ).length > 0
        ||
        tap.beerKegsOnTap.filter(bk =>
          bk.deinstallTime == null || moment(bk.deinstallTime).isSameOrAfter(moment())
        ).length > 0
      );
  }
}
