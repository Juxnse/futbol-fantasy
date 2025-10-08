import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SquadStateService } from '../../services/squad-state.service';

type Line = 'GK' | 'DF' | 'MF' | 'FW';
interface FormationDef { id: string; label: string; meta: string; layout: Record<Line, number>; }

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
  formations: FormationDef[] = [
    { id: '4-3-3', label: '4–3–3', meta: 'Equilibrada',       layout: { GK: 1, DF: 4, MF: 3, FW: 3 } },
    { id: '4-4-2', label: '4–4–2', meta: 'Clásica',           layout: { GK: 1, DF: 4, MF: 4, FW: 2 } },
    { id: '3-5-2', label: '3–5–2', meta: 'Dominio del medio', layout: { GK: 1, DF: 3, MF: 5, FW: 2 } },
    { id: '3-4-3', label: '3–4–3', meta: 'Ofensiva',          layout: { GK: 1, DF: 3, MF: 4, FW: 3 } },
    { id: '5-3-2', label: '5–3–2', meta: 'Defensiva',         layout: { GK: 1, DF: 5, MF: 3, FW: 2 } },
  ];

  selectedFormationId = '4-3-3';
  slots: Record<Line, number[]> = { GK: [], DF: [], MF: [], FW: [] };

  constructor(private router: Router, private squad: SquadStateService) {}

  ngOnInit(): void {
    this.selectedFormationId = this.squad.getFormation();
    this.apply(this.selectedFormationId);
  }

  onFormationChange(id: string) {
    this.selectedFormationId = id;
    this.apply(id);
    this.squad.setFormation(id);
  }

  private apply(id: string) {
    const f = this.formations.find(x => x.id === id)!;
    this.slots.GK = Array.from({ length: f.layout.GK }, (_, i) => i + 1);
    this.slots.DF = Array.from({ length: f.layout.DF }, (_, i) => i + 1);
    this.slots.MF = Array.from({ length: f.layout.MF }, (_, i) => i + 1);
    this.slots.FW = Array.from({ length: f.layout.FW }, (_, i) => i + 1);
  }

  continue() {
    this.squad.setFormation(this.selectedFormationId);
    this.router.navigate(['/equipos/mi-equipo']); // ✅ flujo corregido
  }
}
