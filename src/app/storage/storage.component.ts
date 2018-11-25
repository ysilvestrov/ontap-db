import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {Beer, BeerKeg, Brewery, Keg} from '../ontap.models';
import {StorageService} from '../storage.service';
import {ContextMenuComponent} from 'ngx-contextmenu';
import {QueueService} from '../queue.service';
import {BeerService} from '../beer.service';
import {forEach} from '@angular/router/src/utils/collection';
import {BreweryService} from '../brewery.service';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.css']
})
export class StorageComponent implements OnInit {

  constructor(
    private storageService: StorageService,
    private queueService: QueueService,
    private beerService: BeerService,
    private breweryService: BreweryService,
    private http: HttpClient,
    private route: ActivatedRoute,
  ) {
    this.routeSubscription = route.parent.params.subscribe(
      params => {
        this.id = params['id'];
        this.getKegs();
      }
    );
    this.getBeers();
    this.getBreweries();
  }

  @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;

  private routeSubscription: Subscription;
  private id: string;
  public kegs: BeerKeg[];
  public beers: Beer[];
  public breweries: Brewery[];
  public errorMessage: any;
  public addingMode = false;
  public currentBeerKeg: BeerKeg;

  private getKegs() {
    this.storageService.getKegs(this.id).subscribe(kegs => {
      this.kegs = kegs;
    }, this.processError);
  }

  private getBeers() {
    this.beerService.getBeers().subscribe(beers => {
      this.beers = beers;
    }, this.processError);
  }

  private getBreweries() {
    this.breweryService.getBreweries().subscribe(breweries => {
      this.breweries = breweries;
    }, this.processError);
  }

  public addToQueue(keg: BeerKeg) {
    this.queueService.addToQueue(this.id, keg).subscribe(k => {
      this.kegs.forEach((current, index, kegs) => {if (current.id === k.id) {
        kegs[index].beerKegsOnTap = k.beerKegsOnTap;
      }});
    }, this.processError);
  }

  public removeFromStorage(keg: BeerKeg) {
    this.storageService.removeFromStorage(this.id, keg).subscribe(k => {
      this.kegs.forEach((current, index, kegs) => {if (current.id === k.id) {
        if (k.installationDate != null) {
          kegs = kegs.splice(index, 1);
        }
      }});
    }, this.processError);
  }

  ngOnInit() {
  }

  showAddingKeg() {
    this.addingMode = true;
    this.currentBeerKeg = new BeerKeg({keg: new Keg(), beer: new Beer()});
  }

  public cancelAddingKeg() {
    this.addingMode = false;
    this.currentBeerKeg = null;
  }

  addKeg(keg) {
    console.log(JSON.stringify(keg));
    this.storageService.addKeg(this.id, keg).subscribe(k => {
      const _kegs = [];
      this.kegs.forEach(_ => _kegs.push(_));
      _kegs.push(keg);
      this.kegs = _kegs;
    }, this.processError);
    this.addingMode = false;
  }

  processError = err => this.errorMessage = err.error.error ?  err.error.error.message : err.error.toString();

  clearError = () => this.errorMessage = null;
}
