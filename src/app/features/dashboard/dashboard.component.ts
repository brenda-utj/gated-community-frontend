import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

// Component
import { VisitRequestDialogComponent } from '../visits/visit-request/visit-request-dialog.component';

import { VisitService } from '../../services/visit.service';

import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private visitService = inject(VisitService);
  private http = inject(HttpClient); // ✅ agregado

  // Signal del usuario
  user = this.authService.currentUser;

  // Computed
  welcomeMessage = computed(() => {
    const name = this.user()?.first_name || 'Usuario';
    return `¡Bienvenido, ${name}!`;
  });

  ngOnInit(): void {
    const role = this.user()?.role;

    // 🔐 Solo admin y super_admin ven gráficas
    if (role === 'admin' || role === 'super_admin') {
      this.loadPieChart();
      this.loadBarChart();
    }
  }

  // 🥧 PIE CHART (casas por complejo)
  loadPieChart() {
    this.http.get<any[]>('/api/dashboard/houses-by-complex')
      .subscribe({
        next: (data) => {

          const labels = data.map(item => item.complejo);
          const values = data.map(item => item.total);

          new Chart('pieChart', {
            type: 'pie',
            data: {
              labels,
              datasets: [{
                data: values,
                backgroundColor: [
                  '#FF6384',
                  '#36A2EB',
                  '#FFCE56',
                  '#4BC0C0',
                  '#9966FF'
                ]
              }]
            }
          });

        },
        error: (err) => {
          console.error('Error cargando pie chart:', err);
        }
      });
  }

  // 📊 BAR CHART (residentes por complejo)
  loadBarChart() {
    this.http.get<any[]>('/api/dashboard/residents-by-complex')
      .subscribe({
        next: (data) => {

          const labels = data.map(item => item.complejo);
          const values = data.map(item => item.residentes);

          new Chart('barChart', {
            type: 'bar',
            data: {
              labels,
              datasets: [{
                label: 'Residentes',
                data: values,
                backgroundColor: '#36A2EB'
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  display: true
                }
              }
            }
          });

        },
        error: (err) => {
          console.error('Error cargando bar chart:', err);
        }
      });
  }

  // 🔹 Dialogo de visitas
  openRequestDialog() {
    const dialogRef = this.dialog.open(VisitRequestDialogComponent, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadVisits();
    });
  }

  // 🔹 Visitas
  loadVisits() {
    this.visitService.getVisits().subscribe({
      next: (res: any) => console.log('Visitas:', res),
      error: (err: any) => console.error(err)
    });
  }
}