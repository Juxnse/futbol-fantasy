export interface Tournament {
  id: number;                         // identificador único
  name: string;                       // nombre del torneo
  visibility: 'PUBLIC' | 'PRIVATE';   // visibilidad
  maxTeams: number;                   // número máximo de equipos
  currentTeams: number;               // número actual de equipos inscritos
  startAt: string;                    // fecha de inicio (ISO string)
  endAt: string;                      // fecha de fin (ISO string)
}
