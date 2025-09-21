import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Tournament } from '../../models/tournament';
import { TournamentService } from '../../services/tournament.service';
import { CreateTournamentDialogComponent } from '../create-tournament-dialog/create-tournament-dialog.component';

@Component({
  selector: 'app-tournament-list',
  templateUrl: './tournament-list.component.html',
  styleUrls: ['./tournament-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentListComponent implements OnInit {
  tournaments$!: Observable<Tournament[]>;
  loading = false;

  // 👇 Vista por defecto (grid)
  viewMode: 'grid' | 'list' = 'grid';

  constructor(
    public service: TournamentService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.tournaments$ = this.service.tournaments$;
    this.service.loadAll();
    this.loading = false;
  }

  // 👇 Cambiar vista
  setView(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  // 👇 Abrir dialog para crear torneo
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateTournamentDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.create(result).subscribe();
      }
    });
  }

  // 👇 Unirse a un torneo
  joinTournament(tournamentId: number): void {
    this.service.join(tournamentId).subscribe();
  }

  // 👇 Validar si ya es miembro
  isMember(tournamentId: number): boolean {
    return this.service.isMember(tournamentId);
  }
}
