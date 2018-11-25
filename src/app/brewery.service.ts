import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Beer, Brewery} from './ontap.models';

@Injectable({
  providedIn: 'root'
})
export class BreweryService {
  private url = '/api';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  public getBreweries() {
    const res = this.http .get<Brewery[]>(`${this.url}/breweries`, this.httpOptions);
    return res;
  }
}
