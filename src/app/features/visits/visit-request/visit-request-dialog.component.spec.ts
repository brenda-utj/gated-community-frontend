import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisitRequestDialogComponent } from './visit-request-dialog.component';

describe('VisitRequestDialogComponent', () => {
  let component: VisitRequestDialogComponent;
  let fixture: ComponentFixture<VisitRequestDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitRequestDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(VisitRequestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

