export interface TournamentMember {
  tournamentId: number;   // ID del torneo
  userId: string;         // ID del usuario (del Google login guardado en ff_user.sub)
  role: 'OWNER' | 'MEMBER'; // Rol dentro del torneo
  joinedAt: string;       // Fecha de inscripción (ISO string)
}
