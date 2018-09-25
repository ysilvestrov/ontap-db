import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {User} from './user';
import {Observable, throwError} from 'rxjs';
import {catchError, shareReplay, tap} from 'rxjs/internal/operators';
import * as moment from 'moment';

export function tokenGetter() {
  return localStorage.getItem('auth_token');
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url = 'http://localhost:52416/api';
  constructor(public jwtHelper: JwtHelperService, private http: HttpClient) {}

  public isTokenExpired() {
    return (tokenGetter() == null) || this.jwtHelper.isTokenExpired();
  }


  public login(email: string, password: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    let res = this.http
      .post<User>(`${this.url}/jwt`, {name: email, password}, httpOptions);
    res.subscribe(this.setSession, this.handleError);
    return res;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }

  private setSession(authResult) {
    console.log('Setting session');
    const expiresAt = moment().add(authResult.expiresIn, 'second');

    localStorage.setItem('auth_token', authResult.accessToken);
    localStorage.setItem('auth_expires_at', JSON.stringify(expiresAt.valueOf()) );
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_expires_at');
  }

  public isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  getExpiration() {
    const expiration = localStorage.getItem('auth_expires_at');
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }

  public getToken() {
    return this.jwtHelper.decodeToken();
  }

  public getUserName() {
    return this.getToken()['sub'];
  }

  public getUserTypes() {
    return this.getToken()['UserType'];
  }

  public getUserPubs() {
    return this.getToken()['PubAdmin'];
  }
}
