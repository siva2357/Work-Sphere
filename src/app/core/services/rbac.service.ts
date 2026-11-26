import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api.constants';
import { RolePermissionItemDto } from '../dtos/auth.dto';
import {
  CreateDepartmentDto,
  CreateDesignationDto,
  CreateRoleDto,
  DepartmentHierarchyItem,
  DesignationItem,
  EmployeeHierarchyItem,
  OrganizationalLevelHierarchyItem,
  PermissionCatalogItem,
  PermissionModuleGroup,
  RoleItem,
  RolePermissionsResponse,
  UpdateDepartmentDto,
  UpdateDesignationDto,
} from '../dtos/rbac.dto';

@Injectable({
  providedIn: 'root',
})
export class RbacService {
  private readonly http = inject(HttpClient);

  // ====================================================================
  // 1. DEPARTMENTS & SUB-DEPARTMENTS
  // ====================================================================

  getDepartments$(): Observable<DepartmentHierarchyItem[]> {
    return this.http.get<DepartmentHierarchyItem[]>(API_ENDPOINTS.RBAC.DEPARTMENTS);
  }

  createDepartment$(dto: CreateDepartmentDto): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.RBAC.DEPARTMENTS, dto);
  }

  updateDepartment$(id: string, dto: UpdateDepartmentDto): Observable<any> {
    return this.http.put<any>(API_ENDPOINTS.RBAC.DEPARTMENT_BY_ID(id), dto);
  }

  deleteDepartment$(id: string): Observable<any> {
    return this.http.delete<any>(API_ENDPOINTS.RBAC.DEPARTMENT_BY_ID(id));
  }

  // ====================================================================
  // 2. ORGANIZATIONAL LEVELS & DESIGNATIONS
  // ====================================================================

  getLevelsAndDesignations$(): Observable<OrganizationalLevelHierarchyItem[]> {
    return this.http.get<OrganizationalLevelHierarchyItem[]>(API_ENDPOINTS.RBAC.LEVELS);
  }

  updateOrganizationalLevel$(id: string, dto: { code: string; name: string; description?: string }): Observable<any> {
    return this.http.put<any>(`${API_BASE_URL}/api/rbac/levels/${id}`, dto);
  }

  getDesignations$(): Observable<DesignationItem[]> {
    return this.http.get<DesignationItem[]>(API_ENDPOINTS.RBAC.DESIGNATIONS).pipe(
      catchError(() => this.http.get<DesignationItem[]>(API_ENDPOINTS.HELPERS.DESIGNATIONS))
    );
  }

  createDesignation$(dto: CreateDesignationDto): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.RBAC.DESIGNATIONS, dto);
  }

  updateDesignation$(id: string, dto: UpdateDesignationDto): Observable<any> {
    return this.http.put<any>(API_ENDPOINTS.RBAC.DESIGNATION_BY_ID(id), dto);
  }

  deleteDesignation$(id: string): Observable<any> {
    return this.http.delete<any>(API_ENDPOINTS.RBAC.DESIGNATION_BY_ID(id));
  }

  // ====================================================================
  // 3. ROLES & RBAC PERMISSIONS MATRIX
  // ====================================================================

  getRoles$(): Observable<RoleItem[]> {
    return this.http.get<RoleItem[]>(API_ENDPOINTS.RBAC.ROLES);
  }

  createRole$(dto: CreateRoleDto): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.RBAC.ROLES, dto);
  }

  getAllPermissions$(): Observable<PermissionModuleGroup[]> {
    return this.http.get<any[]>(API_ENDPOINTS.RBAC.PERMISSIONS).pipe(
      map((res) => this.normalizePermissionGroups(res)),
      catchError(() =>
        this.http
          .get<PermissionCatalogItem[]>(API_ENDPOINTS.HELPERS.PERMISSIONS)
          .pipe(map((flat) => this.normalizePermissionGroups(flat)))
      )
    );
  }

  private normalizePermissionGroups(data: any[]): PermissionModuleGroup[] {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    // Already grouped by module
    if (data[0] && Array.isArray(data[0].permissions)) {
      return data as PermissionModuleGroup[];
    }
    // Flat list from /api/helpers/permissions -> group by module
    const groupedMap = new Map<string, PermissionCatalogItem[]>();
    for (const item of data) {
      const mod = item.module || 'General';
      if (!groupedMap.has(mod)) {
        groupedMap.set(mod, []);
      }
      groupedMap.get(mod)!.push({
        id: item.id,
        code: item.code,
        module: mod,
        action: item.action,
        description: item.description,
      });
    }
    return Array.from(groupedMap.entries()).map(([module, permissions]) => ({
      module,
      permissions,
    }));
  }

  getRolePermissions$(roleCode: string): Observable<RolePermissionsResponse> {
    return this.http.get<RolePermissionsResponse>(API_ENDPOINTS.RBAC.ROLE_PERMISSIONS(roleCode));
  }

  updateRolePermissions$(
    roleCode: string,
    permissions: RolePermissionItemDto[]
  ): Observable<any> {
    return this.http.put<any>(API_ENDPOINTS.RBAC.ROLE_PERMISSIONS(roleCode), { permissions });
  }

  // ====================================================================
  // 4. EMPLOYEES HIERARCHY
  // ====================================================================

  getEmployeesHierarchy$(): Observable<EmployeeHierarchyItem[]> {
    return this.http.get<EmployeeHierarchyItem[]>(API_ENDPOINTS.RBAC.EMPLOYEES);
  }

  getEligibleDepartmentHeads$(currentDeptId?: string): Observable<any[]> {
    const url = currentDeptId
      ? `${API_BASE_URL}/api/rbac/eligible-department-heads?currentDeptId=${currentDeptId}`
      : `${API_BASE_URL}/api/rbac/eligible-department-heads`;
    return this.http.get<any[]>(url);
  }
}
