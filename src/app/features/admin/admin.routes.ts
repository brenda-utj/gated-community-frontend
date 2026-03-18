import { Routes } from '@angular/router';
import { HousesComponent } from './houses/houses.component';
import { roleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'members',
    loadComponent: () => import('./members/members.component').then(m => m.MembersComponent)
  },
  {
    path: 'houses',
    component: HousesComponent,
    canActivate: [roleGuard], 
    data: { roles: ['admin', 'super_admin'] } // Asegúrate de que 'admin' esté aquí
  },
  {
    path: 'payments', // URL: /dashboard/admin/payments
    loadComponent: () => import('./payment-verification/payment-verification.component').then(m => m.PaymentVerificationComponent)
  }
];