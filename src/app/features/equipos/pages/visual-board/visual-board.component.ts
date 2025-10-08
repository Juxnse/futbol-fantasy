import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

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
export class VisualBoardComponent implements OnInit {
  formacion = '';
  jugadores: Player[] = [];

  lineas: Record<'GK' | 'DF' | 'MF' | 'FW', Player[]> = {
    GK: [],
    DF: [],
    MF: [],
    FW: []
  };

  ngOnInit(): void {
    const equipoGuardado = localStorage.getItem('mi_equipo');
    if (!equipoGuardado) {
      Swal.fire('⚠️ No hay equipo guardado', 'Primero debes crear y guardar tu equipo.', 'info');
      return;
    }

    const equipo = JSON.parse(equipoGuardado);
    this.formacion = equipo.formacion;
    this.jugadores = equipo.jugadores;
    this.organizarJugadores();
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
