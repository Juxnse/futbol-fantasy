import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Tournament } from '../../models/tournament';
import { TournamentService } from '../../services/tournament.service';
import { CreateTournamentDialogComponent } from '../create-tournament-dialog/create-tournament-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tournament-list',
  templateUrl: './tournament-list.component.html',
  styleUrls: ['./tournament-list.component.scss']
})
export class TournamentListComponent implements OnInit {
  tournaments$!: Observable<Tournament[]>;
  loading = false;
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

  setView(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateTournamentDialogComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.service.create(result).subscribe();
    });
  }

  joinTournament(tournamentId: number): void {
    this.service.join(tournamentId).subscribe({
      next: () => Swal.fire({ icon: 'success', title: 'Te has unido al torneo', timer: 1200, showConfirmButton: false }),
      error: err => Swal.fire({ icon: 'error', title: 'Error', text: err.message }),
    });
  }

  leaveTournament(tournamentId: number): void {
    this.service.leave(tournamentId).subscribe({
      next: () => Swal.fire({ icon: 'info', title: 'Has salido del torneo', timer: 1200, showConfirmButton: false }),
    });
  }

  deleteTournament(tournamentId: number): void {
    this.service.deleteTournament(tournamentId).subscribe();
  }

  getOwner(t: Tournament): string {
    return t.ownerId ? t.ownerId.split('@')[0] : 'Desconocido';
  }

  getMembersCount(t: Tournament): number {
    return this.service.getMembers(t.id).length;
  }

  isOwner(id: number): boolean {
    return this.service.isOwner(id);
  }

  isMember(id: number): boolean {
    return this.service.isMember(id);
  }
}
