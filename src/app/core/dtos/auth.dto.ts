import { DataScope, HierarchyTrack, PortalType } from '../enums';

export interface LoginRequestDto {
  email: string;
  password: string;
  companyCode?: string;
}

export interface EffectiveModulePermissionDto {
  module: string;
  actions: string[];
  actionScopes: Record<string, DataScope | string>;
  highestScope: DataScope | string;
}

export interface AuthenticatedEmployeeDto {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  companyId?: string;
  companyCode?: string;
  companyName?: string;
  companyDomain?: string;
  isMainHr: boolean;
  portalType: PortalType | string;
  hierarchyTrack?: HierarchyTrack | string;
  levelCode?: string;
  levelName?: string;
  designationTitle?: string;
  departmentName?: string;
  roles: string[];
  permissions: EffectiveModulePermissionDto[];
}

export interface LoginResponseDto {
  token: string;
  user: AuthenticatedEmployeeDto;
}

export interface RolePermissionItemDto {
  permissionCode: string;
  scope: DataScope | string;
}

export interface UpdateRolePermissionsRequestDto {
  permissions: RolePermissionItemDto[];
}

export interface UpsertPermissionOverrideRequestDto {
  permissionCode: string;
  isGranted: boolean;
  scope: DataScope | string;
  reason?: string;
  expiresAt?: string;
}

