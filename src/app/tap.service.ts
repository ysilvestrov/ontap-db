import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BeerKeg, BeerKegOnTap} from './ontap.models';

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

  public sendBackToStorage(tapId: number) {
    const res = this.http .delete<BeerKegOnTap[]>(`${this.url}/taps/${tapId}/beer`, this.httpOptions);
    return res;
  }

  addToDirectQueue(tapId: number, keg: BeerKegOnTap) {
    const res = this.http .put<BeerKegOnTap[]>(`${this.url}/taps/${tapId}/beer`, keg, this.httpOptions);
    return res;
  }

  setFromDirectQueue(tapId: number) {
    const res = this.http .post<BeerKegOnTap[]>(`${this.url}/taps/${tapId}/beer`, this.httpOptions);
    return res;
  }
}
