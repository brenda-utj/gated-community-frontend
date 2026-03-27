import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface Visit {
  _id: string;
  visitor_name: string;
  visitor_email: string;
  visit_date: Date;
  expiry_date: Date;
  status: 'pending' | 'entered' | 'exited' | 'expired' | 'cancelled';
  qr_code_hash?: string;
}

interface VisitResponse {
  data: Visit[];
  pagination: {
    total:      number;
    page:       number;
    limit:      number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class VisitService {
  private http   = inject(HttpClient);
  private apiUri = environment.apiUrl;

  visits      = signal<Visit[]>([]);
  totalVisits = signal<number>(0);

  // ✅ Renombrado de getHistory → getVisits, ahora con paginación
  getVisits(page: number = 1, limit: number = 6): Observable<VisitResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

      return this.http.get<VisitResponse>(`${this.apiUri}/resident/visits/history`, { params }).pipe(
      tap(res => {
        this.visits.set(res.data);
        this.totalVisits.set(res.pagination.total);
      })
    );
  }

  create(visitData: Partial<Visit>) {
    return this.http.post<Visit>(`${this.apiUri}/resident/visits`, visitData);
  }

  cancel(id: string) {
    return this.http.patch(`${this.apiUri}/resident/visits/${id}/cancel`, {});
  }
}