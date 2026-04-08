import { Routes } from '@angular/router';

export const RESIDENT_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'house',
        loadComponent: () => import('../houses/house-details/house-details.component').then(m => m.HouseDetailsComponent)
      },
      {
        path: 'visits',
        loadComponent: () => import('../visits/visits.component').then(m => m.VisitsComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('../payments/payment-list/payment-list.component').then(m => m.PaymentListComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('../reports/reports-list/reports-list.component').then(m => m.ReportsListComponent)
      },
       {
        path: 'reservations',
        loadComponent: () => import('../reservations/reservations-list/reservations-list.component').then(m => m.ReservationsListComponent)
      },
      {
        path: '',
        redirectTo: 'house',
        pathMatch: 'full'
      }
    ]
  }
];