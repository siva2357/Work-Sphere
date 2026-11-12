import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  /**
   * Fetches an employee's personal documents (Offer Letter, Hike Letter, Promotion Letter, Relieving Letter)
   * + company-wide Policy documents from GET /api/documents/my/{employeeCode}.
   */
  getMyDocuments$(employeeCode?: string, category?: string): Observable<any> {
    const code = employeeCode || this.authService.getCurrentEmployeeCode();
    const params: Record<string, string> = {};
    if (category && category !== 'ALL') {
      params['category'] = category;
    }
    return this.http
      .get<any>(API_ENDPOINTS.WORKSPACE.MY_DOCUMENTS(code), { params })
      .pipe(catchError(() => of(null)));
  }

  /**
   * Fetches an employee's compensation profile, YTD summary, and monthly payroll slips
   * from GET /api/payroll/my/{employeeCode}.
   */
  getMyPayroll$(employeeCode?: string): Observable<any> {
    const code = employeeCode || this.authService.getCurrentEmployeeCode();
    return this.http
      .get<any>(API_ENDPOINTS.WORKSPACE.MY_PAYROLL(code))
      .pipe(catchError(() => of(null)));
  }

  /**
   * Fetches all 22 Top-Level Company Departments and their nested Subdepartments from GET /api/rbac/departments.
   */
  getDepartmentsHierarchy$(): Observable<any[]> {
    return this.http
      .get<any[]>(API_ENDPOINTS.RBAC.DEPARTMENTS)
      .pipe(catchError(() => of([])));
  }

  /**
   * Fetches all Organizational Levels (L1-L10 & H1-H6) and Designations from GET /api/rbac/levels.
   */
  getOrganizationalLevels$(): Observable<any[]> {
    return this.http
      .get<any[]>(API_ENDPOINTS.RBAC.LEVELS)
      .pipe(catchError(() => of([])));
  }

  /**
   * Fetches all 23 System Roles from GET /api/rbac/roles.
   */
  getSystemRoles$(): Observable<any[]> {
    return this.http
      .get<any[]>(API_ENDPOINTS.RBAC.ROLES)
      .pipe(catchError(() => of([])));
  }
}
