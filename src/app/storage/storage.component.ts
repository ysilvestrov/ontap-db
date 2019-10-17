import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {Beer, BeerKeg, Brewery, Keg, Tap} from '../ontap.models';
import {StorageService} from '../storage.service';
import {ContextMenuComponent, ContextMenuService} from 'ngx-contextmenu';
import {QueueService} from '../queue.service';
import {BeerService} from '../beer.service';
import {forEach} from '@angular/router/src/utils/collection';
import {BreweryService} from '../brewery.service';
import * as moment from 'moment';
import {NgbDate} from '@ng-bootstrap/ng-bootstrap';
import {NBeerKeg} from '../beer-keg-editor/beer-keg-editor.component';

@Component({
	selector: 'app-storage',
	templateUrl: './storage.component.html',
	styleUrls: ['./storage.component.css']
})
export class StorageComponent implements OnInit {

	constructor(
		private storageService: StorageService,
		private queueService: QueueService,
		private beerService: BeerService,
		private breweryService: BreweryService,
		private http: HttpClient,
		private route: ActivatedRoute,
		private contextMenuService: ContextMenuService,
	) {
		this.routeSubscription = route.parent.params.subscribe(
			params => {
				this.id = params['id'];
				this.getKegs();
			}
		);
		this.getBeers();
		this.getBreweries();
	}

	@ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;

	private routeSubscription: Subscription;
	private id: string;
	public kegs: BeerKeg[];
	public kegs$: BeerKeg[];
	public beers: Beer[];
	public breweries: Brewery[];
	public errorMessage: any;
	public addingMode = false;
	public currentBeerKeg: BeerKeg;
	public editingMode = false;
	public showAll = true;

	private getKegs() {
		this.storageService.getKegs(this.id).subscribe(kegs => {
			this.kegs = kegs;
			this.filterKegs();
		}, this.processError);
	}

	private getBeers() {
		this.beerService.getBeers().subscribe(beers => {
			this.beers = beers;
		}, this.processError);
	}

	private getBreweries() {
		this.breweryService.getBreweries().subscribe(breweries => {
			this.breweries = breweries;
		}, this.processError);
	}

	public addToQueue(keg: BeerKeg) {
		this.queueService.addToQueue(this.id, keg).subscribe(k => {
			this.kegs.forEach((current, index, kegs) => {if (current.id === k.id) {
				kegs[index].beerKegsOnTap = k.beerKegsOnTap;
			}});
		}, this.processError);
	}

	public removeFromStorage(keg: BeerKeg) {
		this.storageService.removeFromStorage(this.id, keg).subscribe(k => {
			this.kegs.forEach((current, index, kegs) => {if (current.id === k.id) {
				if (k.installationDate != null) {
					kegs = kegs.splice(index, 1);
				}
			}});
		}, this.processError);
	}

	ngOnInit() {
	}

	isInDirectQueue(keg: BeerKeg): boolean {
		if (!(keg && keg.beerKegsOnTap && keg.beerKegsOnTap.length)) {
			return false;
		} else {
			const bko = keg.beerKegsOnTap.reduce(((pv, cv) => pv.installTime == null
																												|| cv.installTime != null
																														&& pv.installTime > cv.installTime ? pv : cv));
			return bko.tap != null;
		}
	}


	isInQueue(keg: BeerKeg): boolean {
		return keg && keg.beerKegsOnTap && keg.beerKegsOnTap.length > 0;
	}

	startAddingKeg() {
		this.addingMode = true;
		this.editingMode = false;
		this.currentBeerKeg = new BeerKeg({keg: new Keg(), beer: new Beer()});
	}

	cancelUpdatingKeg() {
		this.addingMode = false;
		this.editingMode = false;
		this.currentBeerKeg = null;
	}

	startEditingKeg(item: BeerKeg) {
		this.addingMode = false;
		this.editingMode = true;
		this.currentBeerKeg = item;
	}

	updateKeg(nbeerkeg: NBeerKeg) {
		const keg = nbeerkeg.item;
		this.storageService.updateKeg(this.id, keg).subscribe(k => {
			const _kegs = [];
			this.kegs.forEach(_ => _.id === keg.id ? _kegs.push(k) : _kegs.push(_));
			this.kegs = _kegs;
		}, this.processError);
		this.editingMode = false;
	}

	addKeg(nbeerkeg: NBeerKeg) {
		const keg = nbeerkeg.item;
		const count = nbeerkeg.count;
		this.storageService.addKeg(this.id, keg, count).subscribe(k => {
			const _kegs = [];
			this.kegs.forEach(_ => _kegs.push(_));
			k.forEach(_ => _kegs.push(_));
			this.kegs = _kegs;
		}, this.processError);
		this.addingMode = false;
	}

	processError = err => this.errorMessage = err.error.error ?  err.error.error.message : err.error.toString();

	clearError = () => this.errorMessage = null;

	refresh() {
		this.getKegs();
		this.getBeers();
		this.getBreweries();
	}

	public onContextMenu($event: MouseEvent, item: any): void {
		this.contextMenuService.show.next({
			// Optional - if unspecified, all context menu components will open
			'contextMenu': this.basicMenu,
			'event': $event,
			'item': item,
		});
		$event.preventDefault();
		$event.stopPropagation();
	}

	public isBeerDefined(keg: BeerKeg) {
		return keg != null && keg.beer != null && keg.beer.id !== 'NA';
	}

	formatterBeer = (b: Beer) => {
		return b && b.brewery && b.id !== 'NA' ? `${b.brewery.name} - ${b.name}` : '? - ?';
	}

	convertDate(value: Date) {
		const date = moment(value);
		return new NgbDate(date.year(), date.month() + 1, date.date());
	}

	switchShowAll() {
		this.showAll = !this.showAll;
		this.filterKegs();
	}

	filterKegs() {
		this.kegs$ = this.showAll ? this.kegs : this.kegs.filter(bk => !this.isInQueue(bk));
	}
}
