import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeightEditorComponent } from './weight-editor.component';

describe('WeightEditorComponent', () => {
  let component: WeightEditorComponent;
  let fixture: ComponentFixture<WeightEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeightEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeightEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
