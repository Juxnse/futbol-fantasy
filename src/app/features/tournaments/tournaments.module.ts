import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips'; // 👈 IMPORTADO

// Components
import { TournamentListComponent } from './pages/tournament-list/tournament-list.component';
import { CreateTournamentDialogComponent } from './pages/create-tournament-dialog/create-tournament-dialog.component';
import { TournamentsRoutingModule } from './tournaments-routing.module';

@NgModule({
  declarations: [
    TournamentListComponent,
    CreateTournamentDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TournamentsRoutingModule,
    MatTableModule,
    MatButtonModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatCardModule,
    MatChipsModule // ✅ ahora reconoce mat-chip-list y mat-chip
  ]
})
export class TournamentsModule {}
