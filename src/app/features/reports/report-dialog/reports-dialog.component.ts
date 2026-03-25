import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReportService } from '../../../services/report.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './reports-dialog.component.html',
  styleUrls: ['./reports-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsDialogComponent {
   private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ReportsDialogComponent>);
  private reportService = inject(ReportService);
  private snackBar = inject(MatSnackBar);

  selectedFile!: File;
  previewUrl: string | null = null;
  loading = false;

  form = this.fb.group({
    subject: ['', Validators.required],
    description: ['', Validators.required]
  });

  // 📸 Capturar archivo
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    // Preview
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // 🗑️ Eliminar imagen
  removeImage() {
    this.selectedFile = null as any;
    this.previewUrl = null;
  }

  // 🚀 Enviar
  send() {
    if (this.form.invalid) return;

    this.loading = true;

    const formData = new FormData();
    formData.append('subject', this.form.value.subject!);
    formData.append('description', this.form.value.description!);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.reportService.create(formData).subscribe({
      next: () => {
        this.snackBar.open('Reporte enviado con éxito ✅', 'Cerrar', {
          duration: 3000
        });

        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Error al enviar reporte ❌', 'Cerrar', {
          duration: 3000
        });

        this.loading = false;
      }
    });
  }
}
