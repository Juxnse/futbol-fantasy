import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, map, takeUntil } from 'rxjs';
import { UserService } from 'src/app/auth/services/user.service';
import { SquadStateService } from 'src/app/features/equipos/services/squad-state.service'; // 👈 nuevo
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // nombre que se actualiza automáticamente
  userName = 'Manager';

  // si prefieres usar en plantilla con async pipe:
  isLoggedIn$ = this.userService.token$.pipe(map(Boolean));

  constructor(
    public userService: UserService,
    private router: Router,
    private squadState: SquadStateService, // 👈 inyectado
  ) {}

  ngOnInit(): void {
    // Suscríbete al usuario reactivo; cuando hagas logout pasa a null => "Manager"
    this.userService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(u => this.userName = u?.name ?? 'Manager');

    // 👇 Escucha la formación del equipo (BehaviorSubject emite valor actual e inmediatos cambios)
    this.squadState.formation$
      .pipe(takeUntil(this.destroy$))
      .subscribe(f => this.squad.formation = f);
  }

  isLoggedIn() {
    return this.userService.isLoggedIn();
  }

  logout() {
    this.userService.logoutUser();
    // navega (opcional) para asegurar estado de inicio
    this.router.navigate(['/home']);
    Swal.fire({
      icon: 'info',
      title: 'Sesión cerrada',
      text: 'Has salido de tu cuenta',
      timer: 1600,
      showConfirmButton: false,
    });
  }

  // ==== estado del dashboard ====
  squad = { status: 'incompleta', formation: '4-3-3', budget: 96, transfersLeft: 3 };

  matchweek = {
    number: 3,
    fixtures: [
      { home: 'DIM', away: 'Junior', date: new Date('2025-09-06T19:00:00'), myPlayers: 2 },
      { home: 'Nacional', away: 'Cali', date: new Date('2025-09-07T17:30:00'), myPlayers: 1 },
      { home: 'Tolima', away: 'Millonarios', date: new Date('2025-09-07T20:00:00'), myPlayers: 0 },
    ],
  };

  league = {
    name: 'Liga de Amigos',
    top5: [
      { name: 'Ana', points: 182 },
      { name: 'Carlos', points: 176 },
      { name: 'Tú', points: 169, me: true },
      { name: 'Luisa', points: 160 },
      { name: 'Mateo', points: 152 },
    ],
    me: { pos: 3, delta: +2 },
  };

  news = [
    { player: 'J. Pérez', type: 'lesion', note: 'Molestia muscular — duda para J-3' },
    { player: 'R. Díaz', type: 'duda',   note: 'Descanso programado, 50%' },
    { player: 'M. Gómez', type: 'suspension', note: 'Acum. amarillas — no juega' },
    { player: 'A. Ramírez', type: 'lesion', note: 'Rodilla — 2 semanas' },
  ];

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
