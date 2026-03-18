import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ResidentService } from '../../../../../services/resident.service';

@Component({
  selector: 'app-vehicle-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './vehicle-form-dialog.component.html',
  styleUrls: ['./vehicle-form-dialog.component.scss']
})
export class VehicleFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly residentService = inject(ResidentService);
  private readonly dialogRef = inject(MatDialogRef<VehicleFormDialogComponent>);
  
  // Inyectamos los datos del vehículo si es edición
  public readonly data = inject(MAT_DIALOG_DATA);

  isEditMode = false;

  vehicleForm = this.fb.nonNullable.group({
    plate: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(10)]],
    brand: ['', Validators.required],
    model: ['', Validators.required],
    color: ['', Validators.required]
  });

  ngOnInit(): void {
    if (this.data) {
      this.isEditMode = true;
      this.vehicleForm.patchValue(this.data);
      // Opcional: Bloquear la placa en edición si el reglamento no permite cambiarla
      // this.vehicleForm.controls.plate.disable();
    }
  }

  save(): void {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    const payload = this.vehicleForm.getRawValue();

    // Si tu back usa el mismo endpoint para ambos o uno diferente
    const request = this.isEditMode 
      ? this.residentService.updateVehicle(this.data._id, payload) // Cambiar por update si tienes el endpoint
      : this.residentService.addVehicle(payload);

    request.subscribe({
      next: (updatedHouse) => this.dialogRef.close(updatedHouse),
      error: (err) => console.error('Error al guardar vehículo', err)
    });
  }
}