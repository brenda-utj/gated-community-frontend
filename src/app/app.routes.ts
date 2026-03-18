import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [

  // LANDING PAGE (PRIMERA PANTALLA)
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },

  // LOGIN
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  // SISTEMA (PROTEGIDO)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'super_admin'] },
        loadChildren: () =>
          import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
      },

      {
        path: 'resident',
        canActivate: [roleGuard],
        data: { roles: ['resident'] },
        loadChildren: () =>
          import('./features/resident/resident.routes').then(m => m.RESIDENT_ROUTES)
      },

      {
        path: 'security',
        canActivate: [roleGuard],
        data: { roles: ['security'] },
        children: [
          {
            path: 'scanner',
            loadComponent: () =>
              import('./features/security/scanner/scanner.component').then(m => m.ScannerComponent)
          }
        ]
      }
    ]
  },

  // SI LA RUTA NO EXISTE → LANDING
  { path: '**', redirectTo: '' }

];