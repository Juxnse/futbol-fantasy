import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Tournament, TournamentMember } from '../models/tournament';
import { UserService } from 'src/app/auth/services/user.service';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class TournamentService {
  private readonly TOURNAMENTS_KEY = 'ff:tournaments';
  private readonly MEMBERS_KEY = 'ff:tournament_members';

  private tournaments: Tournament[] = [];
  private members: TournamentMember[] = [];

  private subject = new BehaviorSubject<Tournament[]>([]);
  tournaments$ = this.subject.asObservable();

  constructor(private userService: UserService) {
    this.loadAll();
  }

  // 🧩 Cargar y guardar
  loadAll(): void {
    const rawTournaments = localStorage.getItem(this.TOURNAMENTS_KEY);
    const rawMembers = localStorage.getItem(this.MEMBERS_KEY);
    this.tournaments = rawTournaments ? JSON.parse(rawTournaments) : [];
    this.members = rawMembers ? JSON.parse(rawMembers) : [];
    this.subject.next([...this.tournaments]);
  }

  private save(): void {
    localStorage.setItem(this.TOURNAMENTS_KEY, JSON.stringify(this.tournaments));
    localStorage.setItem(this.MEMBERS_KEY, JSON.stringify(this.members));
    this.subject.next([...this.tournaments]);
  }

  // 🧩 Crear torneo — el dueño NO se une automáticamente
  create(tournament: Omit<Tournament, 'ownerId'>): Observable<Tournament> {
    const user = this.userService.getUser();
    if (!user) {
      return throwError(() => new Error('Debes iniciar sesión para crear un torneo'));
    }

    const newTournament: Tournament = {
      ...tournament,
      id: Date.now() + Math.floor(Math.random() * 10000),
      ownerId: user.email,
    };

    this.tournaments.push(newTournament);
    this.save();
    return of(newTournament);
  }

  // 🧩 Unirse a torneo
  join(tournamentId: number): Observable<boolean> {
    const user = this.userService.getUser();
    if (!user) return throwError(() => new Error('Debes iniciar sesión'));

    const t = this.tournaments.find(tt => Number(tt.id) === Number(tournamentId));
    if (!t) return throwError(() => new Error('Torneo no encontrado'));

    const already = this.members.some(m => m.tournamentId === tournamentId && m.userId === user.email);
    if (already) return throwError(() => new Error('Ya estás inscrito en este torneo'));

    if (t.currentTeams >= t.maxTeams) {
      return throwError(() => new Error('El torneo está lleno'));
    }

    const member: TournamentMember = {
      tournamentId,
      userId: user.email,
      role: 'MEMBER',
      joinedAt: new Date().toISOString(),
    };

    this.members.push(member);
    t.currentTeams = this.countMembers(tournamentId);
    this.save();
    return of(true);
  }

  // 🧩 Salir del torneo
  leave(tournamentId: number): Observable<boolean> {
    const user = this.userService.getUser();
    if (!user) return throwError(() => new Error('Debes iniciar sesión'));

    this.members = this.members.filter(
      m => !(m.tournamentId === tournamentId && m.userId === user.email)
    );

    const t = this.tournaments.find(tt => tt.id === tournamentId);
    if (t) t.currentTeams = this.countMembers(tournamentId);

    this.save();
    return of(true);
  }

  // 🧩 Eliminar torneo — solo dueño
  deleteTournament(tournamentId: number): Observable<boolean> {
    const user = this.userService.getUser();
    if (!user) return throwError(() => new Error('Debes iniciar sesión'));

    const t = this.tournaments.find(tt => tt.id === tournamentId);
    if (!t) return throwError(() => new Error('Torneo no encontrado'));

    if (t.ownerId !== user.email) {
      return throwError(() => new Error('Solo el dueño puede eliminar este torneo'));
    }

    return new Observable<boolean>(observer => {
      Swal.fire({
        title: '¿Eliminar torneo?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc2626',
      }).then(result => {
        if (result.isConfirmed) {
          this.tournaments = this.tournaments.filter(tt => tt.id !== tournamentId);
          this.members = this.members.filter(m => m.tournamentId !== tournamentId);
          this.save();
          Swal.fire({
            icon: 'success',
            title: 'Torneo eliminado',
            timer: 1400,
            showConfirmButton: false,
          });
          observer.next(true);
        } else {
          observer.next(false);
        }
        observer.complete();
      });
    });
  }

  // 🧩 Auxiliares
  isMember(tournamentId: number): boolean {
    const user = this.userService.getUser();
    return !!user && this.members.some(m => m.tournamentId === tournamentId && m.userId === user.email);
  }

  isOwner(tournamentId: number): boolean {
    const user = this.userService.getUser();
    if (!user) return false;
    const t = this.tournaments.find(x => x.id === tournamentId);
    return !!t && t.ownerId === user.email;
  }

  getMembers(tournamentId: number): TournamentMember[] {
    return this.members.filter(m => m.tournamentId === tournamentId);
  }

  private countMembers(tournamentId: number): number {
    return this.members.filter(m => m.tournamentId === tournamentId).length;
  }
}
