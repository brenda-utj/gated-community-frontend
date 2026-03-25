import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReportService } from '../../../services/report.service';
import { ReportsDialogComponent } from '../report-dialog/reports-dialog.component';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsListComponent {
   private reportService = inject(ReportService);
  private dialog = inject(MatDialog);

  // 🔥 Signal reactivo
  reports = this.reportService.reports;

  // 📊 Columnas tabla
  displayedColumns: string[] = [
    'subject',
    'description',
    'status',
    'date',
    'image'
  ];

  ngOnInit(): void {
    this.loadReports();
  }

  // 📥 Cargar reportes
  loadReports() {
    this.reportService.getAll().subscribe();
  }

  // ➕ Abrir dialog
  openReportDialog() {
    const dialogRef = this.dialog.open(ReportsDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadReports();
    });
  }

  // 🔄 Traducir status
  getStatusLabel(status: string): string {
    const labels: any = {
      open: 'Abierto',
      in_progress: 'En proceso',
      closed: 'Cerrado'
    };

    return labels[status] || status;
  }

  // 🎨 Icono por status
  getStatusIcon(status: string): string {
    const icons: any = {
      open: 'schedule',
      in_progress: 'build',
      closed: 'check_circle'
    };

    return icons[status] || 'help';
  }

  // 🎨 Color opcional (si quieres usar mat-chip después)
  getStatusColor(status: string): string {
    const colors: any = {
      open: 'warn',
      in_progress: 'accent',
      closed: 'primary'
    };

    return colors[status] || 'default';
  }
}
