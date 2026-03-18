import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { PaymentService } from '../../../services/payment.service';
import { PaymentDetailDialogComponent } from '../dialogs/payment-detail-dialog/payment-detail-dialog.component';
import { MatCard } from "@angular/material/card";

@Component({
  selector: 'app-payment-verification',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule, MatCard],
  templateUrl: './payment-verification.component.html',
  styleUrls: ['./payment-verification.component.scss']
})
export class PaymentVerificationComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private dialog = inject(MatDialog);

  payments = signal<any[]>([]);
  displayedColumns = ['resident', 'house', 'month', 'amount', 'status', 'actions'];

  ngOnInit() {
    this.loadAllPayments();
  }

  loadAllPayments() {
    // Aquí podrías usar un nuevo método en el servicio para obtener TODO el complejo
    this.paymentService.getHistory().subscribe(data => this.payments.set(data));
  }

  viewDetail(payment: any) {
    const dialogRef = this.dialog.open(PaymentDetailDialogComponent, {
      width: '600px',
      data: payment
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadAllPayments();
    });
  }
}