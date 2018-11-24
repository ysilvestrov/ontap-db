import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BeerKegEditorComponent } from './beer-keg-editor.component';

describe('BeerKegEditorComponent', () => {
  let component: BeerKegEditorComponent;
  let fixture: ComponentFixture<BeerKegEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BeerKegEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BeerKegEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
