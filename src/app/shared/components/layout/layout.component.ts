import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// Angular Material
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HasRoleDirective } from '../../../core/directives/has-role.directive';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    HasRoleDirective
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  private authService = inject(AuthService);
  
  // Usamos una Signal para controlar el estado del sidebar
  isOpened = signal(true);
  
  // Obtenemos el usuario actual desde el servicio (que ya es una Signal)
  currentUser = this.authService.currentUser as any;

  toggleSidenav(): void {
    this.isOpened.update(value => !value);
  }

  // Helper para saber si mostrar la sección de ubicación
  hasLocationInfo = computed(() => {
    const user = this.currentUser() as any;
    return !!(user?.complex || user?.house);
  });

  logout(): void {
    this.authService.logout();
  }
}