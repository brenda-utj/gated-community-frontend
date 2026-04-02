import { Component, inject, signal, computed } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { PaymentService } from '../../../../services/payment.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule, MatProgressSpinnerModule],
  styleUrls: ['./payment-detail-dialog.component.scss'],
  template: `
    <!-- HEADER -->
    <div class="dialog-header">
      <div class="header-left">
        <div class="header-icon">
          <mat-icon>receipt_long</mat-icon>
        </div>
        <div>
          <h2 class="dialog-title">Comprobante de Pago</h2>
          <p class="dialog-subtitle">Revisa el detalle antes de tomar una acción</p>
        </div>
      </div>
      <button mat-icon-button mat-dialog-close class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-body">

      <!-- BANNER si ya tiene estado previo -->
      @if (data.status && data.status !== 'pending') {
        <div class="current-status-banner" [ngClass]="'banner-' + data.status">
          <mat-icon>{{ data.status === 'approved' ? 'check_circle' : 'cancel' }}</mat-icon>
          <span>Este pago ya fue <strong>{{ data.status === 'approved' ? 'aprobado' : 'rechazado' }}</strong></span>
        </div>
      }

      <!-- INFO GRID -->
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label"><mat-icon>person</mat-icon> Residente</span>
          <span class="info-value">{{ data.resident_id?.first_name }} {{ data.resident_id?.last_name }}</span>
        </div>
        <div class="info-item">
          <span class="info-label"><mat-icon>home</mat-icon> Ubicación</span>
          <span class="info-value">
            {{ data.house_id?.street ? data.house_id.street + ' #' + data.house_id.house_number : 'Sin asignar' }}
          </span>
        </div>
        <div class="info-item">
          <span class="info-label"><mat-icon>calendar_month</mat-icon> Período</span>
          <span class="info-value"><span class="period-tag">{{ data.month_covered }}</span></span>
        </div>
        <div class="info-item">
          <span class="info-label"><mat-icon>payments</mat-icon> Monto</span>
          <span class="info-value amount">{{ data.amount | currency }}</span>
        </div>
      </div>

      <mat-divider class="section-divider"></mat-divider>

      <!-- SECCIÓN COMPROBANTE -->
      <p class="section-label">Imagen del comprobante</p>

      @if (receiptSrc()) {
        <!-- Tiene base64 -->
        <div class="image-wrapper">
          @if (!imageLoaded() && !imageError()) {
            <div class="img-skeleton">
              <mat-spinner diameter="32"></mat-spinner>
            </div>
          }
          @if (!imageError()) {
            <img
              [src]="receiptSrc()"
              alt="Comprobante de pago"
              class="receipt-img"
              [class.hidden]="!imageLoaded()"
              (load)="imageLoaded.set(true)"
              (error)="imageError.set(true)"
            />
          }
          @if (imageError()) {
            <div class="no-receipt">
              <mat-icon>broken_image</mat-icon>
              <p>No se pudo cargar la imagen del comprobante.</p>
            </div>
          }
        </div>
      } @else {
        <!-- Sin comprobante -->
        <div class="no-receipt">
          <mat-icon>image_not_supported</mat-icon>
          <p>El residente no adjuntó ningún comprobante.</p>
        </div>
      }

    </mat-dialog-content>

    <!-- ACTIONS -->
    <div class="dialog-actions">
      <button mat-button mat-dialog-close class="btn-cancel">Cancelar</button>
      <div class="action-btns">
        <button mat-stroked-button class="btn-reject" [disabled]="isProcessing()" (click)="verify('rejected')">
          <mat-icon>thumb_down</mat-icon> Rechazar
        </button>
        <button mat-flat-button class="btn-approve" [disabled]="isProcessing()" (click)="verify('verified')">
          @if (isProcessing()) {
            <mat-spinner diameter="18" class="btn-spinner"></mat-spinner>
          } @else {
            <mat-icon>thumb_up</mat-icon>
          }
          Aprobar pago
        </button>
      </div>
    </div>
  `
})
export class PaymentDetailDialogComponent {
  public data = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<PaymentDetailDialogComponent>);
  private paymentService = inject(PaymentService);

  imageLoaded  = signal(false);
  imageError   = signal(false);
  isProcessing = signal(false);

  /**
   * Construye el data URL a partir de receipt_base64 + receipt_mime.
   * Devuelve null si no hay imagen adjunta.
   */
  receiptSrc = computed<string | null>(() => {
    const b64  = this.data?.receipt_base64;
    const mime = this.data?.receipt_mime ?? 'image/jpeg';
    if (!b64) return null;
    return `data:${mime};base64,${b64}`;
  });

  verify(status: 'verified' | 'rejected') {
    this.isProcessing.set(true);
    this.paymentService.updatePaymentStatus(this.data._id, { status }).subscribe({
      next:  () => this.dialogRef.close(true),
      error: () => this.isProcessing.set(false),
    });
  }
}