import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UniversidadesService } from '../../services/universidades.service';

declare var L: any;

@Component({
  selector: 'app-universidades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './universidades.component.html',
  styleUrls: ['./universidades.component.css']
})
export class UniversidadesComponent implements OnInit, AfterViewInit {

  todas:     any[] = [];
  filtradas: any[] = [];
  busqueda   = '';
  cargando   = true;
  error      = false;

  private mapa: any = null;
  private marcadorActual: any = null;
  universidadSeleccionada: any = null;
  geocodificando = false;

  // Cache de coordenadas ya buscadas por Nominatim
  private cache = new Map<string, { lat: number; lon: number }>();

  constructor(
    private universidadesService: UniversidadesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.universidadesService.getUniversidades().subscribe({
      next: data => {
        this.todas    = data;
        this.filtradas = data;
        this.cargando  = false;
      },
      error: () => {
        this.error    = true;
        this.cargando = false;
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.iniciarMapa(), 300);
  }

  iniciarMapa() {
    if (typeof L === 'undefined') return;
    this.mapa = L.map('mapa-universidades').setView([4.5709, -74.2973], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.mapa);
  }

  buscar() {
    const t = this.busqueda.toLowerCase().trim();
    this.filtradas = t
      ? this.todas.filter(u => u.name.toLowerCase().includes(t))
      : [...this.todas];
  }

  verEnMapa(uni: any) {
    this.universidadSeleccionada = uni;

    // ── OPCIÓN 1: coordenadas directas del JSON (Mock API) ──
    if (uni.lat && uni.lon) {
      this.colocarMarcador(uni, { lat: uni.lat, lon: uni.lon });
      return;
    }

    // ── OPCIÓN 2: cache de búsquedas anteriores ─────────────
    if (this.cache.has(uni.name)) {
      this.colocarMarcador(uni, this.cache.get(uni.name)!);
      return;
    }

    // ── OPCIÓN 3: Nominatim (API real sin coordenadas) ──────
    this.geocodificando = true;
    this.universidadesService.geocodificar(uni.name).subscribe({
      next: resultados => {
        this.geocodificando = false;
        if (resultados && resultados.length > 0) {
          const coords = {
            lat: parseFloat(resultados[0].lat),
            lon: parseFloat(resultados[0].lon)
          };
          this.cache.set(uni.name, coords);
          this.colocarMarcador(uni, coords);
        } else {
          alert(`No se encontró la ubicación de "${uni.name}" en el mapa.`);
        }
      },
      error: () => {
        this.geocodificando = false;
        alert('Error al buscar la ubicación. Intenta de nuevo.');
      }
    });
  }

  private colocarMarcador(uni: any, coords: { lat: number; lon: number }) {
    if (!this.mapa) return;

    if (this.marcadorActual) {
      this.mapa.removeLayer(this.marcadorActual);
    }

    this.marcadorActual = L.marker([coords.lat, coords.lon])
      .addTo(this.mapa)
      .bindPopup(`
        <b>${uni.name}</b><br>
        ${uni.tipo ? `<span style="color:#2c7be5;font-size:12px">${uni.tipo}</span><br>` : ''}
        🌐 ${uni.domains[0]}<br>
        <a href="${uni.web_pages[0]}" target="_blank">Visitar sitio</a>
      `)
      .openPopup();

    this.mapa.flyTo([coords.lat, coords.lon], 14, { duration: 1.2 });

    document.getElementById('mapa-universidades')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }
}
