import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HouseService } from '../../../../services/house.service';

@Component({
  standalone: true,
  imports: [MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar' : 'Nueva' }} Unidad</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-column">
        <mat-form-field appearance="outline">
          <mat-label>Calle / Avenida</mat-label>
          <input matInput formControlName="street">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Número de casa / Depto</mat-label>
          <input matInput formControlName="house_number">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="form.invalid">
        {{ data ? 'Actualizar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `
})
export class HouseFormDialog implements OnInit {
  private fb = inject(FormBuilder);
  private houseService = inject(HouseService);
  private dialogRef = inject(MatDialogRef<HouseFormDialog>);
  public data = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    street: ['', Validators.required],
    house_number: ['', Validators.required]
  });

  ngOnInit() {
    if (this.data) this.form.patchValue(this.data);
  }

  save() {
    const request = this.data 
      ? this.houseService.updateHouse(this.data._id, this.form.value as any)
      : this.houseService.createHouse(this.form.value as any);

    request.subscribe(() => this.dialogRef.close(true));
  }
}