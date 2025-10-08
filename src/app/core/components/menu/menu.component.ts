import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService, User } from 'src/app/auth/services/user.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  user: User | null = null;
  equipoGuardado = false;
  showEquipoMenu = false; // ✅ control del acordeón

  constructor(private router: Router, public userService: UserService) {}

  ngOnInit(): void {
    this.loadUserAndTeam();
    window.addEventListener('storage', () => this.loadUserAndTeam());
  }

  loadUserAndTeam(): void {
    this.user = this.userService.getUser();

    if (this.user) {
      const equipo = localStorage.getItem(`mi_equipo_${this.user.email}`);
      this.equipoGuardado = !!equipo;
    } else {
      this.equipoGuardado = false;
    }
  }

  /** ✅ Desplegar/ocultar submenú */
  toggleEquipoMenu(): void {
    this.showEquipoMenu = !this.showEquipoMenu;
  }

  /** ✅ Cierra menú y navega */
  navigate(route: string): void {
    this.router.navigate([route]);
    this.close.emit();
  }

  /** ✅ Si intenta abrir Mi equipo sin login */
  openTeam(ev?: MouseEvent): void {
    if (this.userService.isLoggedIn()) {
      return; // el routerLink funciona normalmente
    }

    ev?.preventDefault();
    Swal.fire({
      icon: 'info',
      title: 'Inicia sesión',
      text: 'Necesitas iniciar sesión para crear tu equipo.',
      confirmButtonText: 'Ir a iniciar sesión',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
    }).then((res) => {
      if (res.isConfirmed) {
        this.router.navigate(['/login']);
        this.close.emit();
      }
    });
  }
}
