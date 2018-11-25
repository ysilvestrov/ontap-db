import {Component, OnInit, ViewChild} from '@angular/core';
import {QueueService} from '../queue.service';
import {Subscription} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {BeerKeg, BeerKegOnTap, ITap, Tap} from '../ontap.models';
import * as moment from 'moment';
import {ContextMenuComponent} from 'ngx-contextmenu';
import { DndDropEvent } from 'ngx-drag-drop';
import {TapService} from '../tap.service';
import {FormsModule} from '@angular/forms';
import {BeerCalculatorService} from '../beer-calculator.service';

@Component({
  selector: 'app-taps-queue',
  templateUrl: './taps-queue.component.html',
  styleUrls: ['./taps-queue.component.css']
})
export class TapsQueueComponent implements OnInit {
  constructor(
    private queueService: QueueService,
    private tapService: TapService,
    private calculator: BeerCalculatorService,
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
  public weighting: Tap;

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

  private calculateRemainingVolume(weight, emptyWeight, gravity, alcohol) {
    return (weight - emptyWeight) * this.calculator.getGravity(gravity, alcohol);
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
    this.weighting = tap;
  }

  public onWeighted(weight) {
    this.tapService.weightKeg(this.kegs[this.weighting.number].keg.id, weight).subscribe(res => {
      this.processKegWeight(res, this.weighting.number);
      this.weighting = null;
    }
    );
  }

  public onWeightingCancelled() {
      this.weighting = null;
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
        this.processKegWeight(keg.keg, tapNumber);
      }
    } else {
      this.kegs[tapNumber] = null;
      this.directQueue[tapNumber] = [];
      this.weights[tapNumber] = null;
    }
  }

  private processKegWeight(bkeg: BeerKeg, tapNumber) {
    const bbkeg = bkeg.keg;
    const beer = bkeg.beer;
    let weight = null;
    if (bkeg.weights.length > 0) {
      const weightRecord = bkeg.weights.reduce((w1, w2) => w1.date > w2.date ? w1 : w2);
      weight = weightRecord.weight;
    }

    const alcohol = beer.alcohol || 5;
    const gravity = beer.gravity || (alcohol * 2.2);
    this.weights[tapNumber] = weight === null ?
      bbkeg.volume :
      this.calculateRemainingVolume(
        weight,
        bbkeg.emptyWeight,
        gravity,
        alcohol
      );
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
