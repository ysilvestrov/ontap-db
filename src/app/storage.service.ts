import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BeerKeg, Tap} from './ontap.models';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private url = '/api';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  public getKegs(pubid: string) {
    const res = this.http .get<BeerKeg[]>(`${this.url}/pubs/${pubid}/storage`, this.httpOptions);
    return res;
  }

  public removeFromStorage(pubid: string, keg: BeerKeg) {
    const res = this.http .delete<BeerKeg>(`${this.url}/pubs/${pubid}/storage/${keg.id}`, this.httpOptions);
    return res;
  }

  public addKeg(pubid: string, keg: BeerKeg) {
    const res = this.http .post<BeerKeg>(`${this.url}/pubs/c${pubid}/storage/`, keg, this.httpOptions);
    return res;
  }
}
