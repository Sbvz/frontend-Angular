import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { FirestoreService } from '../../services/firestore.service';
import { UniversidadesService } from '../../services/universidades.service';
import { WeatherService } from '../../services/weather.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // ── Usuario ───────────────────────────────────────────────
  nombreUsuario = '';

  // ── Registros académicos ─────────────────────────────────
  registros: any[] = [];
  promedioPonderado = 0;
  promedioHistorico = 0;
  clasificacion     = '';
  asignaturaMayor: any = null;
  asignaturaMenor: any = null;
  totalCreditos     = 0;

  // ── Clima ─────────────────────────────────────────────────
  clima: any        = null;
  climaInfo: { texto: string; emoji: string } = { texto: '', emoji: '' };
  ciudadActual      = '';
  cargandoClima     = true;
  errorClima        = false;

  // ── Ciudades predeterminadas ──────────────────────────────
  ciudades = [
    { nombre: 'Cali',         lat: 3.4516,  lon: -76.5320 },
    { nombre: 'Bogotá',       lat: 4.7110,  lon: -74.0721 },
    { nombre: 'Medellín',     lat: 6.2518,  lon: -75.5636 },
    { nombre: 'Barranquilla', lat: 10.9639, lon: -74.7964 },
    { nombre: 'Cartagena',    lat: 10.3910, lon: -75.4794 },
    { nombre: 'Bucaramanga',  lat: 7.1193,  lon: -73.1227 },
    { nombre: 'Pereira',      lat: 4.8133,  lon: -75.6961 },
    { nombre: 'Manizales',    lat: 5.0703,  lon: -75.5138 },
  ];

  mostrarBuscador = false;
  ciudadManual    = '';
  buscandoCiudad  = false;
  usandoGPS       = false;

  // ── Universidades ─────────────────────────────────────────
  universidades: any[]         = [];
  cargandoUniversidades        = true;
  universidadesCercanas: any[] = [];
  cargandoCercanas             = true;
  ciudadCercanas               = '';

  constructor(
    private firestore: FirestoreService,
    private auth: Auth,
    private router: Router,
    private universidadesService: UniversidadesService,
    private weatherService: WeatherService
  ) {}

  ngOnInit() {
    const user = this.auth.currentUser;
    if (!user) return;

    // Nombre del usuario
    this.nombreUsuario = user.displayName || user.email || 'Usuario';

    // Registros académicos
    this.firestore.obtenerRegistros(user.uid).subscribe(data => {
      this.registros = data;
      this.calcularEstadisticas();
      setTimeout(() => this.crearGraficas(), 100);
    });

    // Universidades de referencia
    this.universidadesService.getUniversidades().subscribe({
      next: data => { this.universidades = data.slice(0, 3); this.cargandoUniversidades = false; },
      error: ()   => { this.cargandoUniversidades = false; }
    });

    this.cargarPorIP();
  }

  cargarPorIP() {
    this.cargandoClima    = true;
    this.cargandoCercanas = true;
    this.errorClima       = false;

    this.weatherService.getUbicacionPorIP().subscribe({
      next: geo => {
        this.ciudadActual   = geo.city || 'Tu ubicación';
        this.ciudadCercanas = geo.city || '';
        this.cargarClima(geo.latitude, geo.longitude);
        this.cargarCercanas(geo.city || '');
      },
      error: () => this.seleccionarCiudad(this.ciudades[0])
    });
  }

  seleccionarCiudad(ciudad: { nombre: string; lat: number; lon: number }) {
    this.ciudadActual     = ciudad.nombre;
    this.ciudadCercanas   = ciudad.nombre;
    this.cargandoClima    = true;
    this.cargandoCercanas = true;
    this.errorClima       = false;
    this.mostrarBuscador  = false;
    this.cargarClima(ciudad.lat, ciudad.lon);
    this.cargarCercanas(ciudad.nombre);
  }

  buscarCiudadManual() {
    const ciudad = this.ciudadManual.trim();
    if (!ciudad) return;

    this.buscandoCiudad   = true;
    this.cargandoClima    = true;
    this.cargandoCercanas = true;
    this.errorClima       = false;

    this.universidadesService.geocodificar(ciudad).subscribe({
      next: resultados => {
        if (resultados && resultados.length > 0) {
          const lat = parseFloat(resultados[0].lat);
          const lon = parseFloat(resultados[0].lon);
          this.ciudadActual    = ciudad;
          this.ciudadCercanas  = ciudad;
          this.buscandoCiudad  = false;
          this.mostrarBuscador = false;
          this.ciudadManual    = '';
          this.cargarClima(lat, lon);
          this.cargarCercanas(ciudad);
        } else {
          alert(`No se encontró "${ciudad}".`);
          this.buscandoCiudad   = false;
          this.cargandoClima    = false;
          this.cargandoCercanas = false;
        }
      },
      error: () => {
        alert('Error al buscar la ciudad.');
        this.buscandoCiudad   = false;
        this.cargandoClima    = false;
        this.cargandoCercanas = false;
      }
    });
  }

  usarGPS() {
    if (!navigator.geolocation) { alert('Tu navegador no soporta geolocalización.'); return; }
    this.usandoGPS = true;
    this.cargandoClima = true;
    this.cargandoCercanas = true;

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lon } = pos.coords;
        this.weatherService.getCiudad(lat, lon).subscribe({
          next: geo => {
            const ciudad = geo.address?.city || geo.address?.town || 'Tu ubicación GPS';
            this.ciudadActual    = ciudad;
            this.ciudadCercanas  = ciudad;
            this.usandoGPS       = false;
            this.mostrarBuscador = false;
            this.cargarClima(lat, lon);
            this.cargarCercanas(ciudad);
          },
          error: () => { this.usandoGPS = false; this.cargarClima(lat, lon); }
        });
      },
      () => {
        alert('No se pudo obtener el GPS.');
        this.usandoGPS = false;
        this.cargandoClima = false;
        this.cargandoCercanas = false;
      }
    );
  }

  private cargarClima(lat: number, lon: number) {
    this.weatherService.getClima(lat, lon).subscribe({
      next: data => {
        this.clima         = data.current;
        this.climaInfo     = this.weatherService.getDescripcion(data.current.weather_code);
        this.cargandoClima = false;
        this.errorClima    = false;
      },
      error: () => { this.cargandoClima = false; this.errorClima = true; }
    });
  }

  private cargarCercanas(ciudad: string) {
    if (!ciudad) { this.cargandoCercanas = false; return; }
    this.universidadesService.buscarPorCiudad(ciudad).subscribe({
      next: unis => { this.universidadesCercanas = unis.slice(0, 3); this.cargandoCercanas = false; },
      error: ()   => { this.cargandoCercanas = false; }
    });
  }

  calcularEstadisticas() {
    if (this.registros.length === 0) return;

    let sumaNC = 0, sumaCreditos = 0, sumaNotas = 0;
    this.totalCreditos   = 0;
    this.asignaturaMayor = this.registros[0];
    this.asignaturaMenor = this.registros[0];

    this.registros.forEach(r => {
      const nota     = Number(r.nota);
      const creditos = Number(r.creditos);
      sumaNC       += nota * creditos;
      sumaCreditos += creditos;
      sumaNotas    += nota;
      this.totalCreditos += creditos;
      if (nota > Number(this.asignaturaMayor.nota)) this.asignaturaMayor = r;
      if (nota < Number(this.asignaturaMenor.nota)) this.asignaturaMenor = r;
    });

    this.promedioPonderado = sumaNC / sumaCreditos;
    this.promedioHistorico = sumaNotas / this.registros.length;

    if      (this.promedioPonderado >= 4) this.clasificacion = 'Excelente';
    else if (this.promedioPonderado >= 3) this.clasificacion = 'Aprobado';
    else                                  this.clasificacion = 'Reprobado';
  }

  crearGraficas() {
    const nombres = this.registros.map(r => r.asignatura);
    const notas   = this.registros.map(r => r.nota);

    new Chart('graficaNotas', {
      type: 'bar',
      data: { labels: nombres, datasets: [{ label: 'Notas por asignatura', data: notas, backgroundColor: '#2c7be5' }] }
    });

    let suma = 0;
    const promedios: number[] = [];
    this.registros.forEach((r, i) => { suma += Number(r.nota); promedios.push(suma / (i + 1)); });

    new Chart('graficaPromedio', {
      type: 'line',
      data: { labels: nombres, datasets: [{ label: 'Evolución del promedio', data: promedios, borderColor: '#27ae60', tension: 0.3, fill: false }] }
    });
  }

  cerrarSesion() {
    signOut(this.auth).then(() => this.router.navigate(['/login']));
  }
}
