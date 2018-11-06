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

}
