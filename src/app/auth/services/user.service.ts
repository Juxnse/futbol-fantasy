import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  tap,
  of,
  catchError,
} from 'rxjs';

declare const google: any;

export interface User {
  id?: string;
  name: string;
  email: string;
  picture?: string;
  provider?: 'local' | 'google';
  [k: string]: any;
}

interface AuthResponse {
  access_token?: string;
  user?: User;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'https://football-fantasy-back.onrender.com/users';

  private clientId =
    '41563777174-th5masuqcivb0t3eb30brqsugd1ojjrh.apps.googleusercontent.com';

  private googleReady: Promise<void>;
  private googleReadyResolver!: () => void;

  private userSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  readonly user$ = this.userSubject.asObservable();
  readonly token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.googleReady = new Promise<void>((resolve) => {
      this.googleReadyResolver = resolve;
    });
    this.waitForGoogle();

    // 🔹 Sincroniza con localStorage
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? (JSON.parse(userRaw) as User) : null;
    if (token) this.tokenSubject.next(token);
    if (user) this.userSubject.next(user);
  }

  // ===========================
  // Token
  // ===========================
  private setToken(token: string | null): void {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    this.tokenSubject.next(token);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return new HttpHeaders(headers);
  }

  // ===========================
  // User helpers
  // ===========================
  private setUser(user: User | null): void {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      // 🔹 Compatibilidad con torneos
      localStorage.setItem('ff_user', JSON.stringify(user));
      localStorage.setItem('ff_logged_in', 'true');
    } else {
      localStorage.removeItem('user');
      // 🔹 Limpieza para torneos
      localStorage.removeItem('ff_user');
      localStorage.removeItem('ff_logged_in');
    }
    this.userSubject.next(user);
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  /** ✅ Actualiza el usuario en memoria + localStorage (para Perfil) */
  applyUserPatch(patch: Partial<User>) {
    const current = this.getUser() ?? ({} as User);
    const merged = { ...current, ...patch };
    this.setUser(merged);
  }

  isLoggedIn(): boolean {
    return !!this.getToken() || !!localStorage.getItem('ff_logged_in');
  }

  // ===========================
  // Users CRUD
  // ===========================
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/`, {
      headers: this.getAuthHeaders(),
    });
  }

  createUser(userData: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/`, userData);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${userId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  /** 🔄 Actualiza por ID y sincroniza el estado local */
  updateUser(userId: string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, data, {
      headers: this.getAuthHeaders(),
    })
    .pipe(tap(u => this.setUser({ ...(this.getUser() ?? {}), ...u } as User)));
  }

  /** 🔄 PUT /users/me (si tu backend lo soporta). Hace fallback local si falla. */
  updateMe(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, data, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap(u => this.setUser({ ...(this.getUser() ?? {}), ...u } as User)),
      catchError(() => {
        // si no existe el endpoint, al menos actualiza localmente
        this.applyUserPatch(data);
        return of(this.getUser() as User);
      })
    );
  }

  // ===========================
  // Auth
  // ===========================
  loginUser(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          if (response.access_token) this.setToken(response.access_token);
          if (response.user) this.setUser({ ...response.user, provider: 'local' });
        })
      );
  }

  // UserService
  getLoggedUser(opts: { soft?: boolean } = {}): Observable<User | null> {
    return this.http
      .get<User>(`${this.apiUrl}/me`, { headers: this.getAuthHeaders() })
      .pipe(
        tap(u => this.setUser({ ...(this.getUser() ?? {}), ...u } as User)),
        catchError(err => {
          // Si estamos en modo "soft", NO hagas logout (útil para login Google o si el backend no reconoce el token)
          if (!opts.soft) {
            // solo cierra sesión si de verdad quieres comportamiento estricto
            if (err?.status === 401 && (this.getUser()?.provider === 'local')) {
              this.logoutUser();
            }
          }
          return of(null);
        })
      );
  }

  logoutUser(): void {
    this.setToken(null);
    this.setUser(null);
    // 🔹 Extra por seguridad
    localStorage.removeItem('ff_user');
    localStorage.removeItem('ff_logged_in');
  }

  // ===========================
  // Google Login
  // ===========================
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
      auto_select: false,
      cancel_on_tap_outside: true,
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

    const user: User = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      provider: 'google',
    };

    this.setUser(user);
    this.setToken(resp.credential);

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
