import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

interface Player {
  id: number;
  nombre: string;
  posicion: string;
  global: number;
}

@Component({
  selector: 'app-visual-board',
  templateUrl: './visual-board.component.html',
  styleUrls: ['./visual-board.component.scss']
})
export class VisualBoardComponent implements OnInit, OnDestroy {
  formacion = '';
  jugadores: Player[] = [];
  coach = '';

  lineas: Record<'GK' | 'DF' | 'MF' | 'FW', Player[]> = {
    GK: [],
    DF: [],
    MF: [],
    FW: []
  };

  private storageKey = 'mi_equipo_anonimo';
  private routerSub?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.definirStorageKey();
    this.cargarEquipo();

    // 🟢 Escuchar navegación (por si vuelve desde /mi-equipo)
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url.includes('/equipos/visual')) {
        this.cargarEquipo();
      }
    });

    // 🟢 Escuchar cambios en localStorage (si se guarda equipo nuevo)
    window.addEventListener('storage', this.actualizarDesdeStorage.bind(this));
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
    window.removeEventListener('storage', this.actualizarDesdeStorage.bind(this));
  }

  private definirStorageKey(): void {
    const user = JSON.parse(localStorage.getItem('ff_user') || 'null');
    this.storageKey = user ? `mi_equipo_${user.email}` : 'mi_equipo_anonimo';
  }

  private cargarEquipo(): void {
    const equipoGuardado = localStorage.getItem(this.storageKey);
    if (!equipoGuardado) {
      Swal.fire('⚠️ No hay equipo guardado', 'Primero debes crear y guardar tu equipo.', 'info');
      return;
    }

    const equipo = JSON.parse(equipoGuardado);
    this.formacion = equipo.formacion;
    this.jugadores = equipo.jugadores;
    this.coach = equipo.tecnico || 'Sin DT';
    this.organizarJugadores();
  }

  private actualizarDesdeStorage(event: StorageEvent): void {
    if (event.key === this.storageKey) {
      this.cargarEquipo();
    }
  }

  organizarJugadores(): void {
    this.lineas = { GK: [], DF: [], MF: [], FW: [] };
    this.jugadores.forEach((j: Player) => {
      const pos = this.obtenerCategoria(j.posicion);
      this.lineas[pos].push(j);
    });
  }

  obtenerCategoria(pos: string): 'GK' | 'DF' | 'MF' | 'FW' {
    const p = pos.toLowerCase();
    if (p.includes('portero')) return 'GK';
    if (p.includes('defensa')) return 'DF';
    if (p.includes('medio') || p.includes('mediocamp')) return 'MF';
    return 'FW';
  }
}
