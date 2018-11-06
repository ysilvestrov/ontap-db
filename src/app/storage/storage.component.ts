import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {BeerKeg} from '../ontap.models';
import {StorageService} from '../storage.service';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.css']
})
export class StorageComponent implements OnInit {

  constructor(
    private storageService: StorageService,
    private http: HttpClient,
    private route: ActivatedRoute,
  ) {
    this.routeSubscription = route.parent.params.subscribe(
      params => {
        this.id = params['id'];
        this.getKegs();
      }
    );
  }

  private routeSubscription: Subscription;
  private id: string;
  public kegs: BeerKeg[];
  public errorMessage: any;

  private getKegs() {
    this.storageService.getKegs(this.id).subscribe(kegs => {
      this.kegs = kegs;
    });
  }

  ngOnInit() {
  }

}
