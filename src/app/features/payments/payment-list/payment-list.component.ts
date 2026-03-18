import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PaymentService } from '../../../services/payment.service';
import { PaymentFormComponent } from '../dialogs/payment-form/payment-form.component';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule, 
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.scss']
})
export class PaymentListComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly dialog = inject(MatDialog);

  // Signal para almacenar la lista de pagos
  payments = signal<any[]>([]);
  
  // Columnas que se mostrarán en la mat-table
  displayedColumns: string[] = ['month', 'amount', 'status', 'date', 'receipt'];

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.paymentService.getHistory().subscribe({
      next: (data) => {
        this.payments.set(data);
      },
      error: (err) => {
        console.error('Error al obtener historial de pagos:', err);
      }
    });
  }

  openUploadDialog(): void {
    const dialogRef = this.dialog.open(PaymentFormComponent, {
      width: '500px',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      // Si el diálogo devolvió true, significa que se subió un pago con éxito
      if (result) {
        this.loadPayments();
      }
    });
  }
}