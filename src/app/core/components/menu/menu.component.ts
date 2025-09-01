import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  @Output() close = new EventEmitter<void>(); // opcional: para cerrar el sidenav tras navegar

  constructor(private router: Router, public userService: UserService) {}

  openTeam(ev?: MouseEvent) {
    if (this.userService.isLoggedIn()) {
      // dejar que el routerLink navegue y cerrar el menú
      this.close.emit();
      return;
    }

    // Bloquea la navegación del routerLink y redirige a login con aviso
    ev?.preventDefault();
    Swal.fire({
      icon: 'info',
      title: 'Inicia sesión',
      text: 'Necesitas iniciar sesión para crear tu equipo.',
      confirmButtonText: 'Ir a iniciar sesión',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
    }).then(res => {
      if (res.isConfirmed) {
        this.router.navigate(['/login']);
        this.close.emit();
      }
    });
  }
}
