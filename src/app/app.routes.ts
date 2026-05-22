import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegistroAsignaturaComponent } from './components/registro-asignatura/registro-asignatura.component';
import { HistorialComponent } from './components/historial/historial.component';
import { UniversidadesComponent } from './components/universidades/universidades.component'; // ← NUEVO

export const routes: Routes = [

  { path:'', redirectTo:'login', pathMatch:'full' },

  { path:'login', component:LoginComponent },

  { path:'dashboard', component:DashboardComponent },

  { path:'registro', component:RegistroAsignaturaComponent },

  { path:'historial', component:HistorialComponent },

  { path:'universidades', component:UniversidadesComponent }   // ← NUEVO

];
