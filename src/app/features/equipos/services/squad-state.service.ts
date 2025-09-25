import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SquadStateService {
  private readonly KEY = 'ff:formation';

  private formationSubject = new BehaviorSubject<string>(this.loadFormation());
  readonly formation$ = this.formationSubject.asObservable();

  private loadFormation(): string {
    return localStorage.getItem(this.KEY) || '4-3-3';
  }

  setFormation(id: string) {
    localStorage.setItem(this.KEY, id);
    this.formationSubject.next(id); // ✅ notifica en vivo
  }

  getFormation(): string {
    return this.formationSubject.value;
  }

  clear() {
    localStorage.removeItem(this.KEY);
    this.formationSubject.next('4-3-3');
  }
}
