import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payments`;

  // Obtener historial de pagos del residente
  getHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`);
  }

  // Subir el recibo (usando FormData por el archivo)
  uploadPayment(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  updatePaymentStatus(id: string, body: { status: string, notes?: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/verify/${id}`, body);
  }
}