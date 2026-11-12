export interface SubDepartmentItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  headEmployeeId?: string;
  isActive: boolean;
}

export interface DepartmentHierarchyItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  headEmployeeId?: string;
  isActive: boolean;
  subDepartments: SubDepartmentItem[];
}

export interface CreateDepartmentDto {
  name: string;
  code: string;
  description?: string;
  parentDepartmentId?: string | null;
}

export interface UpdateDepartmentDto {
  name: string;
  description?: string;
  headEmployeeId?: string | null;
  isActive: boolean;
}

export interface DesignationItem {
  id: string;
  code: string;
  title: string;
  organizationalLevelId: string;
  levelCode?: string;
  levelName?: string;
  hierarchyTrack: string;
  typicalReportingTo?: string;
  defaultRoleCode?: string;
  responsibilities?: string;
}

export interface CreateDesignationDto {
  title: string;
  code: string;
  organizationalLevelId: string;
  hierarchyTrack: string;
  typicalReportingTo?: string;
  defaultRoleCode?: string;
  responsibilities?: string;
}

export interface UpdateDesignationDto {
  title: string;
  typicalReportingTo?: string;
  defaultRoleCode?: string;
  responsibilities?: string;
}

export interface OrganizationalLevelHierarchyItem {
  id: string;
  code: string;
  name: string;
  hierarchyTrack: string;
  rankOrder: number;
  description?: string;
  designations: DesignationItem[];
}

export interface RoleItem {
  id: string;
  code: string;
  name: string;
  hierarchyTrack: string;
  description?: string;
  isSystemRole: boolean;
  permissionCount: number;
}

export interface CreateRoleDto {
  code: string;
  name: string;
  hierarchyTrack: string;
  description?: string;
}

export interface PermissionCatalogItem {
  id: string;
  code: string;
  module: string;
  action: string;
  description?: string;
}

export interface PermissionModuleGroup {
  module: string;
  permissions: PermissionCatalogItem[];
}

import { RolePermissionItemDto } from './auth.dto';

export interface UpdateRolePermissionsDto {
  permissions: RolePermissionItemDto[];
}

export interface RolePermissionDetail {
  id?: string;
  code: string;
  action: string;
  scope: string;
}

export interface RoleModulePermissionGroup {
  module: string;
  permissions: RolePermissionDetail[];
}

export interface RolePermissionsResponse {
  id: string;
  code: string;
  name: string;
  hierarchyTrack: string;
  description?: string;
  isSystemRole: boolean;
  modules: RoleModulePermissionGroup[];
}

export interface EmployeeHierarchyReporting {
  managerName?: string;
  managerCode?: string;
  relationshipType?: string;
  isPrimary?: boolean;
}

export interface EmployeeHierarchyItem {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  portalType: string;
  departmentId?: string;
  departmentName?: string;
  departmentCode?: string;
  levelId?: string;
  levelCode?: string;
  hierarchyTrack?: string;
  designationId?: string;
  designationTitle?: string;
  roles: string[];
  reportingTo: EmployeeHierarchyReporting[];
}
