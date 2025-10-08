import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Componentes
import { TeamComponent } from './pages/team/team.component';
import { MyTeamComponent } from './pages/my-team/my-team.component';
import { VisualBoardComponent } from './pages/visual-board/visual-board.component';

// Pipes
import { FilterByPositionPipe } from './pipes/filter-by-position.pipe'; // ✅ importación

import { EquiposRoutingModule } from './equipos-routing.module';

@NgModule({
  declarations: [
    TeamComponent,
    MyTeamComponent,
    VisualBoardComponent,
    FilterByPositionPipe  // ✅ registrado
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    EquiposRoutingModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ]
})
export class EquiposModule {}
