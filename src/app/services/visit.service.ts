import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

export interface Visit {
  _id: string;
  visitor_name: string;
  visitor_email: string;
  visit_date: Date;
  status: 'pending' | 'entered' | 'exited' | 'expired' | 'cancelled';
  qr_code_hash?: string;
}

@Injectable({ providedIn: 'root' })
export class VisitService {
  private http = inject(HttpClient);
  
  visits = signal<Visit[]>([]);

  getHistory() {
    return this.http.get<Visit[]>('/api/resident/visits/history').pipe(
      tap(data => this.visits.set(data))
    );
  }

  create(visitData: Partial<Visit>) {
    return this.http.post<Visit>('/api/resident/visits', visitData);
  }

  cancel(id: string) {
    return this.http.patch(`/api/resident/visits/${id}/cancel`, {});
  }
}