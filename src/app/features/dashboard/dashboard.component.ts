import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

// Component
import { VisitRequestDialogComponent } from '../visits/visit-request/visit-request-dialog.component';

import { VisitService } from '../../services/visit.service';

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
export class DashboardComponent {

  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private visitService = inject(VisitService); // ✅ agregado

  // Signal del usuario
  user = this.authService.currentUser;

  // Computed
  welcomeMessage = computed(() => {
    const name = this.user()?.first_name || 'Usuario';
    return `¡Bienvenido, ${name}!`;
  });

  openRequestDialog() {
    const dialogRef = this.dialog.open(VisitRequestDialogComponent, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadVisits();
    });
  }

  loadVisits() {
    this.visitService.getVisits().subscribe({
      next: (res: any) => console.log('Visitas:', res),
      error: (err: any) => console.error(err)
    });
  }
}