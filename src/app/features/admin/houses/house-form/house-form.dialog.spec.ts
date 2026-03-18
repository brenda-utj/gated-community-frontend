import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseFormDialog } from './house-form.dialog';

describe('HouseFormDialog', () => {
  let component: HouseFormDialog;
  let fixture: ComponentFixture<HouseFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HouseFormDialog]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HouseFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
