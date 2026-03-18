import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplexFormDialog } from './complex-form.dialog';

describe('ComplexFormDialog', () => {
  let component: ComplexFormDialog;
  let fixture: ComponentFixture<ComplexFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplexFormDialog]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComplexFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
