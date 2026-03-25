import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';

// Puedes tiparlo mejor si quieres 👇
export interface Report {
  _id: string;
  subject: string;
  description: string;
  image_url?: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);
  private apiUri = environment.apiUrl;

  // 🔥 Signal reactivo
  reports = signal<Report[]>([]);

  // 📥 Obtener todos
  getAll() {
    return this.http.get<Report[]>(`${this.apiUri}/reports`).pipe(
      tap(data => this.reports.set(data))
    );
  }

  // ➕ Crear (con imagen opcional)
  create(formData: FormData) {
    return this.http.post<Report>(`${this.apiUri}/reports`, formData).pipe(
      tap(newReport => this.reports.update(prev => [newReport, ...prev]))
    );
  }

  // ❌ Eliminar (opcional si lo implementas en backend)
  delete(id: string) {
    return this.http.delete(`${this.apiUri}/reports/${id}`).pipe(
      tap(() => this.reports.update(prev => prev.filter(r => r._id !== id)))
    );
  }

  // ✏️ Actualizar status o datos
  update(id: string, report: Partial<Report>): Observable<Report> {
    return this.http.patch<Report>(`${this.apiUri}/reports/${id}`, report).pipe(
      tap(updated => {
        this.reports.update(prev =>
          prev.map(r => (r._id === id ? updated : r))
        );
      })
    );
  }
}