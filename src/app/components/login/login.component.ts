import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  // Tres modos posibles
  modo: 'login' | 'registro' | 'completar' = 'login';
  cargando = false;

  // ── Campos login ──────────────────────────────────────────
  email    = '';
  password = '';

  // ── Campos registro (email) ───────────────────────────────
  primerNombre    = '';
  segundoNombre   = '';
  primerApellido  = '';
  segundoApellido = '';
  emailReg        = '';
  passwordReg     = '';

  // ── Campos "completar perfil" (Google nuevo usuario) ──────
  cPrimerNombre    = '';
  cSegundoNombre   = '';
  cPrimerApellido  = '';
  cSegundoApellido = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  // ── Nombre completo para registro email ───────────────────
  get nombreCompleto(): string {
    return [
      this.primerNombre.trim(),
      this.segundoNombre.trim(),
      this.primerApellido.trim(),
      this.segundoApellido.trim()
    ].filter(p => p !== '').join(' ');
  }

  // ── Nombre completo para completar perfil Google ──────────
  get nombreCompletoGoogle(): string {
    return [
      this.cPrimerNombre.trim(),
      this.cSegundoNombre.trim(),
      this.cPrimerApellido.trim(),
      this.cSegundoApellido.trim()
    ].filter(p => p !== '').join(' ');
  }

  // ── Login con email ───────────────────────────────────────
  loginEmail() {
    if (!this.email || !this.password) {
      alert('Por favor ingresa tu correo y contraseña.');
      return;
    }
    this.cargando = true;
    this.auth.loginEmail(this.email, this.password)
      .then(() => this.router.navigate(['/dashboard']))
      .catch(err => {
        alert(this.mensajeError(err.code));
        this.cargando = false;
      });
  }

  // ── Registro con email ────────────────────────────────────
  registrar() {
    if (!this.primerNombre.trim() || !this.primerApellido.trim()) {
      alert('El primer nombre y el primer apellido son obligatorios.');
      return;
    }
    if (!this.emailReg || !this.passwordReg) {
      alert('El correo y la contraseña son obligatorios.');
      return;
    }
    if (this.passwordReg.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    this.cargando = true;
    this.auth.registrar(this.emailReg, this.passwordReg, this.nombreCompleto)
      .then(() => {
        alert(`¡Cuenta creada para ${this.nombreCompleto}! Ya puedes iniciar sesión.`);
        this.email    = this.emailReg;
        this.password = '';
        this.modo     = 'login';
        this.cargando = false;
      })
      .catch(err => {
        alert(this.mensajeError(err.code));
        this.cargando = false;
      });
  }

  // ── Login con Google ──────────────────────────────────────
  loginGoogle() {
    this.cargando = true;
    this.auth.loginGoogle()
      .then(({ isNewUser }) => {
        this.cargando = false;
        if (isNewUser) {
          // Primera vez → pedir nombre y apellidos
          this.modo = 'completar';
        } else {
          // Ya tiene cuenta → ir al dashboard
          this.router.navigate(['/dashboard']);
        }
      })
      .catch(err => {
        alert(this.mensajeError(err.code));
        this.cargando = false;
      });
  }

  // ── Guardar nombre tras Google SSO ────────────────────────
  completarPerfil() {
    if (!this.cPrimerNombre.trim() || !this.cPrimerApellido.trim()) {
      alert('El primer nombre y el primer apellido son obligatorios.');
      return;
    }
    this.cargando = true;
    this.auth.actualizarNombre(this.nombreCompletoGoogle)
      .then(() => this.router.navigate(['/dashboard']))
      .catch(err => {
        alert(this.mensajeError(err.code));
        this.cargando = false;
      });
  }

  // ── Cambiar modo ──────────────────────────────────────────
  irARegistro() { this.modo = 'registro'; }
  irALogin()    { this.modo = 'login'; }

  // ── Mensajes amigables ────────────────────────────────────
  mensajeError(code: string): string {
    const msgs: Record<string, string> = {
      'auth/email-already-in-use'  : 'Este correo ya está registrado.',
      'auth/invalid-email'         : 'El correo electrónico no es válido.',
      'auth/weak-password'         : 'La contraseña debe tener al menos 6 caracteres.',
      'auth/user-not-found'        : 'No existe una cuenta con este correo.',
      'auth/wrong-password'        : 'Contraseña incorrecta.',
      'auth/invalid-credential'    : 'Correo o contraseña incorrectos.',
      'auth/too-many-requests'     : 'Demasiados intentos. Intenta más tarde.',
      'auth/network-request-failed': 'Error de red. Verifica tu conexión.',
      'auth/popup-closed-by-user'  : 'Cerraste la ventana de Google. Intenta de nuevo.',
    };
    return msgs[code] ?? 'Ocurrió un error inesperado. Intenta de nuevo.';
  }

}
