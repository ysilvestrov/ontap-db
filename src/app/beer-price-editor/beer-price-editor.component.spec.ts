import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BeerPriceEditorComponent } from './beer-price-editor.component';

describe('BeerPriceEditorComponent', () => {
  let component: BeerPriceEditorComponent;
  let fixture: ComponentFixture<BeerPriceEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BeerPriceEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BeerPriceEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
