import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SquadStateService } from '../features/equipos/services/squad-state.service';
import { UserService, User } from '../auth/services/user.service';

interface Player {
  id: number;
  nombre: string;
  posicion: string;
  global: number;
}

interface Liga {
  nombre: string;
  top5: { name: string; points: number }[];
}

interface Noticia {
  player: string;
  note: string;
  type: 'lesion' | 'suspension' | 'duda';
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  user: User | null = null;
  userName = 'Manager';

  equipoGuardado = false;
  formacion = '';
  puntajeTotal = 0;
  jugadoresSeleccionados: Player[] = [];
  showToast = false;
  private storageListener: any;

  liga: Liga = {
    nombre: 'Liga Colombiana',
    top5: [
      { name: 'Juanse', points: 132 },
      { name: 'Andrés', points: 118 },
      { name: 'Felipe', points: 110 },
      { name: 'Camilo', points: 104 },
      { name: 'Valentina', points: 97 },
    ],
  };

  news: Noticia[] = [
    { player: 'David Ospina', note: 'Sigue en duda por molestia muscular.', type: 'duda' },
    { player: 'Edwin Cardona', note: 'Suspendido por acumulación de amarillas.', type: 'suspension' },
    { player: 'Matheus Uribe', note: 'Lesión de rodilla — baja 2 semanas.', type: 'lesion' },
    { player: 'Luis Sandoval', note: 'Duda para el próximo partido.', type: 'duda' },
  ];

  constructor(
    private squad: SquadStateService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserAndTeam();

    // 🔁 Escucha los cambios globales en sesión o equipos
    this.storageListener = () => this.loadUserAndTeam();
    window.addEventListener('storage', this.storageListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.storageListener);
  }

  /** ✅ Carga datos del usuario y su equipo */
  loadUserAndTeam(): void {
    this.user = this.userService.getUser();

    if (this.user) {
      this.userName = this.user.name || this.user.email || 'Manager';
      const storageKey = `mi_equipo_${this.user.email}`;
      const equipoGuardado = localStorage.getItem(storageKey);

      if (equipoGuardado) {
        const equipo = JSON.parse(equipoGuardado);
        this.formacion = equipo.formacion;
        this.jugadoresSeleccionados = equipo.jugadores || [];
        this.puntajeTotal = equipo.puntajeTotal || 0;
        this.equipoGuardado = true;
        this.squad.setFormation(this.formacion);
        this.showToast = false;
        return;
      }
    }

    // 🔹 Sin usuario o sin equipo
    this.userName = 'Manager';
    this.equipoGuardado = false;
    this.formacion = '';
    this.puntajeTotal = 0;
    this.jugadoresSeleccionados = [];
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 4000);
  }

  /** 👁️ Ver tablero táctico */
  verTablero(): void {
    if (this.user && this.equipoGuardado) {
      this.router.navigate(['/equipos/visual']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  /** ✏️ Crear o editar alineación */
  editarAlineacion(): void {
    if (this.user) {
      const destino = this.equipoGuardado
        ? '/equipos/mi-equipo'
        : '/equipos/crear';
      this.router.navigate([destino]);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
