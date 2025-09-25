// src/app/features/tournaments/pages/tournament-list/tournament-list.component.ts
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Tournament } from '../../models/tournament';
import { TournamentService } from '../../services/tournament.service';
import { CreateTournamentDialogComponent } from '../create-tournament-dialog/create-tournament-dialog.component';
import { TournamentMember } from '../../models/tournament-member';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tournament-list',
  templateUrl: './tournament-list.component.html',
  styleUrls: ['./tournament-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  // 👇 Cambiar entre grid y lista
  setView(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  // 👇 Abrir modal para crear torneo
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateTournamentDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.loadAll(); // ✅ refresca lista después de crear
      }
    });
  }

  // 👇 Unirse a torneo con validación
  joinTournament(tournamentId: number): void {
    this.service.join(tournamentId).subscribe(success => {
      if (success) {
        Swal.fire({
          icon: 'success',
          title: '¡Inscripción exitosa!',
          text: 'Te has unido al torneo correctamente 🎉',
          timer: 2000,
          showConfirmButton: false
        });
        this.service.loadAll(); // ✅ refresca después de inscribirse
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Ya estabas inscrito',
          text: 'No puedes volver a unirte a este torneo con la misma cuenta',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  // 👇 Verificar si usuario ya es miembro
  isMember(tournamentId: number): boolean {
    return this.service.isMember(tournamentId);
  }

  // 👇 Obtener miembros de un torneo
  getMembers(tournamentId: number): TournamentMember[] {
    return this.service.getMembers(tournamentId);
  }
}
