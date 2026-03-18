import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MemberService } from '../../../../services/member.service';
import { HouseService } from '../../../../services/house.service';
import { House } from '../../../../models/house.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-member-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule, // <--- Agregar este
    MatButtonModule
  ],
  templateUrl: './member-form-dialog.component.html',
  styleUrls: ['./member-form-dialog.component.scss']
})
export class MemberFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly memberService = inject(MemberService);
  private readonly houseService = inject(HouseService);
  private readonly dialogRef = inject(MatDialogRef<MemberFormDialogComponent>);
  
  // Inyectamos los datos recibidos (si existen)
  public readonly data = inject(MAT_DIALOG_DATA);

  houses: House[] = [];
  isEditMode = false;
  hidePassword = true; // Control para el input de password

  memberForm = this.fb.nonNullable.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['resident' as 'admin' | 'resident' | 'security', Validators.required],
    phone: [''],
    house_id: [''] ,
    password: ['', [Validators.required, Validators.minLength(6)]], // <--- Campo nuevo
  });

  ngOnInit(): void {
    // 1. Cargar casas para el dropdown
    this.houseService.getAll().subscribe((data) => (this.houses = data));

    // 2. Detectar si es edición
    if (this.data) {
      this.isEditMode = true;

      this.memberForm.controls.password.clearValidators();
      this.memberForm.controls.password.updateValueAndValidity();
      
      // Parchamos el formulario. Si house_id es un objeto poblado, extraemos solo el _id
      this.memberForm.patchValue({
        ...this.data,
        house_id: this.data.house_id?._id || this.data.house_id || ''
      });
      
      // En edición, a veces queremos bloquear el email para evitar conflictos
      this.memberForm.controls.email.disable();
    }

    // 3. Lógica de validación dinámica de casa según rol
    const houseCtrl = this.memberForm.controls.house_id;
    const roleCtrl = this.memberForm.controls.role;

    const applyHouseValidators = (role: string) => {
      if (role === 'resident') {
        houseCtrl.setValidators([Validators.required]);
      } else {
        houseCtrl.clearValidators();
        houseCtrl.setValue('');
      }
      houseCtrl.updateValueAndValidity();
    };

    applyHouseValidators(roleCtrl.value);
    roleCtrl.valueChanges.subscribe((role) => applyHouseValidators(role));
  }

  save(): void {
    if (this.memberForm.invalid) {
      this.memberForm.markAllAsTouched();
      return;
    }

    // Usamos getRawValue() para incluir el email aunque esté deshabilitado
    const payload = this.memberForm.getRawValue();

    const request = this.isEditMode
      ? this.memberService.update(this.data._id, payload) // Necesitas este método en tu servicio
      : this.memberService.create(payload);

    request.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Error al guardar:', err)
    });
  }
}