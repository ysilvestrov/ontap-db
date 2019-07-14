import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Beer, BeerKeg, BeerKegWeight, Brewery, Keg} from '../ontap.models';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {NgbDate, NgbDateAdapter, NgbDateNativeAdapter, NgbDateStruct, NgbTypeaheadSelectItemEvent} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

export interface Countable<T> {
	count: number;
	item: T;
}

export class NBeerKeg implements Countable<BeerKeg> {
	count: number;
	item: BeerKeg;

	constructor(item: BeerKeg, count: number) {
		this.item = item;
		this.count = count;
	}
}

@Component({
	selector: 'app-beer-keg-editor',
	templateUrl: './beer-keg-editor.component.html',
	styleUrls: ['./beer-keg-editor.component.css'],
})
export class BeerKegEditorComponent implements OnInit {

	// region model
	_currentWeight: number;
	_packageDate: NgbDateStruct;
	_bestBeforeDate: NgbDateStruct;
	// endregion

	get beers(): Beer[] {
		return this._beers;
	}

	@Input()
	set beers(value: Beer[]) {
		this._beers = value;
	}

	get mode(): string {
		return this._addingMode ? 'add' : 'edit';
	}

	@Input()
	set mode(value: string) {
		this._addingMode = value.toLowerCase().startsWith('add');
	}


	get breweries(): Brewery[] {
		return this._breweries;
	}

	@Input()
	set breweries(value: Brewery[]) {
		this._breweries = value;
	}

	get beerKeg(): BeerKeg {
		return this._beerKeg;
	}

	@Input()
	set beerKeg(value: BeerKeg) {
		this._beerKeg = value;
		if (value) {
			if (value.beer.id === 'NA') {
				value.beer = null;
			}
			if (value.beer) {
				this._beerName = this.formatterBeer(value.beer);
				this._isKnownBeer = true;
			}
			if (value.weights && value.weights.length > 0 ) {
				this._currentWeight = value.weights.reduce((a, b) => a.date > b.date ? a : b).weight;
			}
			if (value.bestBeforeDate) {
				const date = moment(value.bestBeforeDate);
				this._bestBeforeDate = {year: date.year(), month: date.month() + 1, day: date.date()};
			}
			if (value.packageDate) {
				const date = moment(value.packageDate);
				this._packageDate = {year: date.year(), month: date.month() + 1, day: date.date()};
			}
		} else {
			this._beerKeg = new BeerKeg({beer: new Beer(), keg: new Keg()} );
		}
	}

	constructor() {
		this._kegsToAdd = 1;
	}


	public _addingBeerMode = false;
	public _addingBeer: Beer;
	private _beerKeg: BeerKeg;
	private _beerName: string;
	private _breweryName: string;
	private _beers: Beer[];
	private _breweries: Brewery[];
	private _addingMode: boolean;
	private _kegsToAdd = 1;
	private _isKnownBeer = false;

	@Output() updated = new EventEmitter<NBeerKeg>();
	@Output() canceled = new EventEmitter<null>();

	ngOnInit() {
	}

	onSubmit() {
		if (!this._beerKeg.weights) {
			this._beerKeg.weights = [];
		}
		if (this._beerKeg.weights.length === 0
			|| this._currentWeight !== this._beerKeg.weights.reduce((a, b) => a.date > b.date ? a : b).weight) {
			this.beerKeg.weights.push(new BeerKegWeight({weight: this._currentWeight}));
		}
		if (this._packageDate) {
			this._beerKeg.packageDate = new Date(
				this._packageDate.year, this._packageDate.month - 1, this._packageDate.day);
		}
		if (this._bestBeforeDate) {
			this._beerKeg.bestBeforeDate = new Date(
				this._bestBeforeDate.year, this._bestBeforeDate.month - 1, this._bestBeforeDate.day);
		}
		if (!this._isKnownBeer) {
			this._beerKeg.beer = null;
		}
		this.updated.emit(new NBeerKeg(this._beerKeg, this._kegsToAdd));
	}

	onCanceled() {
		this.canceled.emit();
	}

	onBeerChange($event: any) {
		this._beerKeg.beer = this._beers.filter(b => this.formatterBeer(b) === this._beerName)[0];
	}

	selectBeer($event: NgbTypeaheadSelectItemEvent) {
		this._beerKeg.beer = this._beers.filter(b => this.formatterBeer(b) === $event.item)[0];
	}

	onBreweryChange($event: any) {
		this._addingBeer.brewery = this._breweries.filter(b => this.formatterBrewery(b) === this._breweryName)[0];
	}

	selectBrewery($event: NgbTypeaheadSelectItemEvent) {
		this._addingBeer.brewery = this._breweries.filter(b => this.formatterBrewery(b) === $event.item)[0];
	}

	startAddingBeer() {
		this._addingBeerMode = true;
		this._addingBeer = new Beer();
	}

	cancelAddingBeer() {
		this._addingBeerMode = false;
	}

	addBeer() {
		this.beers.push(this._addingBeer);
		this._beerName = this.formatterBeer(this._addingBeer);
		this._beerKeg.beer = this._addingBeer;
		this._addingBeerMode = false;
	}

	searchBeer = (text$: Observable<string>) => {
		const _this_ = this;
		return text$.pipe(
			debounceTime(200),
			distinctUntilChanged(),
			map(term => term === '' ? []
				: _this_.beers.map(b => `${b.brewery.name} - ${b.name}`)
					.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
		);
	}

	formatterBeer = (b: Beer) => {
		return b && b.brewery && b.id !== 'NA' ? `${b.brewery.name} - ${b.name}` : '';
	}

	searchBrewery = (text$: Observable<string>) => {
		const breweries = this._breweries;
		return text$.pipe(
			debounceTime(200),
			distinctUntilChanged(),
			map(term => term === '' ? []
				: breweries.map(b => `${b.name}`)
					.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
		);
	}

	formatterBrewery = (b: Brewery) => {
		return b ? `${b.name}` : '';
	}
}
