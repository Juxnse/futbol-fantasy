import { Component, OnInit } from '@angular/core';
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
export class HomeComponent implements OnInit {
  user: User | null = null;
  userName = 'Manager';

  equipoGuardado = false;
  formacion = '';
  puntajeTotal = 0;
  jugadoresSeleccionados: Player[] = [];

  showToast = false; // 🔹 aparece cuando no tiene equipo

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

  constructor(private squad: SquadStateService, private userService: UserService) {}

  ngOnInit(): void {
    this.loadUserAndTeam();
    window.addEventListener('storage', () => this.loadUserAndTeam());
  }

  /** Cargar usuario actual y su equipo */
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
        return;
      }
    }

    // 🧹 Si no hay usuario o equipo
    this.equipoGuardado = false;
    this.formacion = '';
    this.puntajeTotal = 0;
    this.jugadoresSeleccionados = [];

    // ✅ Mostramos el aviso tipo toast (solo informativo)
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 4000);
  }

  /** Ver tablero táctico */
  verTablero() {
    if (this.user && this.equipoGuardado) {
      window.location.href = '/equipos/visual';
    } else {
      window.location.href = '/login';
    }
  }

  /** Editar o crear equipo */
  editarAlineacion() {
    if (this.user) {
      const destino = this.equipoGuardado ? '/equipos/mi-equipo' : '/equipos/crear';
      window.location.href = destino;
    } else {
      window.location.href = '/login';
    }
  }
}
