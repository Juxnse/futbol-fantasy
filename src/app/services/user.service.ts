import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://football-fantasy-back.onrender.com/users';

  // ⚠️ Reemplaza con tu CLIENT_ID real de Google
  private clientId = '41563777174-th5masuqcivb0t3eb30brqsugd1ojjrh.apps.googleusercontent.com';
  private googleReady: Promise<void>;
  private googleReadyResolver!: () => void;

  constructor(private http: HttpClient) {
    // Configurar promesa para esperar librería de Google
    this.googleReady = new Promise<void>((resolve) => {
      this.googleReadyResolver = resolve;
    });
    this.waitForGoogle();
  }

  // ---------------------------
  // Token helpers
  // ---------------------------
  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private clearToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  // ---------------------------
  // Users CRUD
  // ---------------------------
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/`, {
      headers: this.getAuthHeaders()
    });
  }

  createUser(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/`, userData);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateUser(userId: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${userId}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  // ---------------------------
  // Auth (backend)
  // ---------------------------
  loginUser(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.access_token) {
          this.setToken(response.access_token);
        }
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      })
    );
  }

  logoutUser(): void {
    this.clearToken();
  }

  getLoggedUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`, {
      headers: this.getAuthHeaders()
    });
  }

  // ---------------------------
  // Helpers para UI
  // ---------------------------
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserFromLocal(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // ---------------------------
  // Google Login
  // ---------------------------
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

    // Guardar en localStorage (coherente con backend login)
    localStorage.setItem(
      'user',
      JSON.stringify({
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        provider: 'google',
      })
    );
    this.setToken(resp.credential); // Guardamos el token de Google como token

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
