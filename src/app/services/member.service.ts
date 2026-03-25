import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class MemberService {
  private http = inject(HttpClient);
  private apiUri = environment.apiUrl;
  
  // Signal para almacenar la lista y que la UI reaccione
  members = signal<User[]>([]);

  getAll() {
    return this.http.get<User[]>(`${this.apiUri}/admin/members`).pipe(
      tap(data => this.members.set(data))
    );
  }

  create(memberData: Partial<User>) {
    return this.http.post<User>(`${this.apiUri}/admin/members`, memberData).pipe(
      tap(newUser => this.members.update(prev => [newUser, ...prev]))
    );
  }

  delete(id: string) {
    return this.http.delete(`${this.apiUri}/admin/members/${id}`).pipe(
      tap(() => this.members.update(prev => prev.filter(m => m.id !== id)))
    );
  }

  update(id: string, member: any): Observable<any> {
    return this.http.patch(`${this.apiUri}/admin/members/${id}`, member);
  }
}