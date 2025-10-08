import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByPosition'
})
export class FilterByPositionPipe implements PipeTransform {
  transform(jugadores: any[], filtro: string): any[] {
    if (!jugadores) return [];
    if (!filtro) return jugadores;
    return jugadores.filter(j =>
      j.posicion.toLowerCase().includes(filtro.toLowerCase())
    );
  }
}
