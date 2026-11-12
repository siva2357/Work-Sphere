import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { AUTH_TOKEN_KEY } from '../interceptors/auth.interceptor';
import { TokenService } from './token.service';
import {
  AuthenticatedUser,
  EffectiveModulePermission,
  LoginResponse,
  RegisteredCompany,
  RegisteredCompanySummary,
} from '../models/auth.interface';

export type {
  AuthenticatedUser,
  EffectiveModulePermission,
  LoginResponse,
  RegisteredCompany,
  RegisteredCompanySummary,
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);
  private readonly USER_STORAGE_KEY = 'worksphere_current_user';

  private readonly currentUserSubject = new BehaviorSubject<AuthenticatedUser | null>(
    this.loadStoredUser()
  );
  readonly currentUser$ = this.currentUserSubject.asObservable();

  private readonly companiesSubject = new BehaviorSubject<RegisteredCompany[]>([]);
  readonly companies$ = this.companiesSubject.asObservable();

  /**
   * Synchronous property getter for the currently authenticated user.
   */
  get currentUser(): AuthenticatedUser | null {
    return this.currentUserSubject.value;
  }

  getCurrentUser(): AuthenticatedUser | null {
    return this.currentUserSubject.value;
  }

  private loadStoredUser(): AuthenticatedUser | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(this.USER_STORAGE_KEY);
      if (raw) {
        try {
          return JSON.parse(raw) as AuthenticatedUser;
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Authenticates against POST /api/auth/login using email and password.
   * The backend automatically resolves the user's company, hierarchy level, roles, and portal type.
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      })
      .pipe(
        tap((res) => {
          const normalizedUser: AuthenticatedUser = {
            ...res.user,
            organizationalLevel: res.user.organizationalLevel || res.user.levelCode,
          };
          this.tokenService.setToken(res.token);
          this.tokenService.setRole(normalizedUser.portalType);
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(AUTH_TOKEN_KEY, res.token);
            localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(normalizedUser));
            localStorage.setItem('role', normalizedUser.portalType);
            if (normalizedUser.companyCode) {
              localStorage.setItem('companyCode', normalizedUser.companyCode);
            }
            if (normalizedUser.employeeCode) {
              localStorage.setItem('employeeCode', normalizedUser.employeeCode);
            }
          }
          this.currentUserSubject.next(normalizedUser);
        })
      );
  }

  /**
   * Refreshes the current authenticated user's profile & permissions from GET /api/auth/me.
   */
  fetchCurrentUser(): Observable<AuthenticatedUser | null> {
    return this.http.get<AuthenticatedUser>(API_ENDPOINTS.AUTH.ME).pipe(
      tap((user) => {
        const normalizedUser: AuthenticatedUser = {
          ...user,
          organizationalLevel: user.organizationalLevel || user.levelCode,
        };
        this.tokenService.setRole(normalizedUser.portalType);
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(normalizedUser));
          localStorage.setItem('role', normalizedUser.portalType);
        }
        this.currentUserSubject.next(normalizedUser);
      }),
      catchError(() => of(this.currentUserSubject.value))
    );
  }

  /**
   * Fetches the registered companies from GET /api/companies.
   */
  fetchCompanies(): Observable<{ totalCompanies: number; companies: RegisteredCompany[] }> {
    return this.http
      .get<{ totalCompanies: number; companies: RegisteredCompany[] }>(
        API_ENDPOINTS.COMPANIES.GET_ALL
      )
      .pipe(
        tap((res) => {
          if (res?.companies) {
            this.companiesSubject.next(res.companies);
          }
        }),
        catchError(() => of({ totalCompanies: 0, companies: [] }))
      );
  }

  logout(): void {
    this.tokenService.clearAll();
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(this.USER_STORAGE_KEY);
      localStorage.removeItem('role');
      localStorage.removeItem('companyCode');
      localStorage.removeItem('employeeCode');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return (
      (this.tokenService.isAuthenticated() ||
        (typeof window !== 'undefined' && !!localStorage.getItem(AUTH_TOKEN_KEY))) &&
      !!this.currentUserSubject.value
    );
  }

  getCurrentEmployeeCode(): string {
    const user = this.currentUserSubject.value;
    if (user?.employeeCode) return user.employeeCode;
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('employeeCode') || 'EMP-005';
    }
    return 'EMP-005';
  }

  getCurrentManagerCode(): string {
    const user = this.currentUserSubject.value;
    if (user?.employeeCode && this.isManagerOrLeadership()) {
      return user.employeeCode;
    }
    return 'EMP-004';
  }

  getCurrentCompanyCode(): string {
    const user = this.currentUserSubject.value;
    if (user?.companyCode) return user.companyCode;
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('companyCode') || 'CMP-001';
    }
    return 'CMP-001';
  }

  /**
   * Evaluates whether the current user has a specific module & action permission from the Backend RBAC engine.
   */
  hasPermission(moduleName: string, action: string = 'View'): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return true;

    const mod = user.permissions.find(
      (p) => p.module.toLowerCase() === moduleName.toLowerCase()
    );
    if (!mod) return false;

    return (
      mod.actions.some((a) => a.toLowerCase() === action.toLowerCase()) ||
      mod.actions.some((a) => a.toLowerCase() === 'manage')
    );
  }

  /**
   * Returns true if the logged-in user is in Leadership/Management (L1-L6 Employee Track or H1-H4 HR Track)
   * or holds Team/Project/Department/Organization scope on management modules.
   */
  isManagerOrLeadership(): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return true;

    const level = (user.levelCode || user.organizationalLevel || '').toUpperCase();
    if (['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'H1', 'H2', 'H3', 'H4'].includes(level)) {
      return true;
    }

    return user.permissions.some(
      (p) =>
        ['Tasks', 'Projects', 'Teams', 'Attendance', 'Leave'].includes(p.module) &&
        ['Team', 'Project', 'Department', 'Organization'].includes(p.highestScope)
    );
  }
}
