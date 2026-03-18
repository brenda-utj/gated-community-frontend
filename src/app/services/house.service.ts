import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { House } from '../models/house.model';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HouseService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin/houses`;

  houses = signal<House[]>([]);

  getAll() {
    return this.http.get<House[]>(this.baseUrl).pipe(
      tap(data => this.houses.set(data))
    );
  }

  createHouse(payload: Partial<House>) {
    return this.http.post<House>(this.baseUrl, payload).pipe(
      tap(newHouse => this.houses.update(prev => [newHouse, ...prev]))
    );
  }

  updateHouse(id: string, payload: Partial<House>) {
    return this.http.patch<House>(`${this.baseUrl}/${id}`, payload).pipe(
      tap(updated => this.houses.update(list => 
        list.map(h => h._id === id ? updated : h)
      ))
    );
  }

  deleteHouse(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.houses.update(list => list.filter(h => h._id !== id)))
    );
  }
}