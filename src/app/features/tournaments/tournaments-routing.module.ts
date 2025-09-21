import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TournamentListComponent } from './pages/tournament-list/tournament-list.component';

const routes: Routes = [
  { path: '', component: TournamentListComponent, title: 'Torneos · FF' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TournamentsRoutingModule {}
