import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamComponent } from './pages/team/team.component';

const routes: Routes = [
  {
    path: 'crear',
    component: TeamComponent,
    title: 'Crear equipo · Elegir alineación',
    data: { step: 'alineacion' },
  },
  { path: '', pathMatch: 'full', redirectTo: 'crear' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EquiposRoutingModule {}
