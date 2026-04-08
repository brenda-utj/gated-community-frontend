import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';

/* MATERIAL */
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-create-reservation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './create-reservation-dialog.component.html',
  styleUrl: './create-reservation-dialog.component.scss'
})
export class CreateReservationDialogComponent {

  form: FormGroup;
  loading = false;
  hours: string[] = [];

  private API_URL = 'http://localhost:3000/api/reservations';

  areas = [
    'Alberca',
    'Salón de eventos',
    'Terraza',
    'Gimnasio'
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateReservationDialogComponent>,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any // 🔥 CLAVE
  ) {
    this.form = this.fb.group({
      area: ['', Validators.required],
      date: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      guests: [1, [Validators.required, Validators.min(1)]],
      requirements: ['']
    });
  }

  ngOnInit() {
    this.generateHours();

    /* 🔥 MODO EDICIÓN */
    if (this.data?.isEdit && this.data?.reservation) {

      const r = this.data.reservation;

      this.form.patchValue({
        area: r.area,
        date: new Date(r.date), // 🔥 importante
        start_time: r.start_time,
        end_time: r.end_time,
        guests: r.guests,
        requirements: r.requirements
      });

    }
  }

  generateHours() {
    const start = 8;
    const end = 22;

    for (let i = start; i < end; i++) {
      this.hours.push(`${i.toString().padStart(2,'0')}:00`);
      this.hours.push(`${i.toString().padStart(2,'0')}:30`);
    }
  }

  /* ========================= */
  /* 🔥 CREATE / UPDATE */
  /* ========================= */
  submit() {

    if (this.form.invalid) return;

    this.loading = true;

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const payload = {
      ...this.form.value,
      date: this.formatDate(this.form.value.date)
    };

    /* 🔥 EDITAR */
    if (this.data?.isEdit) {

      this.http.put(
        `${this.API_URL}/${this.data.reservation._id}`,
        payload,
        { headers }
      ).subscribe({
        next: () => {
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });

    } else {

      /* 🔥 CREAR */
      this.http.post(this.API_URL, payload, { headers })
        .subscribe({
          next: () => {
            this.loading = false;
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
          }
        });

    }
  }

  /* ========================= */
  /* 📅 FORMATO FECHA */
  /* ========================= */
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  close() {
    this.dialogRef.close();
  }

}