import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PaymentService } from '../../../../services/payment.service';
import { Component, inject, signal } from '@angular/core';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatButtonModule, 
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly paymentService = inject(PaymentService);
  private readonly dialogRef = inject(MatDialogRef<PaymentFormComponent>);
  private readonly snackBar = inject(MatSnackBar);

  selectedFile: File | null = null;
  imagePreview = signal<string | null>(null); // Previsualización local

  months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  paymentForm = this.fb.nonNullable.group({
    month_covered: ['', Validators.required],
    amount: ['', [Validators.required, Validators.min(1)]]
  });

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  submit(): void {
    if (this.paymentForm.invalid || !this.selectedFile) return;

    const formData = new FormData();
    formData.append('receipt', this.selectedFile);
    formData.append('amount', this.paymentForm.getRawValue().amount);
    formData.append('month_covered', this.paymentForm.getRawValue().month_covered);

    this.paymentService.uploadPayment(formData).subscribe({
      next: () => {
        this.snackBar.open('Comprobante enviado correctamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Error al subir el comprobante';
        this.snackBar.open(msg, 'Cerrar', {
          duration: 5000,
          panelClass: 'snack-error' // opcional, para estilizarlo en rojo
        });
      }
    });
  }
}