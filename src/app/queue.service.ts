import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BeerKeg, BeerKegOnTap, Tap} from './ontap.models';

@Injectable({
	providedIn: 'root'
})
export class QueueService {

	private url = '/api';

	private httpOptions = {
		headers: new HttpHeaders({
			'Content-Type':  'application/json'
		})
	};

	constructor(private http: HttpClient) {}

	public getTaps(pubid: string) {
		const res = this.http .get<Tap[]>(`${this.url}/pubs/${pubid}/taps`, this.httpOptions);
		return res;
	}

	public getQueue(pubid: string) {
		const res = this.http .get<BeerKegOnTap[]>(`${this.url}/pubs/${pubid}/queue`, this.httpOptions);
		return res;
	}

	public addToQueue(pubid: string, keg: BeerKeg) {
		const res = this.http .post<BeerKeg>(`${this.url}/pubs/${pubid}/queue`, keg, this.httpOptions);
		return res;
	}

	reorderQueue(pubid: string, keg: BeerKegOnTap, priority: number) {
		const res = this.http .post<BeerKegOnTap[]>(`${this.url}/pubs/${pubid}/reorder-queue/${priority}`, keg, this.httpOptions);
		return res;
	}
}
