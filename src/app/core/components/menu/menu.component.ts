import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { UserService, User } from 'src/app/auth/services/user.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();

  user: User | null = null;
  equipoGuardado = false;
  showEquipoMenu = false;

  private subs = new Subscription();

  constructor(private router: Router, public userService: UserService) {}

  ngOnInit(): void {
    // 🧩 Suscribirse a los cambios del usuario (login / logout)
    this.subs.add(
      this.userService.user$.subscribe(() => this.loadUserAndTeam())
    );

    // 🧩 Cargar inicialmente y escuchar cambios del localStorage
    this.loadUserAndTeam();
    window.addEventListener('storage', () => this.loadUserAndTeam());

    // 🧩 Detectar inicio de sesión con Google
    window.addEventListener('googleLoginSuccess', () => this.loadUserAndTeam());
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    window.removeEventListener('storage', () => this.loadUserAndTeam());
    window.removeEventListener('googleLoginSuccess', () => this.loadUserAndTeam());
  }

  /** ✅ Cargar usuario y equipo */
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
    if (this.userService.isLoggedIn()) return;

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

  /** 🚪 Cerrar sesión */
  logout(): void {
    Swal.fire({
      icon: 'question',
      title: '¿Cerrar sesión?',
      text: 'Se cerrará tu sesión actual y se limpiará tu equipo guardado.',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    }).then((res) => {
      if (res.isConfirmed) {
        this.userService.logout();
        this.user = null;
        this.equipoGuardado = false;
        this.showEquipoMenu = false;
        this.router.navigate(['/home']);
        this.close.emit();
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: 'Tu sesión se ha cerrado correctamente.',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }
}
