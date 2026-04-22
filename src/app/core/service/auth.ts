import {computed, Injectable, signal} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {Router} from '@angular/router';
import {map, Observable, tap} from 'rxjs';
import {AuthPayload, CurrentUser} from '../models/models';
import {LOGIN_MUTATION, REGISTER_MUTATION} from '../graphql/operations';


const STORAGE_KEY = 'bookstore_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {


  // ── Angular Signals for reactive state ──────────────────────────────
  private _user = signal<CurrentUser | null>(this.loadFromStorage());

  /** Read-only signal – use in templates with currentUser() */
  readonly currentUser  = this._user.asReadonly();
  readonly isLoggedIn   = computed(() => this._user() !== null);
  readonly isAdmin      = computed(() => this._user()?.role === 'ADMIN');

  constructor(private apollo: Apollo, private router: Router) {}

  // ── Register ────────────────────────────────────────────────────────
  register(name: string, email: string, password: string): Observable<AuthPayload> {
    return this.apollo.mutate<{ register: AuthPayload }>({
      mutation: REGISTER_MUTATION,
      variables: { input: { name, email, password } }
    }).pipe(
      map(res => res.data!.register),
      tap(payload => this.persist(payload))
    );
  }

  // ── Login ────────────────────────────────────────────────────────────
  login(email: string, password: string): Observable<AuthPayload> {
    console.log(password);
    console.log(email);
    return this.apollo.mutate<{ login: AuthPayload }>({
      mutation: LOGIN_MUTATION,
      variables: { input: { email, password } }
    }).pipe(
      map(res => res.data!.login),
      tap(payload => this.persist(payload))
    );
  }

  // ── Logout ───────────────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._user.set(null);
    // Reset Apollo store so cached queries are cleared
    this.apollo.client.resetStore().catch(() => {});
    this.router.navigate(['/login']);
  }

  // ── Token access ─────────────────────────────────────────────────────
  getToken(): string | null {
    return this._user()?.token ?? null;
  }

  // ── Private helpers ──────────────────────────────────────────────────
  private persist(payload: AuthPayload): void {
    const user: CurrentUser = { ...payload };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  private loadFromStorage(): CurrentUser | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

}
