export interface SampleEmployeeData {
  employeeCode?: string;
  fullName: string;
  email: string;
  departmentCode: string;
  levelCode?: string;
  designationCode: string;
  roleCode: string;
  employmentType: 'Full-time' | 'Contract' | 'Intern';
  workLocation: string;
  phone: string;
  initialPassword: string;
  managerEmployeeCode?: string;
}

export const SAMPLE_EMPLOYEES_CSV_HEADER = "EmployeeCode,FullName,Email,DepartmentCode,LevelCode,JobTitle,RoleCode,EmploymentType,WorkLocation,Phone,InitialPassword,ManagerEmployeeCode";

export const SAMPLE_105_EMPLOYEES: SampleEmployeeData[] = [
  // ==================== IT DEPARTMENT HIERARCHY ====================
  // 1. The Director (L2)
  {
    employeeCode: "SUBK-IT-001",
    fullName: "Murali Mohan Reddy",
    email: "murali.mohan.reddy@subk.co.in",
    departmentCode: "IT",
    levelCode: "L2",
    designationCode: "Director of Technology & CTO",
    roleCode: "EMP_ORG_ADMIN",
    employmentType: "Full-time",
    workLocation: "Hyderabad HQ, India",
    phone: "+91 98490 20001",
    initialPassword: "Murali@123",
    managerEmployeeCode: "HR-001"
  },
  // 2. Department Head (L3)
  {
    employeeCode: "SUBK-IT-002",
    fullName: "Tanvi Agarwal",
    email: "tanvi.agarwal@subk.co.in",
    departmentCode: "IT",
    levelCode: "L3",
    designationCode: "Head of IT & Software Engineering",
    roleCode: "EMP_DEPT_MANAGER",
    employmentType: "Full-time",
    workLocation: "Hyderabad HQ, India",
    phone: "+91 98490 20002",
    initialPassword: "Tanvi@123",
    managerEmployeeCode: "SUBK-IT-001"
  },
  // 3. Project Manager (L4)
  {
    employeeCode: "SUBK-IT-003",
    fullName: "Devendra Joshi",
    email: "devendra.joshi@subk.co.in",
    departmentCode: "IT",
    levelCode: "L4",
    designationCode: "Engineering Project Manager",
    roleCode: "EMP_PROJECT_MANAGER",
    employmentType: "Full-time",
    workLocation: "Hyderabad HQ, India",
    phone: "+91 98490 20003",
    initialPassword: "Devendra@123",
    managerEmployeeCode: "SUBK-IT-002"
  },
  // 4. Team Lead (L6)
  {
    employeeCode: "SUBK-IT-004",
    fullName: "Abhishek Varma",
    email: "abhishek.varma@subk.co.in",
    departmentCode: "IT",
    levelCode: "L6",
    designationCode: "Technical Team Lead",
    roleCode: "EMP_TEAM_LEAD",
    employmentType: "Full-time",
    workLocation: "Hyderabad HQ, India",
    phone: "+91 98490 20004",
    initialPassword: "Abhishek@123",
    managerEmployeeCode: "SUBK-IT-003"
  },
  // 5. Developer (Lowest / L8)
  {
    employeeCode: "SUBK-IT-005",
    fullName: "Rahul Verma",
    email: "rahul.verma@subk.co.in",
    departmentCode: "IT",
    levelCode: "L8",
    designationCode: "Software Engineer",
    roleCode: "EMP_EMPLOYEE",
    employmentType: "Full-time",
    workLocation: "Hyderabad HQ, India",
    phone: "+91 98490 20005",
    initialPassword: "Rahul@123",
    managerEmployeeCode: "SUBK-IT-004"
  },

  // ==================== HR DEPARTMENT HIERARCHY ====================
  // 6. Head of HR (L3) - Reports to Main HR Admin
  {
    employeeCode: "SUBK-HR-001",
    fullName: "Nandita Deshpande",
    email: "nandita.deshpande@subk.co.in",
    departmentCode: "HR",
    levelCode: "L3",
    designationCode: "Head of People & Human Resources",
    roleCode: "EMP_DEPT_MANAGER",
    employmentType: "Full-time",
    workLocation: "Hyderabad HQ, India",
    phone: "+91 98490 30001",
    initialPassword: "Nandita@123",
    managerEmployeeCode: "HR-001"
  },
  // 7. HR Payroll Lead (L5) - Reports to Head of HR
  {
    employeeCode: "SUBK-HR-002",
    fullName: "Sunita Mukherjee",
    email: "sunita.mukherjee@subk.co.in",
    departmentCode: "HR",
    levelCode: "L5",
    designationCode: "HR Payroll & Compensation Manager",
    roleCode: "EMP_PAYROLL_ADMIN",
    employmentType: "Full-time",
    workLocation: "Hyderabad HQ, India",
    phone: "+91 98490 30002",
    initialPassword: "Sunita@123",
    managerEmployeeCode: "SUBK-HR-001"
  },
  // 8. Senior HR Generalist (L6) - Reports to Head of HR
  {
    employeeCode: "SUBK-HR-003",
    fullName: "Vikrant Pathak",
    email: "vikrant.pathak@subk.co.in",
    departmentCode: "HR",
    levelCode: "L6",
    designationCode: "Senior HR Business Partner & Generalist",
    roleCode: "EMP_HR_EXECUTIVE",
    employmentType: "Full-time",
    workLocation: "Hyderabad HQ, India",
    phone: "+91 98490 30003",
    initialPassword: "Vikrant@123",
    managerEmployeeCode: "SUBK-HR-001"
  },
  // 9. Junior HR Associate (L9) - Reports to Senior HR Generalist
  {
    employeeCode: "SUBK-HR-004",
    fullName: "Divya Teja",
    email: "divya.teja@subk.co.in",
    departmentCode: "HR",
    levelCode: "L9",
    designationCode: "Junior HR Operations Associate",
    roleCode: "EMP_EMPLOYEE",
    employmentType: "Full-time",
    workLocation: "Hyderabad HQ, India",
    phone: "+91 98490 30004",
    initialPassword: "Divya@123",
    managerEmployeeCode: "SUBK-HR-003"
  }
];
