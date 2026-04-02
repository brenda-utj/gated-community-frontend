import { OnInit, inject, ViewChild, Component, signal } from "@angular/core";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MemberService } from "../../../services/member.service";
import { MemberFormDialogComponent } from "./member-form/member-form-dialog.component";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCardModule } from "@angular/material/card";
import { ConfirmDialogComponent } from "../../../shared/components/confirm-dialog/confirm-dialog.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { SuperAdminService } from "../../../services/super-admin.service";

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
    MatCardModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {
  private memberService = inject(MemberService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private complexService = inject(SuperAdminService);

  // signals y controles para filtros
  complexes = signal<any[]>([]); 
  complexFilterControl = new FormControl('all');
  roleFilterControl = new FormControl('all');
  
  // Catálogo de roles
  roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'resident', label: 'Residente' },
    { value: 'security', label: 'Vigilante' },
    { value: 'super_admin', label: 'Super Admin' }
  ];

  displayedColumns: string[] = ['name', 'house', 'email', 'phone', 'role', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isSuperAdmin = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.checkRoleAndColumns();
    this.setupFilterPredicate();
    this.loadMembers();

    if (this.isSuperAdmin) {
      this.loadComplexes();
    }
  }

  private checkRoleAndColumns() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.isSuperAdmin = user.role === 'super_admin';
      if (this.isSuperAdmin) {
        this.displayedColumns = ['complex', ...this.displayedColumns];
      }
    }
  }

  private loadComplexes() {
    this.complexService.getComplexes().subscribe({
      next: (data) => this.complexes.set(data),
      error: (err) => console.error('Error al cargar complejos', err)
    });
  }

  private setupFilterPredicate() {
    this.dataSource.filterPredicate = (data, filter) => {
      const searchTerms = JSON.parse(filter);
      
      // 1. Filtro de Texto (Nombre + Apellido)
      const fullName = `${data.first_name} ${data.last_name}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerms.text);

      // 2. Filtro de Complejo
      const matchesComplex = searchTerms.complexId === 'all' || 
                             data.complex_id?._id === searchTerms.complexId;

      // 3. Filtro de Rol
      const matchesRole = searchTerms.role === 'all' || 
                          data.role === searchTerms.role;

      return matchesSearch && matchesComplex && matchesRole;
    };
  }

  applyFilters() {
    // Buscamos el valor del input de texto de forma segura
    const searchInput = document.querySelector('.search-field input') as HTMLInputElement;
    const textValue = searchInput ? searchInput.value.trim().toLowerCase() : '';
    
    const complexValue = this.complexFilterControl.value || 'all';
    const roleValue = this.roleFilterControl.value || 'all';

    this.dataSource.filter = JSON.stringify({
      text: textValue,
      complexId: complexValue,
      role: roleValue
    });

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadMembers() {
    this.memberService.getAll().subscribe(data => {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
      // Aplicar filtros iniciales por si hay valores por defecto
      this.applyFilters();
    });
  }

  openMemberForm(member?: any) {
    const dialogRef = this.dialog.open(MemberFormDialogComponent, { 
      width: '550px',
      data: member 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadMembers();
    });
  }

  deleteMember(member: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: '¿Eliminar miembro?',
        message: `Estás a punto de eliminar a <b>${member.first_name} ${member.last_name}</b>. Esta acción no se puede deshacer.`,
        confirmText: 'SÍ, ELIMINAR',
        cancelText: 'CANCELAR',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.memberService.delete(member._id).subscribe({
          next: () => {
            this.snackBar.open('Miembro eliminado correctamente', 'Cerrar', { duration: 3000 });
            this.loadMembers();
          },
          error: (err) => {
            this.snackBar.open('Error al eliminar: ' + (err.error?.message || 'Revisa tu conexión'), 'Cerrar');
          }
        });
      }
    });
  }

    roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Administrador',
    resident: 'Residente',
    security: 'Vigilancia'
  };
}