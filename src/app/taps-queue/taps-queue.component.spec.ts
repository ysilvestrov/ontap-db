import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TapsQueueComponent } from './taps-queue.component';

describe('TapsQueueComponent', () => {
  let component: TapsQueueComponent;
  let fixture: ComponentFixture<TapsQueueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TapsQueueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TapsQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
