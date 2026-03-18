import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MemberService {
  private http = inject(HttpClient);
  
  // Signal para almacenar la lista y que la UI reaccione
  members = signal<User[]>([]);

  getAll() {
    return this.http.get<User[]>('/api/admin/members').pipe(
      tap(data => this.members.set(data))
    );
  }

  create(memberData: Partial<User>) {
    return this.http.post<User>('/api/admin/members', memberData).pipe(
      tap(newUser => this.members.update(prev => [newUser, ...prev]))
    );
  }

  delete(id: string) {
    return this.http.delete(`/api/admin/members/${id}`).pipe(
      tap(() => this.members.update(prev => prev.filter(m => m.id !== id)))
    );
  }

  update(id: string, member: any): Observable<any> {
    return this.http.patch(`/api/admin/members/${id}`, member);
  }
}