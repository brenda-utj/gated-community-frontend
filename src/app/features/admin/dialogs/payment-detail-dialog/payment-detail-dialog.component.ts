import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { PaymentService } from '../../../../services/payment.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Detalle de Comprobante</h2>
    <mat-dialog-content>
      <div class="payment-info">
        <p><strong>Residente:</strong> {{ data.resident_id?.first_name }}</p>
        <p><strong>Monto:</strong> {{ data.amount | currency }}</p>
        <p><strong>Mes:</strong> {{ data.month_covered }}</p>
      </div>
      
      <div class="image-container">
        <img [src]="data.receipt_url" alt="Ticket" style="width: 100%; border-radius: 8px;">
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>CERRAR</button>
      <button mat-flat-button color="warn" (click)="verify('rejected')">RECHAZAR</button>
      <button mat-flat-button color="primary" (click)="verify('verified')">APROBAR PAGO</button>
    </mat-dialog-actions>
  `
})
export class PaymentDetailDialogComponent {
  public data = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<PaymentDetailDialogComponent>);
  private paymentService = inject(PaymentService);

  verify(status: 'verified' | 'rejected') {
    // Usamos el método patch que definimos en el servicio
    this.paymentService.updatePaymentStatus(this.data._id, { status }).subscribe(() => {
      this.dialogRef.close(true);
    });
  }
}