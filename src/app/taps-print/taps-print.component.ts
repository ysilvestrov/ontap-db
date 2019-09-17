import { Component, OnInit } from '@angular/core';
import {QueueService} from '../queue.service';
import {TapService} from '../tap.service';
import {BeerCalculatorService} from '../beer-calculator.service';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {ContextMenuService} from 'ngx-contextmenu';
import {Subscription} from 'rxjs';
import {BeerKegOnTap, BeerPrice, ITap, Tap} from '../ontap.models';
import * as moment from 'moment';
import {PriceService} from '../price.service';

@Component({
	selector: 'app-taps-print',
	templateUrl: './taps-print.component.html',
	styleUrls: ['./taps-print.component.css']
})
export class TapsPrintComponent implements OnInit {

	constructor(
		private queueService: QueueService,
		private tapService: TapService,
		private priceService: PriceService,
		private http: HttpClient,
		private route: ActivatedRoute,
	) {
		this.routeSubscription = route.parent.params.subscribe(
			params => {
				this.id = params['id'];
				this.getTaps();
				this.getPrices();
			}
		);
	}

	private routeSubscription: Subscription;
	private id: string;
	public taps: Tap[];
	public errorMessage: any;
	public kegs: BeerKegOnTap[];
	public prices: BeerPrice[];

	private static isNumber(value: string | number): boolean {
		return !isNaN(Number(value.toString()));
	}
	private  static tapsCompare(a: ITap, b: ITap) {
		if (TapsPrintComponent.isNumber(a.number) && TapsPrintComponent.isNumber(b.number)) {
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

	ngOnInit() {
	}

	processError = err => this.errorMessage = err.error.error ?  err.error.error.message : err.error.toString();

	private getTaps() {
		this.queueService.getTaps(this.id).subscribe(
			taps => {
				this.taps = taps.sort(TapsPrintComponent.tapsCompare);
				this.kegs = [];
				// this.weights = [];
				// this.directQueue = [];
				// this.queue = [];
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
/*				this.queueService.getQueue(this.id).subscribe(
					queue => {
						queue
							.sort(TapsQueueComponent.sortByPriority)
							.forEach( (value, number) => {
								if (this.taps && this.taps[number]) {
									this.queue[this.taps[number].number] = value;
								}
							});
					});*/
			},
			this.processError
		);
	}

	private getPrices() {
		this.priceService.getPrices(this.id).subscribe(prices => {
			this.prices = [];
			prices.forEach(price => this.prices[price.beer.id] = price);
		}, this.processError);
	}

	public processBeerKegsOnTap(kegOnTaps: BeerKegOnTap[], tapNumber) {
		if (kegOnTaps.length > 0) {
			kegOnTaps.sort(TapsPrintComponent.timeCompare);

			const keg = kegOnTaps[0];
			if (keg.installTime != null) {
				// this.directQueue[tapNumber] = kegOnTaps.slice(1);
				this.kegs[tapNumber] = keg;
			} else {
				// this.directQueue[tapNumber] = kegOnTaps;
			}

/*			if (keg && keg.keg && keg.keg.keg && keg.installTime != null) {
				this.processKegWeight(keg.keg, tapNumber);
			}*/
		} else {
			this.kegs[tapNumber] = null;
			// this.directQueue[tapNumber] = [];
			// this.weights[tapNumber] = null;
		}
	}
}
