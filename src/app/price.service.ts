import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BeerKegOnTap, BeerPrice, IBeerPrice} from './ontap.models';


@Injectable({
	providedIn: 'root'
})
export class PriceService {

	private url = '/api';

	private httpOptions = {
		headers: new HttpHeaders({
			'Content-Type':  'application/json'
		})
	};
	constructor(private http: HttpClient) {}

	getPrices(pubId: string) {
		const res = this.http .get<BeerPrice[]>(`${this.url}/pubs/${pubId}/prices`, this.httpOptions);
		return res;
	}

	priceBeer(pubId: string, price: IBeerPrice) {
		const res = this.http .put<BeerPrice>(`${this.url}/pubs/${pubId}/prices/${price.beer.id}`, price, this.httpOptions);
		return res;
	}
}
