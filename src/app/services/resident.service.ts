import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResidentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/resident`;

  // --- GESTIÓN DE VIVIENDA (VEHÍCULOS Y MASCOTAS) ---

  /**
   * Obtiene la información de la casa asignada al residente actual
   */
  getMyHouse(): Observable<any> {
    return this.http.get(`${this.apiUrl}/house`);
  }

  /**
   * Registra un vehículo nuevo en la casa
   * @param vehicle { plate: string, brand: string, model: string, color: string }
   */
  addVehicle(vehicle: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/house/vehicles`, vehicle);
  }

  /**
   * Elimina un vehículo por su ID
   */
  deleteVehicle(vehicleId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/house/vehicles/${vehicleId}`);
  }

  /**
   * Registra una mascota nueva
   * @param pet { name: string, type: string, breed: string }
   */
  addPet(pet: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/house/pets`, pet);
  }

  // src/app/services/resident.service.ts

getComplexDirectory(): Observable<any[]> {
  // El backend se encargará de saber qué complejo es mediante el token (JWT)
  return this.http.get<any[]>(`${environment.apiUrl}/users/complex-directory`);
}

  /**
   * Elimina una mascota por su ID
   */
  deletePet(petId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/house/pets/${petId}`);
  }

  // --- PAGOS ---

  /**
   * Sube el comprobante de pago de mantenimiento
   */
  uploadPaymentReceipt(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments/upload`, formData);
  }

  /**
   * Actualiza los datos de un vehículo existente
   * @param vehicleId ID único del vehículo en la DB
   * @param vehicleData Objeto con los campos a actualizar
   */
  updateVehicle(vehicleId: string, vehicleData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/house/vehicles/${vehicleId}`, vehicleData);
  }

  /**
   * Actualiza los datos de una mascota existente
   * @param petId ID único de la mascota en la DB
   * @param petData Objeto con los campos a actualizar
   */
  updatePet(petId: string, petData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/house/pets/${petId}`, petData);
  }
}