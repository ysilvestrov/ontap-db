import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BeerKeg, BeerKegOnTap, Tap} from './ontap.models';

@Injectable({
	providedIn: 'root'
})
export class TapService {
	private url = '/api';

	private httpOptions = {
		headers: new HttpHeaders({
			'Content-Type':  'application/json'
		})
	};
	constructor(private http: HttpClient) {}

	update(tapId: number, tap: Tap) {
		return this.http.put<Tap>(`${this.url}/taps/${tapId}`, tap, this.httpOptions);
	}

	sendBackToStorage(tapId: number) {
		return this.http.delete<BeerKegOnTap[]>(`${this.url}/taps/${tapId}/beer`, this.httpOptions);
	}

	addToDirectQueue(tapId: number, keg: BeerKegOnTap) {
		return this.http.put<BeerKegOnTap[]>(`${this.url}/taps/${tapId}/beer`, keg, this.httpOptions);
	}

	setFromDirectQueue(tapId: number) {
		return this.http.post<BeerKegOnTap[]>(`${this.url}/taps/${tapId}/beer`, this.httpOptions);
	}

	weightKeg(kegId: number, weight: number) {
		return this.http.put<BeerKeg>(`${this.url}/beerkegs/${kegId}/weight`, {Weight: weight}, this.httpOptions);
	}

	removeFromDirectQueue(tapId: number, keg: BeerKegOnTap) {
		return this.http.delete<BeerKegOnTap[]>(`${this.url}/taps/${tapId}/beer/${keg.id}`, this.httpOptions);
	}

	repeatBeer(tapId: number) {
		return this.http.post<BeerKegOnTap[]>(`${this.url}/taps/${tapId}/repeat`, this.httpOptions);
	}

	removeAllFromDirectQueue(tapId: number) {
		return this.http.delete<BeerKegOnTap[]>(`${this.url}/taps/${tapId}/queue`, this.httpOptions);
	}
}
