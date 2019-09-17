import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BeerKegWeight, BeerPrice, IBeerPrice} from '../ontap.models';
import {NBeerKeg} from '../beer-keg-editor/beer-keg-editor.component';

@Component({
	selector: 'app-beer-price-editor',
	templateUrl: './beer-price-editor.component.html',
	styleUrls: ['./beer-price-editor.component.css']
})
export class BeerPriceEditorComponent implements OnInit {

	// region model
	private _beerPrice = new BeerPrice();
	private _price = 0;
	private _volume = 0;
	// endregion

	get price(): IBeerPrice {
		this._beerPrice.price = this._price;
		this._beerPrice.volume = this._volume;
		return this._beerPrice;
	}

	@Input()
	set price(_price: IBeerPrice) {
		if (_price) {
			this._beerPrice = _price;
			this._price = _price.price;
			this._volume = _price.volume;
		}
	}

	@Output() updated = new EventEmitter<IBeerPrice>();
	@Output() canceled = new EventEmitter<null>();

	constructor() {
	}

	ngOnInit() {

	}

	onSubmit() {
		this.updated.emit(this.price);
	}

	onCanceled() {
		this.canceled.emit();
	}

}
