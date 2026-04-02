import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HouseService } from '../../../../services/house.service';

@Component({
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  styleUrls: ['./house-form.dialog.scss'],
  template: `
    <!-- HEADER -->
    <div class="dialog-header">
      <div class="header-left">
        <div class="header-icon">
          <mat-icon>{{ data ? 'edit_home' : 'add_home' }}</mat-icon>
        </div>
        <div>
          <h2 class="dialog-title">{{ data ? 'Editar unidad' : 'Nueva unidad' }}</h2>
          <p class="dialog-subtitle">
            {{ data ? 'Modifica los datos de la propiedad' : 'Completa los datos para registrar la propiedad' }}
          </p>
        </div>
      </div>
      <button mat-icon-button mat-dialog-close class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <!-- BODY -->
    <mat-dialog-content class="dialog-body">
      <form [formGroup]="form" class="form-column">

        <mat-form-field appearance="outline">
          <mat-label>Calle / Avenida</mat-label>
          <mat-icon matPrefix>signpost</mat-icon>
          <input matInput formControlName="street" placeholder="Ej. Av. Principal" />
          @if (form.get('street')?.hasError('required') && form.get('street')?.touched) {
            <mat-error>La calle es requerida</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Número de casa / Depto</mat-label>
          <mat-icon matPrefix>tag</mat-icon>
          <input matInput formControlName="house_number" placeholder="Ej. 12-B" />
          @if (form.get('house_number')?.hasError('required') && form.get('house_number')?.touched) {
            <mat-error>El número es requerido</mat-error>
          }
        </mat-form-field>

      </form>
    </mat-dialog-content>

    <!-- ACTIONS -->
    <div class="dialog-actions">
      <button mat-button mat-dialog-close class="btn-cancel">Cancelar</button>
      <button
        mat-flat-button
        class="btn-save"
        (click)="save()"
        [disabled]="form.invalid || isSaving()">
        @if (isSaving()) {
          <mat-spinner diameter="18" class="btn-spinner"></mat-spinner>
          Guardando...
        } @else {
          <mat-icon>{{ data ? 'save' : 'add' }}</mat-icon>
          {{ data ? 'Actualizar' : 'Crear unidad' }}
        }
      </button>
    </div>
  `
})
export class HouseFormDialog implements OnInit {
  private fb           = inject(FormBuilder);
  private houseService = inject(HouseService);
  private dialogRef    = inject(MatDialogRef<HouseFormDialog>);
  public  data         = inject(MAT_DIALOG_DATA);

  isSaving = signal(false);

  form = this.fb.group({
    street:       ['', Validators.required],
    house_number: ['', Validators.required],
  });

  ngOnInit() {
    if (this.data) this.form.patchValue(this.data);
  }

  save() {
    if (this.form.invalid) return;
    this.isSaving.set(true);

    const request = this.data
      ? this.houseService.updateHouse(this.data._id, this.form.value as any)
      : this.houseService.createHouse(this.form.value as any);

    request.subscribe({
      next:  () => this.dialogRef.close(true),
      error: () => this.isSaving.set(false),
    });
  }
}