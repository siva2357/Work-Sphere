import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, catchError, map } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  CompanyDropdownDto,
  DepartmentDropdownDto,
  DesignationDropdownDto,
  HelperDropdownsResponseDto,
  OrganizationalLevelDropdownDto,
  PermissionDropdownDto,
  RoleDropdownDto,
  RolePermissionDropdownDto,
} from '../dtos';
import {
  DataScope,
  DepartmentCode,
  DesignationCode,
  HierarchyTrack,
  OrganizationalLevelCode,
  PermissionAction,
  PermissionModule,
  PortalType,
  SubDepartmentCode,
  SystemRoleCode,
} from '../enums';
import {
  HelperCompanyOption,
  HelperDepartmentOption,
  HelperDesignationOption,
  HelperDropdownsResponse,
  HelperOrganizationalLevelOption,
  HelperPermissionOption,
  HelperRoleOption,
  HelperRolePermissionOption,
} from '../models/helper.interface';

export {
  DataScope,
  DepartmentCode,
  DesignationCode,
  HierarchyTrack,
  OrganizationalLevelCode,
  PermissionAction,
  PermissionModule,
  PortalType,
  SubDepartmentCode,
  SystemRoleCode,
};

export type {
  CompanyDropdownDto,
  DepartmentDropdownDto,
  DesignationDropdownDto,
  HelperDropdownsResponseDto,
  OrganizationalLevelDropdownDto,
  PermissionDropdownDto,
  RoleDropdownDto,
  RolePermissionDropdownDto,
};

export type {
  HelperCompanyOption as CompanyDropdownItem,
  HelperDepartmentOption as DepartmentDropdownItem,
  HelperDesignationOption as DesignationDropdownItem,
  HelperDropdownsResponse as DropdownsResponse,
  HelperOrganizationalLevelOption as OrganizationalLevelDropdownItem,
  HelperPermissionOption as PermissionDropdownItem,
  HelperRoleOption as RoleDropdownItem,
  HelperRolePermissionOption as RolePermissionDropdownItem,
};

@Injectable({
  providedIn: 'root',
})
export class DropdownService {
  private readonly http = inject(HttpClient);

  private readonly dropdownsSubject = new BehaviorSubject<HelperDropdownsResponse>({
    companies: [],
    organizationalLevels: [],
    departments: [],
    designations: [],
    roles: [],
    permissions: [],
    rolePermissions: [],
  });

  readonly dropdowns$ = this.dropdownsSubject.asObservable();
  readonly companies$ = this.dropdowns$.pipe(map((d) => d.companies || []));
  readonly organizationalLevels$ = this.dropdowns$.pipe(map((d) => d.organizationalLevels || []));
  readonly departments$ = this.dropdowns$.pipe(map((d) => d.departments || []));
  readonly designations$ = this.dropdowns$.pipe(map((d) => d.designations || []));
  readonly roles$ = this.dropdowns$.pipe(map((d) => d.roles || []));
  readonly permissions$ = this.dropdowns$.pipe(map((d) => d.permissions || []));
  readonly rolePermissions$ = this.dropdowns$.pipe(map((d) => d.rolePermissions || []));

  constructor() {
    this.loadAllDropdowns();
  }

  /**
   * Loads all seeded dropdown lists from GET /api/helpers/dropdowns into state.
   */
  loadAllDropdowns(): void {
    this.getAllDropdowns$().subscribe();
  }

  /**
   * Fetches all dropdown lists (companies, organizationalLevels, departments, designations, roles, permissions, rolePermissions)
   * from GET /api/helpers/dropdowns.
   */
  getAllDropdowns$(): Observable<HelperDropdownsResponse> {
    return this.http.get<HelperDropdownsResponse>(API_ENDPOINTS.HELPERS.DROPDOWNS).pipe(
      tap((res) => {
        if (res) {
          this.dropdownsSubject.next(res);
        }
      }),
      catchError(() => of(this.dropdownsSubject.value))
    );
  }

  /**
   * Fetches company dropdown options from GET /api/helpers/companies.
   */
  getCompanies$(): Observable<HelperCompanyOption[]> {
    return this.http.get<HelperCompanyOption[]>(API_ENDPOINTS.HELPERS.COMPANIES).pipe(
      catchError(() => of(this.dropdownsSubject.value.companies))
    );
  }

  /**
   * Fetches organizational level dropdown options (L1-L10, H1-H6) from GET /api/helpers/organizational-levels.
   */
  getOrganizationalLevels$(track?: string): Observable<HelperOrganizationalLevelOption[]> {
    let params = new HttpParams();
    if (track) params = params.set('track', track);
    return this.http
      .get<HelperOrganizationalLevelOption[]>(API_ENDPOINTS.HELPERS.ORGANIZATIONAL_LEVELS, { params })
      .pipe(catchError(() => of(this.dropdownsSubject.value.organizationalLevels)));
  }

  /**
   * Fetches department & sub-department dropdown options from GET /api/helpers/departments.
   */
  getDepartments$(includeSubDepartments = true): Observable<HelperDepartmentOption[]> {
    const params = new HttpParams().set('includeSubDepartments', String(includeSubDepartments));
    return this.http
      .get<HelperDepartmentOption[]>(API_ENDPOINTS.HELPERS.DEPARTMENTS, { params })
      .pipe(catchError(() => of(this.dropdownsSubject.value.departments)));
  }

  /**
   * Fetches designation dropdown options from GET /api/helpers/designations.
   */
  getDesignations$(levelCode?: string, track?: string): Observable<HelperDesignationOption[]> {
    let params = new HttpParams();
    if (levelCode) params = params.set('levelCode', levelCode);
    if (track) params = params.set('track', track);
    return this.http
      .get<HelperDesignationOption[]>(API_ENDPOINTS.HELPERS.DESIGNATIONS, { params })
      .pipe(catchError(() => of(this.dropdownsSubject.value.designations)));
  }

  /**
   * Fetches system role dropdown options from GET /api/helpers/roles.
   */
  getRoles$(track?: string): Observable<HelperRoleOption[]> {
    let params = new HttpParams();
    if (track) params = params.set('track', track);
    return this.http
      .get<HelperRoleOption[]>(API_ENDPOINTS.HELPERS.ROLES, { params })
      .pipe(catchError(() => of(this.dropdownsSubject.value.roles)));
  }

  /**
   * Fetches atomic permission dropdown options from GET /api/helpers/permissions.
   */
  getPermissions$(module?: string): Observable<HelperPermissionOption[]> {
    let params = new HttpParams();
    if (module) params = params.set('module', module);
    return this.http
      .get<HelperPermissionOption[]>(API_ENDPOINTS.HELPERS.PERMISSIONS, { params })
      .pipe(catchError(() => of(this.dropdownsSubject.value.permissions)));
  }

  /**
   * Fetches role-permission mappings from GET /api/helpers/role-permissions.
   */
  getRolePermissions$(roleCode?: string): Observable<HelperRolePermissionOption[]> {
    let params = new HttpParams();
    if (roleCode) params = params.set('roleCode', roleCode);
    return this.http
      .get<HelperRolePermissionOption[]>(API_ENDPOINTS.HELPERS.ROLE_PERMISSIONS, { params })
      .pipe(catchError(() => of(this.dropdownsSubject.value.rolePermissions)));
  }
}

