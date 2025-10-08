import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamComponent } from './pages/team/team.component';
import { MyTeamComponent } from './pages/my-team/my-team.component';
import { VisualBoardComponent } from './pages/visual-board/visual-board.component'; // 👈 IMPORTANTE

const routes: Routes = [
  { path: 'crear', component: TeamComponent, title: 'Elegir formación' },
  { path: 'mi-equipo', component: MyTeamComponent, title: 'Armar mi equipo' },
  { path: 'visual', component: VisualBoardComponent, title: 'Visual Board' }, // ✅ NUEVA RUTA
  { path: '', redirectTo: 'crear', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EquiposRoutingModule {}
