import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { PaymentService } from '../../../services/payment.service';
import { PaymentDetailDialogComponent } from '../dialogs/payment-detail-dialog/payment-detail-dialog.component';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-payment-verification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatBadgeModule,
  ],
  templateUrl: './payment-verification.component.html',
  styleUrls: ['./payment-verification.component.scss'],
})
export class PaymentVerificationComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  private allPayments = signal<any[]>([]);
  isLoading = signal(false);

  searchControl = new FormControl('');
  statusFilterControl = new FormControl('all');

  searchQuery = signal('');
  statusFilter = signal('all');

  statusOptions = [
    { value: 'all',      label: 'Todos los estatus' },
    { value: 'pending',  label: 'Pendiente' },
    { value: 'approved', label: 'Aprobado' },
    { value: 'rejected', label: 'Rechazado' },
  ];

  statusLabels: Record<string, string> = {
    pending:  'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  };

  displayedColumns = ['resident', 'house', 'month', 'amount', 'status', 'actions'];

  /** Pagos filtrados por búsqueda + estatus */
  filteredPayments = computed(() => {
    const q      = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    return this.allPayments().filter((p) => {
      const fullName = `${p.resident_id?.first_name ?? ''} ${p.resident_id?.last_name ?? ''}`.toLowerCase();
      const matchName   = !q || fullName.includes(q);
      const matchStatus = status === 'all' || p.status === status;
      return matchName && matchStatus;
    });
  });

  /** Contadores para los chips de resumen */
  counts = computed(() => {
    const all      = this.allPayments();
    return {
      total:    all.length,
      pending:  all.filter((p) => p.status === 'pending').length,
      approved: all.filter((p) => p.status === 'approved').length,
      rejected: all.filter((p) => p.status === 'rejected').length,
    };
  });

  ngOnInit() {
    this.loadAllPayments();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((v) => this.searchQuery.set(v ?? ''));

    this.statusFilterControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((v) => this.statusFilter.set(v ?? 'all'));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllPayments() {
    this.isLoading.set(true);
    this.paymentService.getHistory().subscribe({
      next: (data) => {
        this.allPayments.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  viewDetail(payment: any) {
    this.dialog
      .open(PaymentDetailDialogComponent, { width: '600px', data: payment })
      .afterClosed()
      .subscribe((result) => { if (result) this.loadAllPayments(); });
  }

  clearSearch() {
    this.searchControl.setValue('');
  }
}