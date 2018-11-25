import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Beer, BeerKeg, BeerKegWeight, Brewery, Keg} from '../ontap.models';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

@Component({
  selector: 'app-beer-keg-editor',
  templateUrl: './beer-keg-editor.component.html',
  styleUrls: ['./beer-keg-editor.component.css']
})
export class BeerKegEditorComponent implements OnInit {
  get beers(): Beer[] {
    return this._beers;
  }

  @Input()
  set beers(value: Beer[]) {
    this._beers = value;
  }

  get breweries(): Brewery[] {
    return this._breweries;
  }

  @Input()
  set breweries(value: Brewery[]) {
    this._breweries = value;
  }

  get beerKeg(): BeerKeg {
    return this._beerKeg;
  }

  @Input()
  set beerKeg(value: BeerKeg) {
    this._beerKeg = value;
    if (value) {
      if (value.beer) {
        this.beerName = this.formatterBeer(value.beer);
      }
      if (value.weights && value.weights.length > 0 ) {
        this.beerKegForm.controls['currentWeight'].setValue(value.weights.reduce(
          (a, b) => a.date > b.date ? a : b).weight);
      }
    } else {
      this._beerKeg = new BeerKeg({beer: new Beer(), keg: new Keg()} );
    }
  }

  constructor() { }

  beerKegForm = new FormGroup({
    currentWeight: new FormControl(''),
    emptyWeight: new FormControl(''),
    kegVolume: new FormControl(''),
    beerName: new FormControl(''),
    bestBeforeDate: new FormControl(''),
    packageDate: new FormControl(''),
    newBeerBrewery: new FormControl(''),
    newBeerName: new FormControl(''),
    newBeerDescription: new FormControl(''),
    newBeerAbv: new FormControl(''),
    newBeerIbu: new FormControl(''),
    newBeerOg: new FormControl(''),
  });

  public _beerKeg: BeerKeg;
  public beerName: string;
  public breweryName: string;
  public addingBeerMode = false;
  public addingBeer: Beer;
  private _beers: Beer[];
  private _breweries: Brewery[];
  @Output() added = new EventEmitter<BeerKeg>();
  @Output() canceled = new EventEmitter<null>();

  ngOnInit() {
  }

  onSubmit() {
    if (!this._beerKeg.weights) {
      this._beerKeg.weights = [];
    }
    if (this._beerKeg.weights.length === 0
      || this.beerKegForm.controls['currentWeight'].value !== this._beerKeg.weights.reduce(
        (a, b) => a.date > b.date ? a : b).weight) {
      this.beerKeg.weights.push(new BeerKegWeight({weight: this.beerKegForm.controls['currentWeight'].value}));
    }
    this.added.emit(this._beerKeg);
  }

  onCanceled() {
    this.canceled.emit();
  }

  onBeerChange($event: any) {
    this._beerKeg.beer = this._beers.filter(b => this.formatterBeer(b) === this.beerName)[0];
  }

  onBreweryChange($event: any) {
    this.addingBeer.brewery = this._breweries.filter(b => this.formatterBrewery(b) === this.breweryName)[0];
  }

  startAddingBeer() {
    this.addingBeerMode = true;
    this.addingBeer = new Beer();
  }

  cancelAddingBeer() {
    this.addingBeerMode = false;
  }

  addBeer() {
    this.beers.push(this.addingBeer);
    this.beerName = this.formatterBeer(this.addingBeer);
    this._beerKeg.beer = this.addingBeer;
    this.addingBeerMode = false;
  }

  searchBeer = (text$: Observable<string>) => {
    const _this_ = this;
    return text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : _this_.beers.map(b => `${b.brewery.name} - ${b.name}`)
          .filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    );
  }

  formatterBeer = (b: Beer) => {
    return b && b.brewery ? `${b.brewery.name} - ${b.name}` : '';
  }

  searchBrewery = (text$: Observable<string>) => {
    const breweries = this._breweries;
    return text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : breweries.map(b => `${b.name}`)
          .filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    );
  }

  formatterBrewery = (b: Brewery) => {
    return b ? `${b.name}` : '';
  }
}
