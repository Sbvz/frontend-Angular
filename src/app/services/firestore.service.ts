import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

// ============================================================
//  FirestoreService — Backend Express + Railway
// ============================================================

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  // URL dinámica según ambiente
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Guardar un registro nuevo ────────────────────────────
  guardarRegistro(registro: any): Promise<any> {
    return this.http.post<any>(this.API_URL, registro).toPromise();
  }

  // ── Obtener todos los registros de un usuario ────────────
  obtenerRegistros(uid: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}?uid=${encodeURIComponent(uid)}`);
  }

  // ── Eliminar un registro por ID ──────────────────────────
  eliminarRegistro(id: string): Promise<any> {
    return this.http.delete<any>(`${this.API_URL}/${id}`).toPromise();
  }
}