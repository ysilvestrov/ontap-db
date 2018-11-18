import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {BeerKeg} from '../ontap.models';
import {StorageService} from '../storage.service';
import {ContextMenuComponent} from 'ngx-contextmenu';
import {QueueService} from '../queue.service';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.css']
})
export class StorageComponent implements OnInit {

  constructor(
    private storageService: StorageService,
    private queueService: QueueService,
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

  @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;

  private routeSubscription: Subscription;
  private id: string;
  public kegs: BeerKeg[];
  public errorMessage: any;

  private getKegs() {
    this.storageService.getKegs(this.id).subscribe(kegs => {
      this.kegs = kegs;
    });
  }

  public addToQueue(keg: BeerKeg) {
    this.queueService.addToQueue(this.id, keg).subscribe(k => {
      this.kegs.forEach((current, index, kegs) => {if (current.id === k.id) {
        kegs[index].beerKegsOnTap = k.beerKegsOnTap;
      }});
    });
  }

  public removeFromStorage(keg: BeerKeg) {
    this.storageService.removeFromStorage(this.id, keg).subscribe(k => {
      this.kegs.forEach((current, index, kegs) => {if (current.id === k.id) {
        if (k.installationDate != null) {
          kegs = kegs.splice(index, 1);
        }
      }});
    });
  }

  ngOnInit() {
  }

}
