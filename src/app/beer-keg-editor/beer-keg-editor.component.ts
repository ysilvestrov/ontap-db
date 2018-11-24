import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Beer, BeerKeg, BeerKegWeight, Keg} from '../ontap.models';
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

  get beerKeg(): BeerKeg {
    return this._beerKeg;
  }

  @Input()
  set beerKeg(value: BeerKeg) {
    this._beerKeg = value;
    if (value) {
      if (value.beer) {
        this.beerName = this.formatter(value.beer);
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
  });

  public _beerKeg: BeerKeg;
  public beerName: string;
  private _beers: Beer[];
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
    this._beerKeg.beer = this._beers.filter(b => this.formatter(b) === this.beerName)[0];
  }

  search = (text$: Observable<string>) => {
    const beers = this._beers;
    return text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : beers.map(b => `${b.brewery.name} - ${b.name}`)
          .filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    );
  }

  formatter = (b: any) => {
    return b && b.brewery ? `${b.brewery.name} - ${b.name}` : '';
  }
}
