import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Inject,
  OnInit,
  signal
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ReportService } from '../../../services/report.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-reports-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './reports-dialog.component.html',
  styleUrls: ['./reports-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ReportsDialogComponent>);
  private reportService = inject(ReportService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  // Inyectamos los datos del reporte (null = crear, objeto = editar)
  constructor(@Inject(MAT_DIALOG_DATA) public data: any | null) {}

  get isEditing(): boolean {
    return !!this.data?._id;
  }

  selectedFile!: File;
  previewUrl: string | null = null;
  loading = false;
  // Si ya tiene imagen al abrir en modo edición, la mostramos
  existingImageUrl: string | null = null;
  removeExistingImage = false;

  form = this.fb.group({
    subject: ['', Validators.required],
    description: ['', Validators.required]
  });

  ngOnInit() {
    if (this.isEditing) {
      this.form.patchValue({
        subject: this.data.subject,
        description: this.data.description
      });

      if (this.data.image_url) {
        this.existingImageUrl = this.data.image_url;
        this.previewUrl = this.data.image_url;
      }
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    this.removeExistingImage = true;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.selectedFile = null as any;
    this.previewUrl = null;
    this.removeExistingImage = true;
    this.existingImageUrl = null;
  }

  send() {
    if (this.form.invalid) return;

    this.loading = true;

    const formData = new FormData();
    formData.append('subject', this.form.value.subject!);
    formData.append('description', this.form.value.description!);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // En edición: indicar al backend si se quitó la imagen
    if (this.isEditing && this.removeExistingImage && !this.selectedFile) {
      formData.append('remove_image', 'true');
    }

    const request$ = this.isEditing
      ? this.reportService.update(this.data._id, formData as any)
      : this.reportService.create(formData);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditing ? 'Reporte actualizado ✅' : 'Reporte enviado ✅',
          'Cerrar',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Ocurrió un error ❌', 'Cerrar', { duration: 3000 });
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}