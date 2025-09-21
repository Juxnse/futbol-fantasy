import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Tournament } from '../models/tournament';

@Injectable({ providedIn: 'root' })
export class TournamentService {
  private readonly KEY = 'ff:tournaments';

  private tournaments: Tournament[] = [];
  private subject = new BehaviorSubject<Tournament[]>([]);
  tournaments$ = this.subject.asObservable();

  constructor() {
    this.loadAll();
  }

  loadAll(): void {
    const raw = localStorage.getItem(this.KEY);
    this.tournaments = raw ? JSON.parse(raw) : [];
    this.subject.next([...this.tournaments]);
  }

  getAll(): Observable<Tournament[]> {
    return of([...this.tournaments]);
  }

  create(tournament: Tournament): Observable<Tournament> {
    this.tournaments.push(tournament);
    this.save();
    return of(tournament);
  }

  join(tournamentId: number): Observable<boolean> {
    const t = this.tournaments.find(x => x.id === tournamentId);
    if (t && t.currentTeams < t.maxTeams) {
      t.currentTeams++;
      this.save();
      return of(true);
    }
    return of(false);
  }

  isMember(tournamentId: number): boolean {
    // mock simple: true si ya está lleno
    const t = this.tournaments.find(x => x.id === tournamentId);
    return !!t && t.currentTeams > 0;
  }

  private save(): void {
    localStorage.setItem(this.KEY, JSON.stringify(this.tournaments));
    this.subject.next([...this.tournaments]);
  }
}
