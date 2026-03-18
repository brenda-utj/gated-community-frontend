import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { VisitService } from '../../../services/visit.service';

@Component({
  selector: 'app-visit-request-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  templateUrl: './visit-request-dialog.component.html',
  styleUrls: ['./visit-request-dialog.component.scss']
})
export class VisitRequestDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly visitService = inject(VisitService);
  private readonly dialogRef = inject(MatDialogRef<VisitRequestDialogComponent>);

  visitForm = this.fb.nonNullable.group({
    visitor_name: ['', Validators.required],
    visitor_email: ['', Validators.email],
    visit_date: [new Date(), Validators.required]
  });

  send(): void {
    if (this.visitForm.invalid) {
      this.visitForm.markAllAsTouched();
      return;
    }

    this.visitService.create(this.visitForm.getRawValue()).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Error creando visita', err)
    });
  }
}

