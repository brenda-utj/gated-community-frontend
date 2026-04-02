import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { SuperAdminService } from '../../../services/super-admin.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ComplexFormDialog } from './complex-form/complex-form.dialog';
import { finalize, debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { MatDivider } from '@angular/material/divider';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

const PAGE_SIZE = 6;

@Component({
  selector: 'app-complexes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatDivider,
    MatSlideToggleModule,
  ],
  templateUrl: './complexes.component.html',
  styleUrls: ['./complexes.component.scss'],
})
export class ComplexesComponent implements OnInit, OnDestroy {
  private superService = inject(SuperAdminService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  /** Lista completa recibida del servidor */
  private allComplexes: any[] = [];

  /** Lista filtrada por búsqueda */
  private filteredComplexes: any[] = [];

  /** Cuántos elementos se muestran actualmente */
  private currentPageSize = PAGE_SIZE;

  /** Signal que alimenta el template */
  displayedComplexes = signal<any[]>([]);

  /** ¿Hay más elementos por mostrar? */
  hasMore = signal(false);

  isLoading = signal(false);

  searchControl = new FormControl('');

  statusLabels: { [key: string]: string } = {
    active: 'ACTIVO',
    inactive: 'INACTIVO',
    pending: 'PENDIENTE',
    suspended: 'SUSPENDIDO',
  };

  ngOnInit() {
    this.loadComplexes();

    // Escuchar cambios en el buscador
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.applySearchWithLoading(query ?? '');
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Carga inicial ────────────────────────────────────────────────────────────

  loadComplexes() {
    this.isLoading.set(true);
    this.superService
      .getComplexes()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data: any[]) => {
          this.allComplexes = data;
          this.resetPagination(data);
        },
      });
  }

  // ── Búsqueda ─────────────────────────────────────────────────────────────────

  private applySearchWithLoading(query: string) {
    this.isLoading.set(true);

    // Simula latencia de búsqueda local
    setTimeout(() => {
      const q = query.trim().toLowerCase();
      const filtered = q
        ? this.allComplexes.filter((c) => c.name?.toLowerCase().includes(q))
        : [...this.allComplexes];

      this.resetPagination(filtered);
      this.isLoading.set(false);
    }, 500);
  }

  // ── Paginación ───────────────────────────────────────────────────────────────

  /** Reinicia la ventana de paginación con una nueva lista filtrada */
  private resetPagination(source: any[]) {
    this.filteredComplexes = source;
    this.currentPageSize = PAGE_SIZE;
    this.updateDisplayed();
  }

  /** Actualiza el signal y recalcula si quedan más elementos */
  private updateDisplayed() {
    const slice = this.filteredComplexes.slice(0, this.currentPageSize);
    this.displayedComplexes.set(slice);
    this.hasMore.set(this.currentPageSize < this.filteredComplexes.length);
  }

  loadMore() {
    this.isLoading.set(true);

    setTimeout(() => {
      this.currentPageSize += PAGE_SIZE;
      this.updateDisplayed();
      this.isLoading.set(false);
    }, 500);
  }

  // ── Diálogos ─────────────────────────────────────────────────────────────────

  openCreateDialog() {
    const dialogRef = this.dialog.open(ComplexFormDialog, { width: '600px' });
    dialogRef.afterClosed().subscribe((val) => {
      if (val) this.loadComplexes();
    });
  }

  openEditDialog(item: any) {
    this.dialog
      .open(ComplexFormDialog, { width: '600px', data: item })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.loadComplexes();
      });
  }

  // ── Acciones ─────────────────────────────────────────────────────────────────

  toggleStatus(item: any) {
    const newStatus = item.subscription_status === 'active' ? 'inactive' : 'active';
    this.isLoading.set(true);

    this.superService
      .changeStatus(item._id, newStatus)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.snackBar.open(
            `Fraccionamiento ${newStatus === 'active' ? 'activado' : 'desactivado'}`,
            'OK',
            { duration: 2000 }
          );
          this.loadComplexes();
        },
        error: (err) => {
          this.snackBar.open('No se pudo cambiar el estado', 'Cerrar');
          console.error(err);
        },
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
        icon: 'delete_forever',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading.set(true);
        this.superService.deleteComplex(complex._id).subscribe({
          next: () => {
            this.snackBar.open('Fraccionamiento eliminado correctamente', 'Cerrar', {
              duration: 3000,
            });
            this.loadComplexes();
          },
          error: (err) => {
            this.isLoading.set(false);
            this.snackBar.open('Error al eliminar: ' + err.error.message, 'Cerrar');
          },
        });
      }
    });
  }
}