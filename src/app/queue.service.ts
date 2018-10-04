import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Tap} from './ontap.models';

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
    // res.subscribe(this.setSession, this.handleError);
    return res;
  }

}
