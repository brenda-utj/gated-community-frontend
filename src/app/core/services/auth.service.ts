import { tap } from "rxjs";
import { AuthResponse, User } from "../../models/user.model";
import { inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  currentUser = signal<User | null>(null);

  constructor() {
    // Intentamos recuperar al usuario al arrancar el servicio
    this.hydrateUser();
  }

  private hydrateUser() {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      // Si tenemos ambos, llenamos la Signal de nuevo
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  login(credentials: any) {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap((res: AuthResponse) => {
        localStorage.setItem('token', res.token);
        // IMPORTANTE: Guardamos también el objeto usuario
        localStorage.setItem('user', JSON.stringify(res.user));
        
        this.currentUser.set(res.user);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Limpiamos todo
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}