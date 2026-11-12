import {
  DataScope,
  DepartmentCode,
  DesignationCode,
  HierarchyTrack,
  OrganizationalLevelCode,
  PermissionAction,
  PermissionModule,
  SubDepartmentCode,
  SystemRoleCode,
} from '../enums';

export interface CompanyDropdownDto {
  id: string;
  code: string;
  name: string;
  domain: string;
  industry?: string;
  headquarters?: string;
}

export interface OrganizationalLevelDropdownDto {
  id: string;
  code: OrganizationalLevelCode | string;
  name: string;
  hierarchyTrack: HierarchyTrack | string;
  rankOrder: number;
  description?: string;
}

export interface SubDepartmentDropdownDto {
  id: string;
  code: SubDepartmentCode | string;
  name: string;
  description?: string;
  parentCode: DepartmentCode | string;
}

export interface DepartmentDropdownDto {
  id: string;
  code: DepartmentCode | string;
  name: string;
  description?: string;
  subDepartments?: SubDepartmentDropdownDto[];
}

export interface DesignationDropdownDto {
  id: string;
  code: DesignationCode | string;
  title: string;
  levelCode: OrganizationalLevelCode | string;
  levelName?: string;
  hierarchyTrack: HierarchyTrack | string;
  typicalReportingTo?: string;
  defaultRoleCode?: SystemRoleCode | string;
}

export interface RoleDropdownDto {
  id: string;
  code: SystemRoleCode | string;
  name: string;
  hierarchyTrack: HierarchyTrack | string;
  description?: string;
  isSystemRole?: boolean;
}

export interface PermissionDropdownDto {
  id: string;
  code: string;
  module: PermissionModule | string;
  action: PermissionAction | string;
  description?: string;
}

export interface RolePermissionDropdownDto {
  roleId: string;
  roleCode: SystemRoleCode | string;
  roleName: string;
  permissionId: string;
  permissionCode: string;
  module: PermissionModule | string;
  action: PermissionAction | string;
  scope: DataScope | string;
}

export interface HelperDropdownsResponseDto {
  companies: CompanyDropdownDto[];
  organizationalLevels: OrganizationalLevelDropdownDto[];
  departments: DepartmentDropdownDto[];
  designations: DesignationDropdownDto[];
  roles: RoleDropdownDto[];
  permissions: PermissionDropdownDto[];
  rolePermissions: RolePermissionDropdownDto[];
}

