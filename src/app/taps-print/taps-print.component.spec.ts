import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TapsPrintComponent } from './taps-print.component';

describe('TapsPrintComponent', () => {
  let component: TapsPrintComponent;
  let fixture: ComponentFixture<TapsPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TapsPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TapsPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
