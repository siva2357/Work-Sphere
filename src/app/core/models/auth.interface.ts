export type UserRole = 'hr' | 'employee';

export interface EffectiveModulePermission {
  module: string;
  actions: string[];
  actionScopes: Record<string, string>;
  highestScope: 'Own' | 'Team' | 'Project' | 'Department' | 'Organization';
}

export interface AuthenticatedUser {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  companyId?: string;
  companyCode?: string;
  companyName?: string;
  companyDomain?: string;
  isMainHr: boolean;
  portalType: 'hr' | 'employee';
  hierarchyTrack?: 'Employee' | 'HR';
  levelCode?: string; // L1..L10 or H1..H6
  organizationalLevel?: string;
  levelName?: string;
  designationTitle?: string;
  departmentName?: string;
  reportingManagerName?: string;
  roles: string[];
  permissions: EffectiveModulePermission[];
}

export interface LoginResponse {
  token: string;
  user: AuthenticatedUser;
}

export interface RegisteredCompany {
  id: string;
  companyCode: string;
  externalRegistrationId: string;
  name: string;
  domain: string;
  industry: string;
  companySize: string;
  headquarters: string;
  subscriptionPlan: string;
  mainHrAccess: {
    employeeCode: string;
    fullName: string;
    email: string;
    level: string;
    canCreateEmployeesInDirectory: boolean;
  };
  stats: {
    totalEmployees: number;
    hrPortalUsers: number;
    employeePortalUsers: number;
  };
}

export interface RegisteredCompanySummary {
  id: string;
  companyCode: string;
  companyName: string;
  industry: string;
  mainHrEmail: string;
  mainHrName: string;
  totalEmployees: number;
}

export interface QuickDemoAccount {
  label: string;
  roleBadge: string;
  companyCode: string;
  email: string;
  password: string;
  portal: 'hr' | 'employee';
}

export interface ProfileData {
  id: string;
  fullName: string;
  preferredName: string;
  email: string;
  personalEmail: string;
  phone: string;
  roleTitle: string;
  department: string;
  division: string;
  reportingManager: string;
  joiningDate: string;
  location: string;
  workMode: string;
  avatar: string;
  bio: string;
  bloodGroup: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  hrMetrics?: {
    workforceManaged: number;
    pendingApprovals: number;
    activeJobOpenings: number;
    policiesAuthored: number;
  };
  empMetrics?: {
    leaveBalance: number;
    attendanceRate: number;
    tasksCompleted: number;
    performanceScore: number;
  };
  bankDetails: {
    bankName: string;
    accountMasked: string;
    taxId: string;
    pfNumber: string;
  };
  skills: string[];
}

