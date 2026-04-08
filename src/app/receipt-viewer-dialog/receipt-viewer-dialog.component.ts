import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIcon } from "@angular/material/icon";


@Component({
  selector: 'app-receipt-viewer-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIcon],
  templateUrl: './receipt-viewer-dialog.component.html',
  styleUrl: './receipt-viewer-dialog.component.scss'
})
export class ReceiptViewerDialogComponent {
  imageSrc: string;

  constructor(
    public dialogRef: MatDialogRef<ReceiptViewerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { base64: string; mime: string; status: string; month: string, createdAt: string }
  ) {
    this.imageSrc = `data:${data.mime};base64,${data.base64}`;
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      pending:  'Pendiente',
      verified: 'Verificado',
      rejected: 'Rechazado'
    };
    return labels[status] || status;
  }
}