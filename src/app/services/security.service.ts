import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Visit {
  _id: string;
  visitor_name: string;
  visitor_email: string;
  visit_date: Date;
  status: 'pending' | 'entered' | 'exited' | 'expired' | 'cancelled';
  qr_code_hash?: string;
}

@Injectable({ providedIn: 'root' })
export class SecurityService {
  private http = inject(HttpClient);
  
  visits = signal<Visit[]>([]);

  getRecentMovements(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/security/recent-movements`);
  }
}