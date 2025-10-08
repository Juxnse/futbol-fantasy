// ✅ src/app/features/tournaments/models/tournament.ts

export interface Tournament {
  id: number;
  name: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  maxTeams: number;
  currentTeams: number;
  startAt: string;
  endAt: string;
  ownerId: string; // 👈 ID del dueño (usuario logueado)
}

export interface TournamentMember {
  tournamentId: number;
  userId: string;
  role: 'OWNER' | 'MEMBER';
  joinedAt: string;
}
