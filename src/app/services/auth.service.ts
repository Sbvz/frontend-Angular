import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  getAdditionalUserInfo,
  signOut
} from '@angular/fire/auth';

import { user } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth) {}

  // Registro con email, contraseña y nombre completo
  async registrar(email: string, password: string, displayName: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    if (displayName.trim()) {
      await updateProfile(cred.user, { displayName: displayName.trim() });
    }
    return cred;
  }

  loginEmail(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // Google SSO — devuelve también si es usuario nuevo
  async loginGoogle(): Promise<{ isNewUser: boolean }> {
    const provider = new GoogleAuthProvider();
    const cred     = await signInWithPopup(this.auth, provider);
    const info     = getAdditionalUserInfo(cred);
    return { isNewUser: info?.isNewUser ?? false };
  }

  // Actualizar nombre completo en Firebase Auth
  async actualizarNombre(displayName: string) {
    const u = this.auth.currentUser;
    if (u) {
      await updateProfile(u, { displayName: displayName.trim() });
    }
  }

  logout() {
    return signOut(this.auth);
  }

  getUser(): Observable<any> {
    return user(this.auth);
  }

}
