import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment'; // Importa el environment
import { Complex } from '../models/complex.model';

@Injectable({ providedIn: 'root' })
export class SuperAdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl; // Centralizamos la URL
  
  complexes = signal<Complex[]>([]);

  getComplexes() {
    // Ahora la URL será: http://localhost:3000/api/super/complexes
    return this.http.get<Complex[]>(`${this.baseUrl}/super/complexes`).pipe(
      tap(data => this.complexes.set(data))
    );
  }

  createComplex(payload: any) {
    return this.http.post<Complex>(`${this.baseUrl}/super/complexes`, payload).pipe(
      tap(newComplex => this.complexes.update(prev => [newComplex, ...prev]))
    );
  }

  updateComplex(id: string, data: any) {
    return this.http.patch(`${this.baseUrl}/super/complexes/${id}`, data);
  }

  changeStatus(id: string, newStatus: 'active' | 'inactive'): Observable<any> {
    return this.http.patch(`${this.baseUrl}/super/complexes/${id}/status`, { 
      subscription_status: newStatus 
    });
  }

  /**
 * Realiza un borrado lógico del fraccionamiento.
 * @param id Identificador único del complejo
 */
deleteComplex(id: string) {
  return this.http.delete(`${this.baseUrl}/super/complexes/${id}`).pipe(
    tap(() => {
      // Actualizamos la Signal localmente eliminando el item de la lista actual
      // Esto evita una petición GET extra y la UI responde al instante.
      this.complexes.update(list => list.filter(item => item._id !== id));
    })
  );
}
}