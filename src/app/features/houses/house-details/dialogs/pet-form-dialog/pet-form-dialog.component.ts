import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ResidentService } from '../../../../../services/resident.service';

@Component({
  selector: 'app-pet-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Editar' : 'Registrar' }} Mascota</h2>
    <mat-dialog-content>
      <form [formGroup]="petForm" class="flex flex-col gap-2 pt-2">
        <mat-form-field appearance="outline">
          <mat-label>Nombre de la mascota</mat-label>
          <input matInput formControlName="name" placeholder="Ej. Max">
        </mat-form-field>

        <div class="flex gap-4">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Tipo</mat-label>
            <mat-select formControlName="type">
              <mat-option value="dog">Perro</mat-option>
              <mat-option value="cat">Gato</mat-option>
              <mat-option value="bird">Ave</mat-option>
              <mat-option value="other">Otro</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Raza</mat-label>
            <input matInput formControlName="breed" placeholder="Ej. Labrador">
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>CANCELAR</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="petForm.invalid">
        {{ isEditMode ? 'ACTUALIZAR' : 'GUARDAR' }}
      </button>
    </mat-dialog-actions>
  `
})
export class PetFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private residentService = inject(ResidentService);
  private dialogRef = inject(MatDialogRef<PetFormDialogComponent>);
  public data = inject(MAT_DIALOG_DATA);

  isEditMode = false;

  petForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    type: ['dog', Validators.required],
    breed: ['', Validators.required]
  });

  ngOnInit(): void {
    if (this.data) {
      this.isEditMode = true;
      this.petForm.patchValue(this.data);
    }
  }

  save(): void {
    if (this.petForm.invalid) return;

    const payload = this.petForm.getRawValue();
    const request = this.isEditMode 
      ? this.residentService.updatePet(this.data._id, payload)
      : this.residentService.addPet(payload);

    request.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Error al guardar mascota', err)
    });
  }
}