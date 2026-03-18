import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  @Input() set hasRole(roles: string[]) {
    // En lugar de effect(), evaluamos cada vez que el Input cambie
    // o cuando el estado del usuario cambie. 
    // Para asegurar reactividad si el usuario cambia, podemos usar un helper:
    this.updateView(roles);
  }

  constructor() {
    // Al usar Signals, podemos suscribirnos a cambios de forma segura aquí
    // Pero para una directiva de permisos, evaluar en el setter suele ser suficiente
    // ya que el login/logout destruye y recrea componentes.
  }

  private updateView(roles: string[]) {
    const user = this.authService.currentUser();
    
    // Verificamos si el usuario existe y su rol está en la lista permitida
    if (user && roles.includes(user.role)) {
      // Si ya está renderizado, no hacemos nada. Si no, lo creamos.
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    } else {
      // Si no tiene permiso, limpiamos el contenedor
      this.viewContainer.clear();
    }
  }
}