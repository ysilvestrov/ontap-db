import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Beer, Tap} from './ontap.models';

@Injectable({
  providedIn: 'root'
})
export class BeerService {
  private url = '/api';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  public getBeers() {
    const res = this.http .get<Beer[]>(`${this.url}/beers`, this.httpOptions);
    return res;
  }
}
