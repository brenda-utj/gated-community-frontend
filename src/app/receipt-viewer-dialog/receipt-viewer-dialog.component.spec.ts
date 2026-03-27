import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptViewerDialogComponent } from './receipt-viewer-dialog.component';

describe('ReceiptViewerDialogComponent', () => {
  let component: ReceiptViewerDialogComponent;
  let fixture: ComponentFixture<ReceiptViewerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptViewerDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReceiptViewerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
