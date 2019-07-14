import {Component, OnInit, ViewChild} from '@angular/core';
import {QueueService} from '../queue.service';
import {Subscription} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {BeerKeg, BeerKegOnTap, ITap, Tap} from '../ontap.models';
import * as moment from 'moment';
import {ContextMenuComponent, ContextMenuService} from 'ngx-contextmenu';
// import { DndDropEvent } from 'ngx-drag-drop';
import {TapService} from '../tap.service';
// import {FormsModule} from '@angular/forms';
import {BeerCalculatorService} from '../beer-calculator.service';
import {StorageService} from '../storage.service';

@Component({
	selector: 'app-taps-queue',
	templateUrl: './taps-queue.component.html',
	styleUrls: ['./taps-queue.component.css']
})
export class TapsQueueComponent implements OnInit {
	constructor(
		private storageService: StorageService,
		private queueService: QueueService,
		private tapService: TapService,
		private calculator: BeerCalculatorService,
		private http: HttpClient,
		private route: ActivatedRoute,
		private contextMenuService: ContextMenuService,
	) {
		this.routeSubscription = route.parent.params.subscribe(
			params => {
				this.id = params['id'];
				this.getTaps();
				this.getKegs();
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
	public totalInQueue: number;
	public totalInDirectQueue: number;
	public totalOnTap: number;
	public totalInStorage: number;
	public unknownInStorage: number;

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
				this.totalInQueue = 0;
				this.totalInDirectQueue = 0;
				this.totalOnTap = 0;
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
						this.processQueue(queue);
					});
			},
			this.processError
		);
	}

	private getKegs() {
		this.storageService.getKegs(this.id).subscribe(kegs => {
			this.totalInStorage = kegs.length;
			this.unknownInStorage = kegs.filter((keg: BeerKeg) => keg.beer == null || keg.beer.id === 'NA').length;
		}, this.processError);
	}

	public processBeerKegsOnTap(kegOnTaps: BeerKegOnTap[], tapNumber) {
		if (kegOnTaps.length > 0) {
			kegOnTaps.sort(TapsQueueComponent.timeCompare);

			const keg = kegOnTaps[0];

			if (keg.installTime != null) {
				this.directQueue[tapNumber] = kegOnTaps.slice(1);
				this.totalInDirectQueue += kegOnTaps.length - 1;
				this.kegs[tapNumber] = keg;
				this.totalOnTap++;
			} else {
				this.directQueue[tapNumber] = kegOnTaps;
				this.totalInDirectQueue++;
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

	public processQueue(kegsInQueue: BeerKegOnTap[]) {
		kegsInQueue.sort(TapsQueueComponent.sortByPriority)
			.forEach((value, number) => {
				if (this.taps && this.taps[number]) {
					this.queue[this.taps[number].number] = value;
				}
			});
		this.totalInQueue = kegsInQueue.length;
	}


	public addToDirectQueue(keg: BeerKegOnTap, tap: Tap) {
		this.tapService.addToDirectQueue(tap.id, keg).subscribe(res =>  {
			this.processBeerKegsOnTap(res, tap.number);
			this.softRefresh();
		});
	}

	public reorderQueue(keg: BeerKegOnTap, tap: Tap) {
		let priority = 0;
		if (this.queue[tap.number]) {
			priority = this.queue[tap.number].priority;
		} else {
			priority = this.queue.reduce((max, k) => k.priority > max ? k.priority : max, this.queue[0].priority);
		}

		this.queueService.reorderQueue(this.id, keg, priority).subscribe(res =>  {
			this.processQueue(res);
			this.softRefresh();
		});
	}

	public showWeights(tap: Tap) {
		this.weighting = tap;
	}

	public onWeighted(weight) {
		this.tapService.weightKeg(this.kegs[this.weighting.number].keg.id, weight).subscribe(res => {
			this.processKegWeight(res, this.weighting.number);
			this.softRefresh();
			this.weighting = null;
		}
		);
	}

	public onWeightingCancelled() {
			this.weighting = null;
	}

	public removeBeer(tap: Tap) {
		this.tapService.sendBackToStorage(tap.id).subscribe(res =>  {
			this.processBeerKegsOnTap(res, tap.number);
			this.softRefresh();
		});
	}

	public setFromDirectQueue(tap: Tap) {
		this.tapService.setFromDirectQueue(tap.id).subscribe(res => {
			this.processBeerKegsOnTap(res, tap.number);
			this.softRefresh();
		});
	}

	public removeFromDirectQueue(tap: Tap) {
		const keg = this.directQueue[tap.number][0];
		this.tapService.removeFromDirectQueue(tap.id, keg).subscribe(res => {
			this.processBeerKegsOnTap(res, tap.number);
			this.softRefresh();
		});
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

	public refresh() {
		this.getTaps();
	}

	public softRefresh() {
		const _taps: Tap[] = [];
		this.taps.forEach(t => _taps.push(t));
		this.taps = _taps;
	}

	public getBeerNameOnTap(tapNumber) {
		if (this.kegs[tapNumber]) {
			const keg = this.kegs[tapNumber].keg;
			if (keg && keg.beer && keg.beer.brewery) {
				return `"${keg.beer.brewery.name} - ${keg.beer.name}"`;
			}
		}
		return '';
	}

	public getBeerNameOnDirectQueueOnTap(tapNumber) {
		if (this.directQueue[tapNumber]) {
			const bkeg = this.directQueue[tapNumber][0];
			if (bkeg) {
				const keg = bkeg.keg;
				if (keg && keg.beer && keg.beer.brewery) {
					return `"${keg.beer.brewery.name} - ${keg.beer.name}"`;
				}
			}
		}
		return '';
	}

	public onContextMenu($event: MouseEvent, item: any): void {
		this.contextMenuService.show.next({
			// Optional - if unspecified, all context menu components will open
			'contextMenu': this.tapMenu,
			'event': $event,
			'item': item,
		});
		$event.preventDefault();
		$event.stopPropagation();
	}

	processError = err => this.errorMessage = err.error.error ?  err.error.error.message : err.error.toString();

	clearError = () => this.errorMessage = null;
}
