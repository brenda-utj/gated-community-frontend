import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperAdminService } from '../../../services/super-admin.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // <-- Importar esto
import { ComplexFormDialog } from './complex-form/complex-form.dialog';
import { finalize } from 'rxjs';
import { MatDivider } from '@angular/material/divider';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-complexes',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule, // <-- Añadir aquí
    MatDivider,
  ],
  templateUrl: './complexes.component.html',
  styleUrls: ['./complexes.component.scss'],
})
export class ComplexesComponent implements OnInit {
  private superService = inject(SuperAdminService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar); // 3. Inyéctalo aquí

  complexes = this.superService.complexes;
  isLoading = signal(false); // Signal para manejar el estado de carga

  ngOnInit() {
    this.loadComplexes();
  }

  loadComplexes() {
    this.isLoading.set(true);
    this.superService
      .getComplexes()
      .pipe(finalize(() => this.isLoading.set(false))) // Se apaga al terminar (éxito o error)
      .subscribe();
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(ComplexFormDialog, { width: '600px' });
    dialogRef.afterClosed().subscribe((val) => {
      if (val) this.loadComplexes();
    });
  }

  // En complexes.component.ts
  openEditDialog(item: any) {
    this.dialog
      .open(ComplexFormDialog, {
        width: '600px',
        data: item, // Aquí pasamos los datos para que el diálogo sepa que es edición
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.loadComplexes();
      });
  }

  deleteComplex(complex: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Fraccionamiento',
        message: `¿Estás seguro de que deseas eliminar <strong>${complex.name}</strong>?<br><small>Esta acción no se puede deshacer de forma sencilla.</small>`,
        confirmText: 'SÍ, ELIMINAR',
        cancelText: 'NO, REGRESAR',
        color: 'warn',
        icon: 'delete_forever'
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading.set(true);
        this.superService.deleteComplex(complex._id).subscribe({
          next: () => {
            this.snackBar.open('Fraccionamiento eliminado correctamente', 'Cerrar', { duration: 3000 });
            this.loadComplexes(); // Recarga la lista (el Signal se actualizará)
          },
          error: (err) => {
            this.isLoading.set(false);
            this.snackBar.open('Error al eliminar: ' + err.error.message, 'Cerrar');
          }
        });
      }
    });
  }
}
