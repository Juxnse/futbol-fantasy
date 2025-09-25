export interface TournamentMember {
  tournamentId: number;       // ID del torneo
  userId: string;             // ID del usuario
  userName: string;           // Nombre a mostrar
  role: 'OWNER' | 'MEMBER';   // Rol dentro del torneo
  joinedAt: string;           // Fecha de inscripción
}
