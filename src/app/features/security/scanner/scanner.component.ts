import { Component, inject, OnInit, signal } from '@angular/core';
import { SecurityService } from '../../../services/security.service';
import { MatIcon } from "@angular/material/icon";
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [MatIcon, CommonModule, MatTableModule, MatCardModule],
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.scss'
})
export class ScannerComponent implements OnInit {
  private securityService = inject(SecurityService);
  
  movements = signal<any[]>([]);
  displayedColumns: string[] = ['time', 'visitor', 'house', 'type', 'status'];

  ngOnInit() {
    this.loadMovements();
    // Refresh cada 30 segundos para ver nuevos escaneos
    setInterval(() => this.loadMovements(), 30000);
  }

  loadMovements() {
    this.securityService.getRecentMovements().subscribe({
      next: (data) => this.movements.set(data),
      error: (err) => console.error('Error al cargar movimientos', err)
    });
  }
}
