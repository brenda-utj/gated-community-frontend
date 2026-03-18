import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { HouseService } from '../../../services/house.service';
import { HouseFormDialog } from './house-form/house-form.dialog';
import { House } from '../../../models/house.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-houses',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-container">
      <div class="header-row">
        <div>
          <h1>Unidades Residenciales</h1>
          <p>Listado de casas y departamentos del complejo.</p>
        </div>
        <button mat-flat-button color="primary" (click)="openForm()">
          <mat-icon>add_home</mat-icon> REGISTRAR UNIDAD
        </button>
      </div>

      <table mat-table [dataSource]="houseService.houses()" class="mat-elevation-z2">
        
        <ng-container matColumnDef="street">
          <th mat-header-cell *matHeaderCellDef>Calle</th>
          <td mat-cell *matCellDef="let h"> {{h.street}} </td>
        </ng-container>

        <ng-container matColumnDef="number">
          <th mat-header-cell *matHeaderCellDef>Número</th>
          <td mat-cell *matCellDef="let h"> <strong>#{{h.house_number}}</strong> </td>
        </ng-container>

        <ng-container matColumnDef="info">
          <th mat-header-cell *matHeaderCellDef>Ocupación</th>
          <td mat-cell *matCellDef="let h">
            <span class="info-tag">
              <mat-icon>directions_car</mat-icon> {{ h.vehicles?.length || 0 }}
            </span>
            <span class="info-tag">
              <mat-icon>pets</mat-icon> {{ h.pets?.length || 0 }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef align="end">Acciones</th>
          <td mat-cell *matCellDef="let h" align="end">
            <button mat-icon-button (click)="openForm(h)"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="deleteHouse(h)"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="['street', 'number', 'info', 'actions']"></tr>
        <tr mat-row *matRowDef="let row; columns: ['street', 'number', 'info', 'actions'];"></tr>
      </table>
    </div>
  `,
  styleUrls: ['./houses.component.scss']
})
export class HousesComponent implements OnInit {
  public houseService = inject(HouseService);
  private dialog = inject(MatDialog);

  ngOnInit() {
    this.houseService.getAll().subscribe();
  }

  openForm(house?: House) {
    this.dialog.open(HouseFormDialog, {
      width: '400px',
      data: house
    });
  }

  deleteHouse(house: House) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: '¿Eliminar propiedad?',
        message: `Estás por eliminar la unidad <b>${house.street} #${house.house_number}</b>.`,
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) this.houseService.deleteHouse(house._id).subscribe();
    });
  }
}