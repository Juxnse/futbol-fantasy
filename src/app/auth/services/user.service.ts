import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User } from '../models/user.model';

declare const google: any;

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly USERS_KEY = 'ff_users';
  private readonly USER_KEY = 'ff_user';
  private readonly LOGGED_KEY = 'ff_logged_in';

  private readonly GOOGLE_CLIENT_ID = '41563777174-th5masuqcivb0t3eb30brqsugd1ojjrh.apps.googleusercontent.com';

  private userSubject = new BehaviorSubject<User | null>(null);
  readonly user$ = this.userSubject.asObservable();

  constructor() {
    const savedUser = localStorage.getItem(this.USER_KEY);
    if (savedUser) this.userSubject.next(JSON.parse(savedUser));
  }

  // 🧩 Obtener usuarios locales
  private getAllUsers(): User[] {
    return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
  }

  private saveAllUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  // 🧩 Registro local
  createUser(user: Omit<User, 'id'>): Observable<User> {
    const users = this.getAllUsers();
    if (users.some(u => u.email === user.email)) {
      return throwError(() => new Error('El correo ya está registrado'));
    }

    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      provider: 'local'
    };

    users.push(newUser);
    this.saveAllUsers(users);
    return of(newUser);
  }

  // 🧩 Login local
  loginUser(credentials: { email: string; password: string }): Observable<User> {
    const users = this.getAllUsers();
    const found = users.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (!found) {
      return throwError(() => new Error('Credenciales inválidas'));
    }

    this.setUser(found);
    return of(found);
  }

  // 🧩 Setear sesión
  private setUser(user: User | null) {
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      localStorage.setItem(this.LOGGED_KEY, 'true');
      this.userSubject.next(user);
    } else {
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.LOGGED_KEY);
      this.userSubject.next(null);
    }
  }

  // 🧩 Obtener usuario logueado
  getUser(): User | null {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.LOGGED_KEY) === 'true';
  }

  logout(): void {
    this.setUser(null);
  }

  // ============================================================
  // 🔹 INICIO DE SESIÓN CON GOOGLE
  // ============================================================

  async initGoogle() {
    if (typeof google === 'undefined') return;

    google.accounts.id.initialize({
      client_id: this.GOOGLE_CLIENT_ID,
      callback: (resp: any) => this.handleGoogleCredential(resp),
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }

  async renderGoogleButton(elementId: string) {
    if (typeof google === 'undefined') return;

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
      id: crypto.randomUUID(),
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      provider: 'google',
      createdAt: new Date().toISOString(),
    };

    this.setUser(user);

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

// Export explícito para evitar errores TS
export type { User };
