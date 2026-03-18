import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule
  ],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly paymentService = inject(PaymentService);
  private readonly dialogRef = inject(MatDialogRef<PaymentFormComponent>);

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
    // 'receipt' debe coincidir con upload.single("receipt") del back
    formData.append('receipt', this.selectedFile);
    formData.append('amount', this.paymentForm.getRawValue().amount);
    formData.append('month_covered', this.paymentForm.getRawValue().month_covered);

    this.paymentService.uploadPayment(formData).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err: any) => console.error('Error al subir pago', err)
    });
  }
}