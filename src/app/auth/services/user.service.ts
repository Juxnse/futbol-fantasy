import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, catchError } from 'rxjs';

declare const google: any;

export interface User {
  id?: string;                 // backend local
  sub: string;                 // Google o fallback
  name: string;
  email: string;
  picture?: string;
  provider: 'local' | 'google';

  // 🔹 Campos adicionales para registro
  document?: string;
  document_type?: string;
  last_name1?: string;
  last_name2?: string;
  phone?: string;
  role?: string;
  password?: string;
  re_password?: string;
}

interface AuthResponse {
  access_token?: string;
  user?: Partial<User>;
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
      localStorage.setItem('ff_user', JSON.stringify(user));
      localStorage.setItem('ff_logged_in', 'true');
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('ff_user');
      localStorage.removeItem('ff_logged_in');
    }
    this.userSubject.next(user);
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  applyUserPatch(patch: Partial<User>) {
    const current = this.getUser() ?? ({} as User);
    const merged = { ...current, ...patch };
    this.setUser(merged as User);
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

  updateUser(userId: string, data: Partial<User>): Observable<User> {
    return this.http
      .put<User>(`${this.apiUrl}/${userId}`, data, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap((u) =>
          this.setUser({ ...(this.getUser() ?? {}), ...u } as User)
        )
      );
  }

  updateMe(data: Partial<User>): Observable<User> {
    return this.http
      .put<User>(`${this.apiUrl}/me`, data, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap((u) =>
          this.setUser({ ...(this.getUser() ?? {}), ...u } as User)
        ),
        catchError(() => {
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
          if (response.user) {
            this.setUser({
              id: response.user['id'] as string,
              sub: (response.user['id'] as string) || response.user.email!,
              name: response.user.name!,
              email: response.user.email!,
              provider: 'local',
            });
          }
        })
      );
  }

  getLoggedUser(opts: { soft?: boolean } = {}): Observable<User | null> {
    return this.http
      .get<User>(`${this.apiUrl}/me`, { headers: this.getAuthHeaders() })
      .pipe(
        tap((u) =>
          this.setUser({ ...(this.getUser() ?? {}), ...u } as User)
        ),
        catchError((err) => {
          if (!opts.soft) {
            if (err?.status === 401 && this.getUser()?.provider === 'local') {
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
      sub: payload.sub || payload.email,
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
