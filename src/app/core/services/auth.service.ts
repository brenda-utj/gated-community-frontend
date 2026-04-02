import { tap } from "rxjs";
import { AuthResponse, User } from "../../models/user.model";
import { inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUri = environment.apiUrl;
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
    return this.http.post<AuthResponse>(`${this.apiUri}/auth/login`, credentials).pipe(
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
    console.trace('🚨 LOGOUT TRIGGERED');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}