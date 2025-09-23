import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from 'src/app/auth/services/user.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  @Output() close = new EventEmitter<void>(); // para cerrar el sidenav tras navegar

  constructor(private router: Router, public userService: UserService) {}

  // --- Mi equipo ---
  openTeam(ev?: MouseEvent) {
    if (this.userService.isLoggedIn()) {
      this.close.emit(); // deja que routerLink navegue a /equipos/crear
      return;
    }
    this.blockIfNotLogged(ev, 'Necesitas iniciar sesión para crear tu equipo.');
  }

  // --- Perfil ---
  openProfile(ev?: MouseEvent) {
    if (this.userService.isLoggedIn()) {
      this.close.emit(); // deja que routerLink navegue a /perfil
      return;
    }
    this.blockIfNotLogged(ev, 'Necesitas iniciar sesión para ver tu perfil.');
  }

  // Helper: muestra alerta y redirige a login
  private blockIfNotLogged(ev: MouseEvent | undefined, message: string) {
    ev?.preventDefault();
    Swal.fire({
      icon: 'info',
      title: 'Inicia sesión',
      text: message,
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
