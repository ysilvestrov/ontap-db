import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortDateComponent } from './short-date.component';

describe('ShortDateComponent', () => {
  let component: ShortDateComponent;
  let fixture: ComponentFixture<ShortDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShortDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShortDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
