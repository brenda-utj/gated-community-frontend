import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplexesComponent } from './complexes.component';

describe('ComplexesComponent', () => {
  let component: ComplexesComponent;
  let fixture: ComponentFixture<ComplexesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplexesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComplexesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
