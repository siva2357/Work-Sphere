export interface DirectoryEmployeeRecord {
  id: string;
  employeeCode: string;
  name: string;
  role: string;
  level: string;
  hierarchyTrack: string;
  department: string;
  departmentCode: string;
  email: string;
  phone: string;
  location: string;
  status: 'Active' | 'On Leave' | 'Remote';
  joiningDate: string;
  avatar: string;
  type: 'Full-time' | 'Contract' | 'Intern';
  manager: string;
  portalType: 'hr' | 'employee';
  isMainHr: boolean;
  companyCode: string;
  companyName: string;
  systemRoles: string[];
}

export interface CreateDirectoryEmployeePayload {
  createdByHrEmailOrCode?: string;
  fullName: string;
  email: string;
  initialPassword?: string;
  phone?: string;
  departmentCode: string;
  designationCode?: string;
  roleCode?: string;
  employmentType: 'Full-time' | 'Contract' | 'Intern';
  workLocation: string;
  managerEmployeeCode?: string;
}

export interface EmployeeRecord {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  status: 'Active' | 'On Leave' | 'Remote';
  joiningDate: string;
  avatar: string;
  type: 'Full-time' | 'Contract' | 'Intern';
  manager: string;
}

