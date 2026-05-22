import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor(private http: HttpClient) {}

  // ── Ubicación por IP (no requiere permiso del usuario) ────
  getUbicacionPorIP(): Observable<any> {
    return this.http.get<any>('https://ipapi.co/json/');
  }

  // ── Nombre de ciudad por coordenadas (para el GPS) ────────
  getCiudad(lat: number, lon: number): Observable<any> {
    return this.http.get<any>(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
  }

  // ── Clima por coordenadas ─────────────────────────────────
  getClima(lat: number, lon: number): Observable<any> {
    return this.http.get<any>(
      `https://api.open-meteo.com/v1/forecast`
      + `?latitude=${lat}&longitude=${lon}`
      + `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m`
      + `&timezone=auto`
    );
  }

  // ── Descripción del código WMO ────────────────────────────
  getDescripcion(code: number): { texto: string; emoji: string } {
    if (code === 0)  return { texto: 'Cielo despejado',       emoji: '☀️'  };
    if (code <= 3)   return { texto: 'Parcialmente nublado',  emoji: '⛅'  };
    if (code <= 49)  return { texto: 'Nublado / Niebla',      emoji: '🌫️' };
    if (code <= 59)  return { texto: 'Llovizna',              emoji: '🌦️' };
    if (code <= 69)  return { texto: 'Lluvia',                emoji: '🌧️' };
    if (code <= 79)  return { texto: 'Nevada',                emoji: '❄️'  };
    if (code <= 82)  return { texto: 'Lluvia intensa',        emoji: '⛈️' };
    if (code <= 99)  return { texto: 'Tormenta eléctrica',    emoji: '🌩️' };
    return           { texto: 'Sin datos',                    emoji: '🌡️' };
  }

}
