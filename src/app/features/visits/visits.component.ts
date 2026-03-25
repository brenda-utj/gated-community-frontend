import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitService, Visit } from '../../services/visit.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { VisitRequestDialogComponent } from './visit-request/visit-request-dialog.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'app-visits',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
    QRCodeModule
  ],
  templateUrl: './visits.component.html',
  styleUrls: ['./visits.component.scss']
})
export class VisitsComponent implements OnInit {
  private visitService = inject(VisitService);
  private dialog = inject(MatDialog);

  visits = this.visitService.visits;

  ngOnInit() {
    this.loadVisits();
  }

  loadVisits() {
    this.visitService.getHistory().subscribe();
  }

  openRequestDialog() {
    const dialogRef = this.dialog.open(VisitRequestDialogComponent, { width: '450px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadVisits();
    });
  }

  cancelVisit(id: string): void {
    this.visitService.cancel(id).subscribe(() => this.loadVisits());
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'pending': 'primary',
      'entered': 'accent',
      'exited': 'warn',
      'cancelled': 'default'
    };
    return colors[status] || 'default';
  }

  getStatusLabel(status: string): string {
  const labels: any = {
    pending: 'Pendiente',
    entered: 'Ingresó',
    exited: 'Salió',
    cancelled: 'Cancelado'
  };

  return labels[status] || status;
}

  async shareQR(qrElementRef: any, visit: any) {
    const canvas: HTMLCanvasElement = qrElementRef.qrcElement.nativeElement.querySelector('canvas');

    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');

    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `Pase-${visit.visitor_name}.png`, {
      type: 'image/png'
    });

    // Compartir (WhatsApp, etc.)
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: 'Pase de acceso',
          text: `Hola ${visit.visitor_name}, este es tu pase de acceso.`,
          files: [file]
        });
      } catch (err) {
        console.log('Cancelado o error:', err);
      }
    } else {
      //Fallback: descargar
      const link = document.createElement('a');
      link.download = `Acceso-${visit.visitor_name}.png`;
      link.href = dataUrl;
      link.click();
    }
  }

  downloadQR(qrElementRef: any, visit: any) {
    const canvas: HTMLCanvasElement =
      qrElementRef.qrcElement.nativeElement.querySelector('canvas');

    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `Pase-${visit.visitor_name}.png`;
    link.click();
  }
}