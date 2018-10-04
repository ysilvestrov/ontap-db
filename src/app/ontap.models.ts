export interface IElement {
  id: any;
}
export interface IBeer {
  id: string;
  name: string;
  description: string;
  type: string;
  brewery: IBrewery;
  alcohol: number;
  gravity: number;
  ibu: number;
  bjcpStyle: string;
  image: string;
}
export interface IBrewery {
  id: string;
  name: string;
  address: string;
  country: ICountry;
  image: string;
}

export interface IPub {
  id: string;
  name: string;
  address: string;
  city: ICity;
  image: string;
  taplistHeaderImage: string;
  taplistFooterImage: string;
  facebookUrl: string;
  vkontakteUrl: string;
  websiteUrl: string;
  bookingUrl: string;
  parserOptions: string;
  tapNumber: number;
}

export interface IPubServe extends IPub {
  serves: IServe[];
  lastUpdated: Date;
}

export interface ICity {
  id: string;
  name: string;
}
export interface ICountry {
  id: string;
  name: string;
}

export interface IPrice {
  price: number;
  volume: number;
}

export interface IServe {
  tap: string;
  beer: IBeer;
  prices: IPrice[];
}
export interface IUser {
  id: string;
  name: string;
  password: string;
  email: string;
  isAdmin: boolean;
  canAdminPub: boolean;
  canAdminBrewery: boolean;
  pubs: IPub[];
  breweries: IBrewery[];
}
export class Pub implements IPub {
  id: string;
  name: string;
  address: string;
  image: string;
  taplistHeaderImage: string;
  taplistFooterImage: string;
  city: ICity;
  facebookUrl: string;
  vkontakteUrl: string;
  websiteUrl: string;
  bookingUrl: string;
  parserOptions: string;
  tapNumber: number;

  public constructor(init?: Partial<IPub>) {
    Object.assign(this, init);
  }
}

export class PubServe implements IPubServe {
  id: string;
  name: string;
  address: string;
  image: string;
  taplistHeaderImage: string;
  taplistFooterImage: string;
  city: ICity;
  serves: IServe[];
  lastUpdated: Date;
  facebookUrl: string;
  vkontakteUrl: string;
  websiteUrl: string;
  bookingUrl: string;
  parserOptions: string;
  tapNumber: number;

  public constructor(init?: Partial<IPubServe>) {
    Object.assign(this, init);
  }
}
export class City implements ICity {
  id: string;
  name: string;

  public constructor(init?: Partial<ICity>) {
    Object.assign(this, init);
  }

}
export class Beer implements IBeer {
  id: string;
  name: string;
  description: string;
  type: string;
  brewery: IBrewery;
  alcohol: number;
  gravity: number;
  ibu: number;
  bjcpStyle: string;
  image: string;

  public constructor(init?: Partial<IBeer>) {
    Object.assign(this, init);
  }
}
export class Serve implements IServe {
  beer: IBeer;
  prices: IPrice[];
  tap: string;

  public constructor(init?: Partial<IServe>) {
    Object.assign(this, init);
  }
}

export class Price implements IPrice {
  price: number;
  volume: number;
  public constructor(init?: Partial<IPrice>) {
    Object.assign(this, init);
  }
}
export class Brewery implements IBrewery {
  id: string;
  name: string;
  address: string;
  country: ICountry;
  image: string;

  public constructor(init?: Partial<IBrewery>) {
    Object.assign(this, init);
  }
}
export class User implements IUser {
  id: string;
  name: string;
  password: string;
  email: string;
  isAdmin: boolean;
  canAdminPub: boolean;
  canAdminBrewery: boolean;
  pubs: IPub[];
  breweries: IBrewery[];

  public constructor(init?: Partial<IUser>) {
    Object.assign(this, init);
  }
}
export class AccessToken {
  constructor(at: AccessToken) {
    this.accessToken = at.accessToken;
    this.expiresIn = at.expiresIn;
    this.expiresAt = at.expiresAt;
  }

  accessToken: string;
  expiresIn: number;
  expiresAt: Date;
}
export interface IPubAdmin {
  id: number;
  pub: IPub;
  user: IUser;
}
export class PubAdmin implements IPubAdmin {
  id: number;
  pub: IPub;
  user: IUser;

  public constructor(init?: Partial<IPubAdmin>) {
    Object.assign(this, init);
  }
}
export interface IBreweryAdmin {
  id: number;
  brewery: IBrewery;
  user: IUser;
}
export class BreweryAdmin implements IBreweryAdmin {
  id: number;
  brewery: IBrewery;
  user: IUser;

  public constructor(init?: Partial<IBreweryAdmin>) {
    Object.assign(this, init);
  }
}

export interface IBeerKegWeight {
  id: number;
  keg: IBeerKeg;
  date: Date;
  weight: number;
}

export class BeerKegWeight implements IBeerKegWeight {
  id: number;
  keg: IBeerKeg;
  date: Date;
  weight: number;

  public constructor(init?: Partial<IBeerKegWeight>) {
    Object.assign(this, init);
  }
}

export interface ITap {
  id: number;
  pub: IPub;
  number: string;
  hasHopinator: boolean;
  fitting: string;
  nitrogenPercentage: number;
  status: number;
  beerKegsOnTap: IBeerKegOnTap[];
}

export class Tap implements ITap {
  id: number;
  pub: IPub;
  number: string;
  hasHopinator: boolean;
  fitting: string;
  nitrogenPercentage: number;
  status: number;
  beerKegsOnTap: IBeerKegOnTap[];

  public constructor(init?: Partial<ITap>) {
    Object.assign(this, init);
  }
}

export enum TapStatus {
  Working = 2,
  Problem = 1,
  Free = 0
}

export interface IBeerKegOnTap {
  id: number;
  keg: BeerKeg;
  tap: ITap;
  priority: number;
  installTime: Date;
  deinstallTime: Date;
}

export class BeerKegOnTap implements IBeerKegOnTap {
  id: number;
  keg: BeerKeg;
  tap: any;
  priority: number;
  installTime: Date;
  deinstallTime: Date;

  public constructor(init?: Partial<IBeerKegOnTap>) {
    Object.assign(this, init);
  }
}

export enum KegStatus {
  Waiting = 0,
  OnTap = 1,
  Empty = 2,
  Problematic = 4,
  Inactive = 8
}

export interface IBeerKeg {
  id: number;
  keg: IKeg;
  beer: IBeer;
  owner: IBrewery;
  buyer: IPub;
  status: KegStatus;
  brewingDate: Date;
  arrivalDate: Date;
  installationDate: Date;
  deinstallationDate: Date;
  bestBeforeDate: Date;
  packageDate: Date;
  weights: IBeerKegWeight[];
  beerKegsOnTap: IBeerKegOnTap[];
}

export class BeerKeg implements IBeerKeg {
  id: number;
  keg: IKeg;
  beer: IBeer;
  owner: IBrewery;
  buyer: IPub;
  status: KegStatus;
  brewingDate: Date;
  arrivalDate: Date;
  installationDate: Date;
  deinstallationDate: Date;
  bestBeforeDate: Date;
  packageDate: Date;
  weights: IBeerKegWeight[];
  beerKegsOnTap: IBeerKegOnTap[];

  public constructor(init?: Partial<IBeerKeg>) {
    Object.assign(this, init);
  }
}

export interface IKeg {
  id: number;
  externalId: string;
  fitting: string;
  volume: number;
  isReturnable: boolean;
  material: string;
  emptyWeight: number;
  beerKegs: IBeerKeg[];
}

export class Keg implements IKeg {
  id: number;
  externalId: string;
  fitting: string;
  volume: number;
  isReturnable: boolean;
  material: string;
  emptyWeight: number;
  beerKegs: IBeerKeg[];

  public constructor(init?: Partial<IKeg>) {
    Object.assign(this, init);
  }
}

export interface IBeerServedInPub {
  pub: IPub;
  volume: number;
  updated: Date;
  tap: string;
  price: number;
  beer: IBeer;
}

export class BeerServedInPub implements IBeerServedInPub {
  pub: IPub;
  volume: number;
  updated: Date;
  tap: string;
  price: number;
  beer: IBeer;
}

export interface IBeerPrice {
  id: number;
  beer: IBeer;
  pub: IPub;
  price: number;
  volume: number;
  validFrom: Date;
  validTo: Date;
  updated: Date;
}

export class BeerPrice implements IBeerPrice {
  id: number;
  beer: IBeer;
  pub: IPub;
  price: number;
  volume: number;
  validFrom: Date;
  validTo: Date;
  updated: Date;

  public constructor(init?: Partial<IBeerPrice>) {
    Object.assign(this, init);
  }
}
