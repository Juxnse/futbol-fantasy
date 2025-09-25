// src/app/features/tournaments/services/tournament.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Tournament } from '../models/tournament';
import { TournamentMember } from '../models/tournament-member';

@Injectable({ providedIn: 'root' })
export class TournamentService {
  private readonly KEY = 'ff:tournaments';
  private readonly MEMBERS_KEY = 'ff:tournamentMembers';

  private tournaments: Tournament[] = [];
  private members: TournamentMember[] = [];

  private subject = new BehaviorSubject<Tournament[]>([]);
  tournaments$ = this.subject.asObservable();

  constructor() {
    this.loadAll();
  }

  // ===========================
  // Cargar / Guardar
  // ===========================
  loadAll(): void {
    const raw = localStorage.getItem(this.KEY);
    this.tournaments = raw ? JSON.parse(raw) : [];

    const rawMembers = localStorage.getItem(this.MEMBERS_KEY);
    this.members = rawMembers ? JSON.parse(rawMembers) : [];

    this.subject.next([...this.tournaments]);
  }

  private save(): void {
    localStorage.setItem(this.KEY, JSON.stringify(this.tournaments));
    localStorage.setItem(this.MEMBERS_KEY, JSON.stringify(this.members));
    this.subject.next([...this.tournaments]);
  }

  // ===========================
  // Torneos
  // ===========================
  getAll(): Observable<Tournament[]> {
    return of([...this.tournaments]);
  }

  create(tournament: Tournament): Observable<Tournament> {
    this.tournaments.push(tournament);
    this.save();
    return of(tournament);
  }

  // ===========================
  // Inscripción
  // ===========================
  join(tournamentId: number): Observable<boolean> {
    const t = this.tournaments.find(x => x.id === tournamentId);
    if (t && t.currentTeams < t.maxTeams) {
      const user = JSON.parse(
        localStorage.getItem('ff_user') || '{"sub":"guest","name":"Invitado"}'
      );
      const userId: string = user.id ?? user.sub;   // ✅ usa id si existe, si no sub
      const userName: string = user.name ?? 'Invitado';

      // 🔹 Verificar si ya está inscrito este usuario
      const already = this.members.find(
        m => m.tournamentId === tournamentId && m.userId === userId
      );
      if (already) return of(false);

      // 🔹 Registrar miembro nuevo
      this.members.push({
        tournamentId,
        userId,
        userName,
        role: t.currentTeams === 0 ? 'OWNER' : 'MEMBER',
        joinedAt: new Date().toISOString()
      });

      t.currentTeams++;
      this.save();
      return of(true);
    }
    return of(false);
  }

  isMember(tournamentId: number): boolean {
    const user = JSON.parse(
      localStorage.getItem('ff_user') || '{"sub":"guest"}'
    );
    const userId: string = user.id ?? user.sub;   // ✅ unificación
    return this.members.some(
      m => m.tournamentId === tournamentId && m.userId === userId
    );
  }

  getMembers(tournamentId: number): TournamentMember[] {
    return this.members.filter(m => m.tournamentId === tournamentId);
  }
}
