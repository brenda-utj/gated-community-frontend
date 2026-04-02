import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { SuperAdminService } from '../../../../services/super-admin.service';
import { MatIcon } from "@angular/material/icon";
import { MatDivider } from "@angular/material/divider";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
// ... otros imports de Material que ya tenías

@Component({
  selector: 'app-complex-form',
  standalone: true,
  imports: [MatDialogModule, MatIcon, MatDivider, ReactiveFormsModule, MatFormField, MatLabel, MatInputModule, MatButtonModule],
  templateUrl: './complex-form.dialog.html',
  styleUrl: './complex-form.dialog.scss'
})
export class ComplexFormDialog implements OnInit {
  private fb = inject(FormBuilder);
  private superService = inject(SuperAdminService);
  private dialogRef = inject(MatDialogRef<ComplexFormDialog>);
  private snackBar = inject(MatSnackBar);
  
  // Recibimos los datos (si vienen es edición, si no es creación)
  public data = inject(MAT_DIALOG_DATA); 

  isLoading = signal(false);
  isEditMode = signal(false);

  complexForm = this.fb.nonNullable.group({
    complex_name: ['', [Validators.required, Validators.minLength(3)]],
    address: ['', [Validators.required]],
    // Los campos de admin solo son obligatorios al crear
    admin_first_name: [''],
    admin_last_name: [''],
    admin_email: ['', [Validators.email]],
    admin_password: ['', [Validators.minLength(6)]]
  });

  ngOnInit() {
    if (this.data) {
      this.isEditMode.set(true);
      
      // CORRECCIÓN: Usamos 'name' que es como viene del API
      this.complexForm.patchValue({
        complex_name: this.data.name, 
        address: this.data.address,
        admin_first_name:this.data.admin_user?.first_name || '',
        admin_last_name: this.data.admin_user?.last_name || '',
        admin_email: this.data.admin_user?.email || '',
      });
  
      // En edición, removemos validadores de los campos de admin para que no bloqueen el form
      this.complexForm.controls.admin_email.clearValidators();
      this.complexForm.controls.admin_password.clearValidators();
    } else {
      // En creación, nos aseguramos de que sean obligatorios
      this.complexForm.controls.admin_first_name.addValidators(Validators.required);
      this.complexForm.controls.admin_last_name.addValidators(Validators.required);
      this.complexForm.controls.admin_email.addValidators([Validators.required, Validators.email]);
      this.complexForm.controls.admin_password.addValidators([Validators.required, Validators.minLength(6)]);
    }
    
    // Actualizamos la validez después de cambiar validadores
    this.complexForm.updateValueAndValidity();
  }

  onSubmit() {
    if (this.complexForm.invalid) return;
    this.isLoading.set(true);
    
    const payload = this.complexForm.getRawValue();
    
    // Decidimos qué acción tomar
    const request = this.isEditMode() 
      ? this.superService.updateComplex(this.data._id, payload) 
      : this.superService.createComplex(payload);

    request.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => {
        this.snackBar.open(`Fraccionamiento ${this.isEditMode() ? 'actualizado' : 'creado'}`, 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Error', 'Cerrar')
    });
  }
}