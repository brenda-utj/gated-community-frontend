import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Servicios y Modelos (Asumiendo que los crearás)
import { ResidentService } from '../../../services/resident.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { VehicleFormDialogComponent } from './dialogs/vehicle-form-dialog/vehicle-form-dialog.component';
import { PetFormDialogComponent } from './dialogs/pet-form-dialog/pet-form-dialog.component';

@Component({
  selector: 'app-house-details',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './house-details.component.html',
  styleUrls: ['./house-details.component.scss']
})
export class HouseDetailsComponent implements OnInit {
  private residentService = inject(ResidentService);
  private dialog = inject(MatDialog);
  currentUser = signal<any>(JSON.parse(localStorage.getItem('user') || '{}'));
  
  // Signals
  house = signal<any>(null);
  vehicles = signal<any[]>([]);
  pets = signal<any[]>([]);

  // Signal computada para obtener la dirección de la casa de forma segura
  houseAddress = computed(() => {
    const house = this.currentUser()?.house;
    return house ? house.address : 'Sin dirección asignada';
  });

  // Signal computada para el nombre del complejo
  complexName = computed(() => {
    return this.currentUser()?.complex?.name || 'Mi Complejo';
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.residentService.getMyHouse().subscribe({
      next: (data) => {
        this.house.set(data);
        this.vehicles.set(data.vehicles || []);
        this.pets.set(data.pets || []);
      },
      error: (err) => console.error('Error al cargar casa', err)
    });
  }

  deleteVehicle(vehicle: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: '¿Eliminar vehículo?',
        message: `¿Estás seguro de que deseas eliminar el vehículo con placas <b>${vehicle.plate}</b>?`,
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.residentService.deleteVehicle(vehicle._id).subscribe({
          next: (updatedHouse) => {
            this.vehicles.set(updatedHouse.vehicles);
            // Opcional: mostrar snackbar de éxito
          },
          error: (err) => console.error('Error al eliminar vehículo', err)
        });
      }
    });
  }

  // --- ELIMINAR MASCOTA ---
  deletePet(pet: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: '¿Eliminar mascota?',
        message: `¿Deseas dar de baja a <b>${pet.name}</b> del registro de tu vivienda?`,
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.residentService.deletePet(pet._id).subscribe({
          next: (updatedHouse) => {
            this.pets.set(updatedHouse.pets);
          },
          error: (err) => console.error('Error al eliminar mascota', err)
        });
      }
    });
  }


  addVehicle() {
    // Nota: Deberás crear el VehicleFormDialogComponent similar al de miembros
    const dialogRef = this.dialog.open(VehicleFormDialogComponent, {
      width: '500px',
      disableClose: true // Evita que se cierre al hacer clic fuera
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Si el diálogo devolvió 'true', recargamos la casa para ver el nuevo vehículo
        this.loadData(); 
      }
    });
  }
  
  /**
   * Abre el diálogo para editar un vehículo existente.
   */
  editVehicle(vehicle: any) {
    const dialogRef = this.dialog.open(VehicleFormDialogComponent, {
      width: '500px',
      data: vehicle // Pasamos los datos del vehículo para pre-llenar el form
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  confirmDelete(item: any, type: 'vehicle' | 'pet') {
    const isVehicle = type === 'vehicle';
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: isVehicle ? '¿Eliminar vehículo?' : '¿Eliminar mascota?',
        message: isVehicle 
          ? `¿Estás seguro de eliminar el vehículo con placas <b>${item.plate}</b>?`
          : `¿Estás seguro de eliminar a <b>${item.name}</b> del registro?`,
        color: 'warn'
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const request = isVehicle 
          ? this.residentService.deleteVehicle(item._id)
          : this.residentService.deletePet(item._id);
  
        request.subscribe({
          next: (updatedHouse) => {
            // Actualizamos la signal correspondiente según el tipo
            if (isVehicle) {
              this.vehicles.set(updatedHouse.vehicles);
            } else {
              this.pets.set(updatedHouse.pets);
            }
          },
          error: (err) => console.error(`Error al eliminar ${type}`, err)
        });
      }
    });
  }

  addPet() {
    const dialogRef = this.dialog.open(PetFormDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }
}