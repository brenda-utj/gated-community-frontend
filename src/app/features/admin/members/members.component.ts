// ... (tus imports se mantienen igual)

import { OnInit, inject, ViewChild, Component } from "@angular/core";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MemberService } from "../../../services/member.service";
import { MemberFormDialogComponent } from "./member-form/member-form-dialog.component";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCard } from "@angular/material/card";
import { ConfirmDialogComponent } from "../../../shared/components/confirm-dialog/confirm-dialog.component";

@Component({

  selector: 'app-members',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatCard
],

  templateUrl: './members.component.html'

})
export class MembersComponent implements OnInit {
  private memberService = inject(MemberService);
  private dialog = inject(MatDialog);
  
  displayedColumns: string[] = ['name', 'email', 'role', 'house', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.loadMembers();
    
    // Custom filter predicate para buscar por casa o nombre completo
    this.dataSource.filterPredicate = (data, filter) => {
      const fullName = `${data.first_name} ${data.last_name}`.toLowerCase();
      const houseInfo = data.house_id ? `${data.house_id.street} ${data.house_id.house_number}`.toLowerCase() : '';
      return fullName.includes(filter) || data.email.toLowerCase().includes(filter) || houseInfo.includes(filter);
    };
  }

  loadMembers() {
    this.memberService.getAll().subscribe(data => {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  deleteMember(member: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: '¿Eliminar miembro?',
        message: `Estás a punto de eliminar a <b>${member.first_name} ${member.last_name}</b>. Esta acción no se puede deshacer.`,
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.memberService.delete(member._id).subscribe({
          next: () => {
            this.loadMembers();
            // Opcional: Mostrar SnackBar de éxito
          },
          error: (err) => console.error('Error al eliminar:', err)
        });
      }
    });
  }

  openMemberForm(member?: any) {
    // Si pasas 'member', el diálogo lo recibe para edición
    const dialogRef = this.dialog.open(MemberFormDialogComponent, { 
      width: '550px',
      data: member // El diálogo debe manejar si es 'edit' o 'create'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadMembers();
    });
  }
}