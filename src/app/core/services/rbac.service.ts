import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { RolePermissionItemDto } from '../dtos/auth.dto';
import {
  CreateDepartmentDto,
  CreateDesignationDto,
  CreateRoleDto,
  DepartmentHierarchyItem,
  DesignationItem,
  EmployeeHierarchyItem,
  OrganizationalLevelHierarchyItem,
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

  getDesignations$(): Observable<DesignationItem[]> {
    return this.http.get<DesignationItem[]>(API_ENDPOINTS.RBAC.DESIGNATIONS);
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
    return this.http.get<PermissionModuleGroup[]>(API_ENDPOINTS.RBAC.PERMISSIONS);
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
}
