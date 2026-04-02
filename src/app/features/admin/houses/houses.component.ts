import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HouseService } from '../../../services/house.service';
import { HouseFormDialog } from './house-form/house-form.dialog';
import { House } from '../../../models/house.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SuperAdminService } from '../../../services/super-admin.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-houses',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatCardModule
  ],
  templateUrl: './houses.component.html',
  styleUrls: ['./houses.component.scss']
})
export class HousesComponent implements OnInit {
  private dialog = inject(MatDialog);
  private complexService = inject(SuperAdminService);
  public houseService = inject(HouseService);

  dataSource = new MatTableDataSource<House>([]);
  complexes: any[] = [];
  complexFilterControl = new FormControl('all');
  isSuperAdmin = false;

  displayedColumns: string[] = ['street', 'number', 'info', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.checkRoleAndColumns();
    this.setupFilterPredicate();
    this.loadHouses();

    if (this.isSuperAdmin) {
      this.loadComplexes();
    }
  }

  private checkRoleAndColumns() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.isSuperAdmin = user.role === 'super_admin';
      if (this.isSuperAdmin) {
        this.displayedColumns = ['complex', 'street', 'number', 'info', 'actions'];
      }
    }
  }

  private loadComplexes() {
    this.complexService.getComplexes().subscribe({
      next: (data) => (this.complexes = data),
      error: (err) => console.error('Error al cargar complejos', err)
    });
  }

  private setupFilterPredicate() {
    this.dataSource.filterPredicate = (data: House, filter: string) => {
      const terms = JSON.parse(filter);

      const street = (data.street ?? '').toLowerCase();
      const matchesSearch = street.includes(terms.text);

      const matchesComplex =
        terms.complexId === 'all' ||
        (data as any).complex_id?._id === terms.complexId;

      return matchesSearch && matchesComplex;
    };
  }

  applyFilters() {
    const searchInput = document.querySelector('.houses-search input') as HTMLInputElement;
    const textValue = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const complexValue = this.complexFilterControl.value || 'all';

    this.dataSource.filter = JSON.stringify({
      text: textValue,
      complexId: complexValue
    });

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadHouses() {
    this.houseService.getAll().subscribe((data: House[]) => {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
      this.applyFilters();
    });
  }

  openForm(house?: House) {
    const dialogRef = this.dialog.open(HouseFormDialog, {
      width: '450px',
      data: house
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadHouses();
    });
  }

  deleteHouse(house: House) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: '¿Eliminar propiedad?',
        message: `Estás por eliminar la unidad <b>${house.street} #${house.house_number}</b>.`,
        confirmText: 'SÍ, ELIMINAR',
        cancelText: 'CANCELAR',
        color: 'warn'
      }
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) this.houseService.deleteHouse(house._id).subscribe(() => this.loadHouses());
    });
  }
}