import { Injectable } from '@angular/core';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;

  // ⚠️ Reemplaza con tu CLIENT_ID real de Google
  private clientId = '41563777174-th5masuqcivb0t3eb30brqsugd1ojjrh.apps.googleusercontent.com';
  private googleReady: Promise<void>;
  private googleReadyResolver!: () => void;

  constructor() {
    // Revisar si hay sesión previa
    this.loggedIn = localStorage.getItem('ff_logged_in') === 'true';

    // Promesa que se resuelve cuando la librería de Google esté lista
    this.googleReady = new Promise<void>((resolve) => {
      this.googleReadyResolver = resolve;
    });
    this.waitForGoogle();
  }

  // ------------------------
  // 🔹 REGISTRO LOCAL
  // ------------------------
  register(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // ------------------------
  // 🔹 LOGIN LOCAL
  // ------------------------
  login(email: string, password: string): boolean {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return false;

    const user = JSON.parse(savedUser);
    if (user.email === email && user.password === password) {
      this.loggedIn = true;
      localStorage.setItem('ff_logged_in', 'true');
      localStorage.setItem('ff_user', JSON.stringify(user));
      return true;
    }
    return false;
  }

  // ------------------------
  // 🔹 LOGOUT
  // ------------------------
  logout() {
    localStorage.removeItem('ff_user');
    localStorage.removeItem('ff_logged_in');
    this.loggedIn = false;
  }

  // ------------------------
  // 🔹 CHECK LOGIN
  // ------------------------
  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  // ------------------------
  // 🔹 GOOGLE LOGIN
  // ------------------------
  private waitForGoogle() {
    const check = () => {
      const ok =
        typeof window !== 'undefined' &&
        (window as any).google &&
        (window as any).google.accounts &&
        (window as any).google.accounts.id;
      if (ok) this.googleReadyResolver();
      else setTimeout(check, 50);
    };
    check();
  }

  async initGoogle() {
    await this.googleReady;
    google.accounts.id.initialize({
      client_id: this.clientId,
      callback: (resp: any) => this.handleGoogleCredential(resp),
    });
  }

  async renderGoogleButton(elementId: string) {
    await this.googleReady;
    const el = document.getElementById(elementId);
    if (!el) return;
    google.accounts.id.renderButton(el, {
      theme: 'filled_blue',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'center',
      width: 240,
    });
  }

  private handleGoogleCredential(resp: { credential: string }) {
    const payload = this.parseJwt(resp.credential);

    console.log('Usuario Google:', payload);

    // Guardar en localStorage
    localStorage.setItem(
      'ff_user',
      JSON.stringify({
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        provider: 'google',
      })
    );
    localStorage.setItem('ff_logged_in', 'true');
    this.loggedIn = true;

    // 🔔 Notificar a los componentes que Google login fue exitoso
    const event = new CustomEvent('googleLoginSuccess');
    window.dispatchEvent(event);
  }

  private parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }
}
