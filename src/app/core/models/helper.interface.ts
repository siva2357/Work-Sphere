export interface HelperCompanyOption {
  id: string;
  code: string;
  name: string;
  domain: string;
  industry?: string;
  headquarters?: string;
}

export interface HelperOrganizationalLevelOption {
  id: string;
  code: string;
  name: string;
  hierarchyTrack: string;
  rankOrder: number;
  description?: string;
}

export interface HelperSubDepartmentOption {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentCode: string;
}

export interface HelperDepartmentOption {
  id: string;
  code: string;
  name: string;
  description?: string;
  subDepartments?: HelperSubDepartmentOption[];
}

export interface HelperDesignationOption {
  id: string;
  code: string;
  title: string;
  levelCode: string;
  levelName?: string;
  hierarchyTrack: string;
  typicalReportingTo?: string;
  defaultRoleCode?: string;
}

export interface HelperRoleOption {
  id: string;
  code: string;
  name: string;
  hierarchyTrack: string;
  description?: string;
  isSystemRole?: boolean;
}

export interface HelperPermissionOption {
  id: string;
  code: string;
  module: string;
  action: string;
  description?: string;
}

export interface HelperRolePermissionOption {
  roleId: string;
  roleCode: string;
  roleName: string;
  permissionId: string;
  permissionCode: string;
  module: string;
  action: string;
  scope: string;
}

export interface HelperDropdownsResponse {
  companies: HelperCompanyOption[];
  organizationalLevels: HelperOrganizationalLevelOption[];
  departments: HelperDepartmentOption[];
  designations: HelperDesignationOption[];
  roles: HelperRoleOption[];
  permissions: HelperPermissionOption[];
  rolePermissions: HelperRolePermissionOption[];
}

