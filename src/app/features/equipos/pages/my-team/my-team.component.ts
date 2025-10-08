import {
  Component,
  OnInit,
  AfterViewInit,
  Renderer2,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { SquadStateService } from '../../services/squad-state.service';
import { UserService, User } from 'src/app/auth/services/user.service';
import Swal from 'sweetalert2';

interface Player {
  id: number;
  nombre: string;
  posicion: string;
  global: number;
}

interface Team {
  id?: number;
  nombre: string;
  tecnico: string;
  ciudad: string;
  jugadores: Player[];
}

interface Limites {
  GK: number;
  DF: number;
  MF: number;
  FW: number;
}

@Component({
  selector: 'app-my-team',
  templateUrl: './my-team.component.html',
  styleUrls: ['./my-team.component.scss'],
})
export class MyTeamComponent implements OnInit, AfterViewInit {
  equipos: Team[] = [];
  jugadoresSeleccionados: Player[] = [];
  formacion = '';
  limites!: Limites;
  filtro = '';
  equipoGuardado = false;

  // 🔹 Nuevo: usuario y clave dinámica
  user: User | null = null;
  storageKey = '';

  filtros = [
    { value: '', label: 'Todos', icon: 'group' },
    { value: 'Portero', label: 'Porteros', icon: 'sports_handball' },
    { value: 'Defensa', label: 'Defensas', icon: 'security' },
    { value: 'Mediocampista', label: 'Mediocampistas', icon: 'sports_soccer' },
    { value: 'Delantero', label: 'Delanteros', icon: 'sports' },
  ];

  constructor(
    private squad: SquadStateService,
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // 🔹 Obtener usuario actual y definir la clave de almacenamiento
    this.user = this.userService.getUser();
    this.storageKey = this.user
      ? `mi_equipo_${this.user.email}`
      : 'mi_equipo_anonimo';

    this.formacion = this.squad.getFormation();
    this.definirLimites();

    // 🔹 Cargar equipo guardado por usuario
    const equipoGuardado = localStorage.getItem(this.storageKey);
    if (equipoGuardado) {
      const equipo = JSON.parse(equipoGuardado);
      this.jugadoresSeleccionados = equipo.jugadores || [];
      this.equipoGuardado = true;
    }

    // 🔹 Cargar lista de equipos/jugadores
    fetch('assets/datos_jugadores_FF.json')
      .then((r) => r.json())
      .then((data) => {
        this.equipos = data.equipos.map((e: Team) => ({
          ...e,
          jugadores: e.jugadores.map((j) => ({
            ...j,
            global: parseFloat((Math.random() * 10).toFixed(1)), // 🎲 puntaje aleatorio
          })),
        }));
      })
      .catch(() =>
        Swal.fire('Error', 'No se pudieron cargar los equipos', 'error')
      );
  }

  ngAfterViewInit(): void {
    // 🔹 Ajustar posición del botón flotante según el header
    const header = document.querySelector('.header');
    const boton = this.el.nativeElement.querySelector('.btn-tablero');

    if (header && boton) {
      const headerHeight = header.clientHeight;
      this.renderer.setStyle(boton, 'top', `${headerHeight + 16}px`);
      this.renderer.setStyle(boton, 'z-index', '2000');
    }

    // 🔹 Reajustar si el usuario cambia tamaño de pantalla
    window.addEventListener('resize', () => {
      const header = document.querySelector('.header');
      if (header && boton) {
        const headerHeight = header.clientHeight;
        this.renderer.setStyle(boton, 'top', `${headerHeight + 16}px`);
      }
    });
  }

  setFiltro(value: string) {
    this.filtro = value;
  }

  definirLimites() {
    const mapa: Record<string, Limites> = {
      '4-3-3': { GK: 1, DF: 4, MF: 3, FW: 3 },
      '4-4-2': { GK: 1, DF: 4, MF: 4, FW: 2 },
      '3-5-2': { GK: 1, DF: 3, MF: 5, FW: 2 },
      '3-4-3': { GK: 1, DF: 3, MF: 4, FW: 3 },
      '5-3-2': { GK: 1, DF: 5, MF: 3, FW: 2 },
    };
    this.limites = mapa[this.formacion] ?? { GK: 1, DF: 4, MF: 3, FW: 3 };
  }

  obtenerCategoria(pos: string): keyof Limites {
    const p = pos.toLowerCase();
    if (p.includes('portero')) return 'GK';
    if (p.includes('defensa')) return 'DF';
    if (p.includes('medio') || p.includes('mediocamp')) return 'MF';
    return 'FW';
  }

  toggleJugador(jugador: Player): void {
    const index = this.jugadoresSeleccionados.findIndex(
      (j) => j.id === jugador.id
    );
    const categoria = this.obtenerCategoria(jugador.posicion);

    if (index >= 0) {
      this.jugadoresSeleccionados.splice(index, 1);
      return;
    }

    const conteo = this.jugadoresSeleccionados.filter(
      (j) => this.obtenerCategoria(j.posicion) === categoria
    ).length;

    const limite = this.limites[categoria];
    const total = this.jugadoresSeleccionados.length;

    if (conteo >= limite) {
      Swal.fire({
        icon: 'warning',
        title: 'Límite alcanzado',
        text: `Solo puedes tener ${limite} ${this.nombreCategoria(categoria)}.`,
        timer: 1800,
        showConfirmButton: false,
      });
      return;
    }

    if (total >= 11) {
      Swal.fire({
        icon: 'warning',
        title: 'Equipo completo',
        text: 'Solo puedes seleccionar 11 jugadores en total.',
        timer: 1800,
        showConfirmButton: false,
      });
      return;
    }

    this.jugadoresSeleccionados.push(jugador);
  }

  nombreCategoria(cat: keyof Limites): string {
    switch (cat) {
      case 'GK':
        return 'portero';
      case 'DF':
        return 'defensas';
      case 'MF':
        return 'mediocampistas';
      case 'FW':
        return 'delanteros';
    }
  }

  isSelected(id: number): boolean {
    return this.jugadoresSeleccionados.some((j) => j.id === id);
  }

  getTotalGlobal(): number {
    return this.jugadoresSeleccionados.reduce(
      (acc, j) => acc + (j.global || 0),
      0
    );
  }

  guardarEquipo(): void {
    const conteo = {
      GK: this.jugadoresSeleccionados.filter(
        (j) => this.obtenerCategoria(j.posicion) === 'GK'
      ).length,
      DF: this.jugadoresSeleccionados.filter(
        (j) => this.obtenerCategoria(j.posicion) === 'DF'
      ).length,
      MF: this.jugadoresSeleccionados.filter(
        (j) => this.obtenerCategoria(j.posicion) === 'MF'
      ).length,
      FW: this.jugadoresSeleccionados.filter(
        (j) => this.obtenerCategoria(j.posicion) === 'FW'
      ).length,
    };

    if (
      conteo.GK !== this.limites.GK ||
      conteo.DF !== this.limites.DF ||
      conteo.MF !== this.limites.MF ||
      conteo.FW !== this.limites.FW
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Formación incompleta',
        text: `Tu alineación debe tener exactamente: ${this.limites.GK} portero, ${this.limites.DF} defensas, ${this.limites.MF} mediocampistas y ${this.limites.FW} delanteros.`,
      });
      return;
    }

    const equipo = {
      formacion: this.formacion,
      jugadores: this.jugadoresSeleccionados,
      puntajeTotal: this.getTotalGlobal(),
    };

    // ✅ Guardar equipo por usuario logueado
    localStorage.setItem(this.storageKey, JSON.stringify(equipo));
    this.equipoGuardado = true;

    Swal.fire({
      icon: 'success',
      title: 'Equipo guardado',
      text: 'Tu equipo se ha guardado correctamente',
      timer: 1500,
      showConfirmButton: false,
    });
  }

  verTablero() {
    this.router.navigate(['/equipos/visual']);
  }
}
