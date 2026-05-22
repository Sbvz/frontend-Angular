import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UniversidadesService {

  private readonly API     = 'http://universities.hipolabs.com/search?country=Colombia';
  private readonly MOCK    = 'assets/instituciones.json';

  constructor(private http: HttpClient) {}

  // ── Todas las instituciones (API real + Mock JSON) ────────
  getUniversidades(): Observable<any[]> {
    return forkJoin({
      api:  this.http.get<any[]>(this.API).pipe(catchError(() => of([]))),
      mock: this.http.get<any[]>(this.MOCK).pipe(catchError(() => of([])))
    }).pipe(
      map(({ api, mock }) => {
        // Combinar y eliminar duplicados por nombre
        const todos = [...api, ...mock];
        const vistos = new Set<string>();
        return todos.filter(u => {
          const key = u.name.toLowerCase().trim();
          if (vistos.has(key)) return false;
          vistos.add(key);
          return true;
        });
      })
    );
  }

  // ── Buscar por ciudad (API real + Mock JSON) ──────────────
  buscarPorCiudad(ciudad: string): Observable<any[]> {
    const ciudadLower = ciudad.toLowerCase().trim();

    return forkJoin({
      api:  this.http.get<any[]>(`${this.API}&name=${encodeURIComponent(ciudad)}`)
                     .pipe(catchError(() => of([]))),
      mock: this.http.get<any[]>(this.MOCK).pipe(catchError(() => of([])))
    }).pipe(
      map(({ api, mock }) => {
        // Del mock filtra por ciudad
        const mockFiltrado = mock.filter(u =>
          u.ciudad?.toLowerCase().includes(ciudadLower)
        );

        const todos = [...api, ...mockFiltrado];
        const vistos = new Set<string>();
        return todos.filter(u => {
          const key = u.name.toLowerCase().trim();
          if (vistos.has(key)) return false;
          vistos.add(key);
          return true;
        });
      })
    );
  }

  // ── Geocodificar nombre de institución → coordenadas ─────
  geocodificar(nombre: string): Observable<any[]> {
    const q = encodeURIComponent(`${nombre} Colombia`);
    return this.http.get<any[]>(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`
    );
  }

}
