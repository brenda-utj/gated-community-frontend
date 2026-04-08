import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReportService } from '../../../services/report.service';
import { ReportsDialogComponent } from '../report-dialog/reports-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

const PAGE_SIZE = 6;

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsListComponent implements OnInit {
  private reportService = inject(ReportService);
  private dialog = inject(MatDialog);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private API_URL = environment.apiUrl + '/reports';

  private authService = inject(AuthService);
isAdmin = computed(() => this.authService.currentUser()?.role === 'admin');

  // --- State ---
  reports = this.reportService.reports;
  loading = signal(true);
  searchQuery = signal('');
  visibleCount = signal(PAGE_SIZE);
  loadingMore = signal(false);

  // --- Filtered list (search across subject, description, user name) ---
  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.reports();
    if (!q) return all;
    return all.filter((r) => {
      const subject = (r.subject ?? '').toLowerCase();
      const description = (r.description ?? '').toLowerCase();
      const firstName = ((r as any).user_id?.first_name ?? '').toLowerCase();
      const lastName = ((r as any).user_id?.last_name ?? '').toLowerCase();
      return (
        subject.includes(q) ||
        description.includes(q) ||
        firstName.includes(q) ||
        lastName.includes(q)
      );
    });
  });

  // --- Paginated slice for infinite scroll ---
  visible = computed(() => this.filtered().slice(0, this.visibleCount()));

  hasMore = computed(() => this.visibleCount() < this.filtered().length);

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports() {
    this.loading.set(true);
    this.reportService.getAll().subscribe({
      next: () => {
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  onSearch(value: string) {
    this.searchQuery.set(value);
    this.visibleCount.set(PAGE_SIZE); // reset pagination on new search
  }

  // --- Infinite scroll trigger on host scroll ---
  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.loadingMore() || !this.hasMore()) return;
    const scrolled = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 200;
    if (scrolled >= threshold) {
      this.loadMore();
    }
  }

  loadMore() {
    if (!this.hasMore()) return;
    this.loadingMore.set(true);
    // Simulate async chunk load (data is local, just delay UX)
    setTimeout(() => {
      this.visibleCount.update((v) => v + PAGE_SIZE);
      this.loadingMore.set(false);
      this.cdr.markForCheck();
    }, 400);
  }

  // --- Dialog ---
  openReportDialog(report: any = null) {
    const dialogRef = this.dialog.open(ReportsDialogComponent, {
      width: '500px',
      data: report ? { ...report } : null,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadReports();
    });
  }

  editReport(report: any) {
    this.openReportDialog(report);
  }

  deleteReport(report: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Eliminar reporte',
        message: `¿Seguro que deseas eliminar el reporte <strong>${report.subject}</strong>?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        color: 'warn',
        icon: 'delete',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      const token = localStorage.getItem('token');
      this.http
        .delete(`${this.API_URL}/${report._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .subscribe(() => this.loadReports());
    });
  }

  // --- Helpers ---
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      open: 'Abierto',
      in_progress: 'En proceso',
      closed: 'Cerrado',
    };
    return labels[status] ?? status;
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      open: 'schedule',
      in_progress: 'build',
      closed: 'check_circle',
    };
    return icons[status] ?? 'help';
  }

  getUserName(report: any): string {
    const u = report.user_id;
    if (!u) return '—';
    return `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim();
  }

  getHouseLabel(report: any): string {
    const h = report.house_id;
    if (!h) return '—';
    return `${h.street ?? ''} ${h.house_number ?? ''}`.trim();
  }

  trackById(_: number, item: any) {
    return item._id;
  }

  updateStatus(report: any, status: 'in_progress' | 'closed') {
    const token = localStorage.getItem('token');
    this.http
      .put(
        `${this.API_URL}/${report._id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .subscribe(() => this.loadReports());
  }
}
