import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ResidentService } from '../../../services/resident.service'; // O el servicio que use el complejo

@Component({
  selector: 'app-resident-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './resident-directory.component.html',
  styleUrls: ['./resident-directory.component.scss']
})
export class ResidentDirectoryComponent implements OnInit {
  private residentService = inject(ResidentService);
  
  allResidents = signal<any[]>([]);
  searchTerm = signal('');

  // Filtro inteligente por nombre o dirección de casa
  filteredResidents = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.allResidents().filter(r => 
      r.first_name.toLowerCase().includes(term) || 
      r.last_name.toLowerCase().includes(term) ||
      r.house_id?.address?.toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.loadDirectory();
  }

  loadDirectory() {
    // El servicio debe apuntar a un endpoint que traiga los usuarios con rol 'resident' del complejo
    this.residentService.getComplexDirectory().subscribe(data => {
      this.allResidents.set(data);
    });
  }

  callResident(phone: string) {
    window.open(`tel:${phone}`, '_self');
  }

  whatsappResident(phone: string, name: string) {
    const msg = encodeURIComponent(`Hola ${name}, le hablamos de la caseta de seguridad.`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  }
}