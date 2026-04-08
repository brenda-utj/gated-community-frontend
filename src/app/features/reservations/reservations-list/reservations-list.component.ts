import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { CreateReservationDialogComponent } from '../create-reservation-dialog/create-reservation-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-reservations-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './reservations-list.component.html',
  styleUrl: './reservations-list.component.scss'
})
export class ReservationsListComponent implements OnInit {

  reservations: any[] = [];
  loading = false;

  private API_URL = environment.apiUrl + '/reservations'; 

  constructor(
    private http: HttpClient,
    private dialog: MatDialog // 🔥 CORRECTO
  ) {}

  ngOnInit(): void {
    this.getReservations();
  }

  /* ========================= */
  /* 🔥 GET RESERVATIONS */
  /* ========================= */
  getReservations() {
    this.loading = true;

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any[]>(this.API_URL, { headers })
      .subscribe({
        next: (res) => {
          this.reservations = res || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al obtener reservas', err);
          this.loading = false;
        }
      });
  }

  /* ========================= */
  /* ❌ CANCELAR RESERVA */
  /* ========================= */
  cancelReservation(id: string) {

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Cancelar reserva',
        message: '¿Seguro que deseas cancelar esta reserva?<br><small>Esta acción no se puede deshacer.</small>',
        confirmText: 'Sí, cancelar',
        cancelText: 'No',
        color: 'warn',
        icon: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {

      if (!result) return;

      const token = localStorage.getItem('token');

      this.http.patch(
        `${this.API_URL}/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      ).subscribe({
        next: () => this.getReservations(),
        error: (err) => console.error(err)
      });

    });
  }

  /* ========================= */
  /* ➕ CREAR */
  /* ========================= */
  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateReservationDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) this.getReservations();
    });
  }

  /* ========================= */
  /* ✏️ EDITAR */
  /* ========================= */
  editReservation(reservation: any) {

    const dialogRef = this.dialog.open(CreateReservationDialogComponent, {
      width: '500px',
      data: {
        isEdit: true,
        reservation: reservation
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) this.getReservations();
    });
  }

  /* ========================= */
  /* 🗑️ ELIMINAR */
  /* ========================= */
  deleteReservation(reservation: any) {

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Eliminar reserva',
        message: `
          ¿Seguro que deseas eliminar esta reserva?<br>
          <strong>${reservation.area}</strong><br>
          <small>Esta acción es permanente</small>
        `,
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
        color: 'warn',
        icon: 'delete'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {

      if (!result) return;

      const token = localStorage.getItem('token');

      this.http.delete(
        `${this.API_URL}/${reservation._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      ).subscribe({
        next: () => this.getReservations(),
        error: (err) => console.error(err)
      });

    });
  }

}