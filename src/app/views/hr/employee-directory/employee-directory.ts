import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyDirectoryService } from '../../../core/services/company-directory.service';
import { AuthService } from '../../../core/services/auth.service';
import { DropdownService } from '../../../core/services/dropdown.service';
import {
  CreateDirectoryEmployeePayload,
  EmployeeRecord
} from '../../../core/models/company-directory.interface';
import {
  HelperDepartmentOption,
  HelperDesignationOption,
  HelperOrganizationalLevelOption,
  HelperRoleOption
} from '../../../core/models/helper.interface';
import {
  SAMPLE_105_EMPLOYEES,
  SAMPLE_EMPLOYEES_CSV_HEADER,
  generateSampleEmployeesCsv
} from '../../../core/constants/sample-employees.data';
import { StatCards, StatMetric } from '../../../library/shared/components/stat-cards/stat-cards';
import { EmployeeCard } from '../../../library/shared/components/employee-card/employee-card';
import { Button } from '../../../library/UI/components/button/button';

export type { EmployeeRecord };

@Component({
  selector: 'app-employee-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, StatCards, EmployeeCard, Button],
  templateUrl: './employee-directory.html',
  styleUrl: './employee-directory.css',
})
export class EmployeeDirectory implements OnInit {
  private companyDirectoryService = inject(CompanyDirectoryService);
  private authService = inject(AuthService);
  private dropdownService = inject(DropdownService);

  searchTerm = '';
  selectedDepartment = 'All';
  selectedStatus = 'All';
  viewMode: 'grid' | 'table' = 'grid';
  activeCompanyCode = 'CMP-001';
  activeCompanyName = '';

  showAddEmployeeModal = false;
  showProfileModal = false;
  showImportModal = false;
  isEditMode = false;
  editingEmployeeId: string | null = null;
  selectedEmployee: EmployeeRecord | null = null;

  // Bulk CSV Import State
  isUploading = false;
  importFileName = '';
  importSuccessMsg = '';
  importErrors: string[] = [];
  parsedImportEmployees: CreateDirectoryEmployeePayload[] = [];

  departmentsList: HelperDepartmentOption[] = [];
  levelsList: HelperOrganizationalLevelOption[] = [];
  designationsList: HelperDesignationOption[] = [];
  rolesList: HelperRoleOption[] = [];

  newEmployee = {
    name: '',
    email: '',
    phone: '',
    department: 'ENG',
    subDepartment: '',
    levelCode: 'L8',
    role: 'DESIG_DEV',
    systemRole: 'EMP_DEVELOPER',
    type: 'Full-time' as 'Full-time' | 'Contract' | 'Intern',
    status: 'Active' as 'Active' | 'Remote' | 'On Leave',
    location: 'Bangalore, India',
    manager: '',
    joiningDate: new Date().toISOString().split('T')[0],
  };

  readonly workLocationsList: string[] = [
    'Bangalore, India',
    'Hyderabad, India',
    'Pune, India',
    'Mumbai, India',
    'Chennai, India',
    'Delhi NCR, India',
    'Remote (India)',
  ];

  employees: EmployeeRecord[] = [];

  get statCards(): StatMetric[] {
    const activeCount = this.employees.filter((e) => e.status === 'Active' || !e.status).length;
    return [
      {
        title: 'Total Workforce',
        value: this.employees.length,
        subtitle: 'Active in Company Directory',
        badgeText: '100% Real DB',
        badgeType: 'emerald',
        icon: 'bi-people',
      },
      {
        title: 'Active Today',
        value: activeCount,
        subtitle: 'Available on duty',
        badgeText: 'Active',
        badgeType: 'success',
        icon: 'bi-person-check',
      },
      {
        title: 'Departments',
        value: this.departmentsList.length || 22,
        subtitle: 'Across organization',
        badgeText: 'Seeded',
        badgeType: 'info',
        icon: 'bi-diagram-3',
      },
      {
        title: 'Company Access',
        value: this.activeCompanyCode,
        subtitle: 'Main HR Provisioned',
        badgeText: 'Verified',
        badgeType: 'emerald',
        icon: 'bi-shield-check',
      },
    ];
  }

  ngOnInit(): void {
    const companyCode = this.authService.getCurrentCompanyCode();
    this.activeCompanyCode = companyCode;
    this.loadHelperDropdowns();
    this.loadDirectoryFromBackend(companyCode);
  }

  loadHelperDropdowns(): void {
    this.dropdownService.dropdowns$.subscribe((dropdowns) => {
      this.departmentsList = dropdowns.departments || [];
      this.levelsList = dropdowns.organizationalLevels || [];
      this.designationsList = dropdowns.designations || [];
      this.rolesList = dropdowns.roles || [];
    });
  }

  get subDepartmentsForSelectedDept() {
    const found = this.departmentsList.find((d) => d.code === this.newEmployee.department);
    return found?.subDepartments || [];
  }

  get selectedDesignationInfo(): HelperDesignationOption | undefined {
    return this.designationsList.find((d) => d.code === this.newEmployee.role);
  }

  private parseRankFromLevelCode(levelStr?: string): { track: string; rank: number; code: string } {
    if (!levelStr) return { track: 'Employee', rank: 8, code: 'L8' };
    const match = levelStr.toUpperCase().match(/\b([LH])(\d{1,2})\b/);
    if (match) {
      return {
        track: match[1] === 'H' ? 'HR' : 'Employee',
        rank: parseInt(match[2], 10),
        code: `${match[1]}${match[2]}`,
      };
    }
    return { track: 'Employee', rank: 8, code: 'L8' };
  }

  /**
   * Computes eligible Reporting Managers from the employee directory based on:
   * 1. Selected Organizational Level (managers must have higher seniority / lower rank number than the employee)
   * 2. Selected Department (same-department leaders prioritized first)
   * 3. Designation's TypicalReportingTo & Executive fallback options
   */
  get reportingManagerOptions(): { value: string; label: string; group: string }[] {
    const currentLvl = this.parseRankFromLevelCode(this.newEmployee.levelCode);
    const selectedDeptObj = this.departmentsList.find((d) => d.code === this.newEmployee.department);
    const selectedDeptName = (selectedDeptObj?.name || this.newEmployee.department).toLowerCase();

    const sameDeptManagers: { value: string; label: string; group: string; rank: number }[] = [];
    const crossDeptManagers: { value: string; label: string; group: string; rank: number }[] = [];

    for (const emp of this.employees) {
      if (this.editingEmployeeId && emp.id === this.editingEmployeeId) {
        continue;
      }

      const empLvl = this.parseRankFromLevelCode(emp.role);
      // Manager should be strictly more senior (lower rank number, e.g. L1..L7 for an L8 employee)
      // or L1/H1 executive if the employee is also Rank 1
      const isMoreSenior =
        currentLvl.rank === 1 ? empLvl.rank === 1 : empLvl.rank < currentLvl.rank;

      if (!isMoreSenior) {
        continue;
      }

      const isSameDept =
        emp.department.toLowerCase().includes(selectedDeptName) ||
        selectedDeptName.includes(emp.department.toLowerCase());

      const optionItem = {
        value: emp.name,
        label: `${emp.name} — ${emp.role} [${emp.department}] (${emp.id})`,
        group: isSameDept ? 'Department Leadership' : 'Organization & HR Leadership',
        rank: empLvl.rank,
      };

      if (isSameDept) {
        sameDeptManagers.push(optionItem);
      } else {
        crossDeptManagers.push(optionItem);
      }
    }

    // Sort by seniority rank (closest senior manager or top leader)
    sameDeptManagers.sort((a, b) => a.rank - b.rank);
    crossDeptManagers.sort((a, b) => a.rank - b.rank);

    const combined: { value: string; label: string; group: string }[] = [
      ...sameDeptManagers,
      ...crossDeptManagers,
    ];

    // Also include typical reporting role / executive fallbacks so dropdown is always rich even before bulk import
    const typical = this.selectedDesignationInfo?.typicalReportingTo;
    if (typical && !combined.some((o) => o.value.toLowerCase() === typical.toLowerCase())) {
      combined.push({
        value: typical,
        label: `${typical} (Default Reporting Line for ${this.newEmployee.levelCode})`,
        group: 'Standard Reporting Line',
      });
    }

    if (currentLvl.rank === 1) {
      combined.unshift({
        value: 'CEO / Board',
        label: 'CEO / Board of Directors (Executive Governance)',
        group: 'Executive Board',
      });
    }

    if (
      this.newEmployee.manager &&
      !combined.some((o) => o.value.toLowerCase() === this.newEmployee.manager.toLowerCase())
    ) {
      combined.unshift({
        value: this.newEmployee.manager,
        label: `${this.newEmployee.manager} (Current Assigned Manager)`,
        group: 'Assigned',
      });
    }

    return combined;
  }

  onDepartmentChange(deptCode: string): void {
    this.newEmployee.department = deptCode;
    this.newEmployee.subDepartment = '';
    this.autoSelectReportingManager();
  }

  onLevelChange(levelCode: string): void {
    this.newEmployee.levelCode = levelCode;
    const matchingDesigs = this.designationsList.filter((d) => d.levelCode === levelCode);
    if (matchingDesigs.length > 0) {
      this.newEmployee.role = matchingDesigs[0].code;
      if (matchingDesigs[0].defaultRoleCode) {
        this.newEmployee.systemRole = matchingDesigs[0].defaultRoleCode;
      }
    }
    this.autoSelectReportingManager();
  }

  onDesignationChange(desigCode: string): void {
    const found = this.designationsList.find((d) => d.code === desigCode);
    if (found) {
      this.newEmployee.levelCode = found.levelCode;
      if (found.defaultRoleCode) {
        this.newEmployee.systemRole = found.defaultRoleCode;
      }
    }
    this.autoSelectReportingManager();
  }

  private autoSelectReportingManager(): void {
    const options = this.reportingManagerOptions;
    if (options.length > 0) {
      this.newEmployee.manager = options[0].value;
    }
  }

  loadDirectoryFromBackend(companyCode: string = 'CMP-001'): void {
    const avatars = [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    ];

    this.companyDirectoryService.getEmployeeDirectory$(companyCode).subscribe((res) => {
      if (res?.company) {
        this.activeCompanyCode = res.company.companyCode || companyCode;
        this.activeCompanyName = res.company.name || '';
      }
      if (res?.employees) {
        this.employees = res.employees.map((e, idx) => ({
          id: e.employeeCode || e.id,
          name: e.name,
          role: `${e.role} (${e.level})`,
          department: e.department,
          email: e.email,
          phone: e.phone || '+91 98450 12345',
          location: e.location || 'Bangalore, India',
          status: (e.status as EmployeeRecord['status']) || 'Active',
          joiningDate: e.joiningDate || '',
          avatar: avatars[idx % avatars.length],
          type: (e.type as EmployeeRecord['type']) || 'Full-time',
          manager: e.manager || 'Department Head',
        }));
      }
    });
  }

  get filteredEmployees(): EmployeeRecord[] {
    return this.employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesDept =
        this.selectedDepartment === 'All' ||
        emp.department.toLowerCase().includes(this.selectedDepartment.toLowerCase());
      const matchesStatus =
        this.selectedStatus === 'All' || emp.status === this.selectedStatus;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }

  viewProfile(emp: EmployeeRecord): void {
    this.selectedEmployee = emp;
    this.showProfileModal = true;
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
    this.selectedEmployee = null;
  }

  openAddEmployee(): void {
    this.isEditMode = false;
    this.editingEmployeeId = null;
    const defaultDept = this.departmentsList[0]?.code || 'ENG';
    const defaultDesig =
      this.designationsList.find((d) => d.code === 'DESIG_DEV') || this.designationsList[0];

    this.newEmployee = {
      name: '',
      email: '',
      phone: '',
      department: defaultDept,
      subDepartment: '',
      levelCode: defaultDesig?.levelCode || 'L8',
      role: defaultDesig?.code || 'DESIG_DEV',
      systemRole: defaultDesig?.defaultRoleCode || 'EMP_DEVELOPER',
      type: 'Full-time',
      status: 'Active',
      location: 'Bangalore, India',
      manager: '',
      joiningDate: new Date().toISOString().split('T')[0],
    };
    this.autoSelectReportingManager();
    this.showAddEmployeeModal = true;
  }

  openEditEmployee(emp: EmployeeRecord): void {
    this.showProfileModal = false;
    this.isEditMode = true;
    this.editingEmployeeId = emp.id;
    this.selectedEmployee = emp;

    let matchedParentCode = 'ENG';
    let matchedSubCode = '';

    for (const d of this.departmentsList) {
      if (
        d.name.toLowerCase() === emp.department.toLowerCase() ||
        d.code.toLowerCase() === emp.department.toLowerCase()
      ) {
        matchedParentCode = d.code;
        break;
      }
      const sub = d.subDepartments?.find(
        (s) =>
          s.name.toLowerCase() === emp.department.toLowerCase() ||
          s.code.toLowerCase() === emp.department.toLowerCase()
      );
      if (sub) {
        matchedParentCode = d.code;
        matchedSubCode = sub.code;
        break;
      }
    }

    const matchedDesig = this.designationsList.find((d) =>
      emp.role.toLowerCase().includes(d.title.toLowerCase())
    );
    const parsedLvl = this.parseRankFromLevelCode(emp.role);

    // Format joiningDate to YYYY-MM-DD for <input type="date">
    let formattedJoinDate = new Date().toISOString().split('T')[0];
    if (emp.joiningDate) {
      const parsedDate = new Date(emp.joiningDate);
      if (!isNaN(parsedDate.getTime())) {
        formattedJoinDate = parsedDate.toISOString().split('T')[0];
      }
    }

    const cleanManager =
      emp.manager && emp.manager !== 'Department Head' ? emp.manager : '';

    this.newEmployee = {
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      department: matchedParentCode,
      subDepartment: matchedSubCode,
      levelCode: matchedDesig?.levelCode || parsedLvl.code || 'L8',
      role: matchedDesig?.code || 'DESIG_DEV',
      systemRole: matchedDesig?.defaultRoleCode || 'EMP_DEVELOPER',
      type: emp.type || 'Full-time',
      status: emp.status || 'Active',
      location: emp.location || 'Bangalore, India',
      manager: cleanManager,
      joiningDate: formattedJoinDate,
    };

    if (!this.newEmployee.manager) {
      this.autoSelectReportingManager();
    }

    this.showAddEmployeeModal = true;
  }

  closeAddEmployee(): void {
    this.showAddEmployeeModal = false;
    this.isEditMode = false;
    this.editingEmployeeId = null;
  }

  saveEmployee(): void {
    if (!this.newEmployee.name || !this.newEmployee.email) return;

    const targetDeptCode = this.newEmployee.subDepartment || this.newEmployee.department;
    const matchedDept = this.departmentsList.find((d) => d.code === this.newEmployee.department);
    const matchedSub = matchedDept?.subDepartments?.find(
      (s) => s.code === this.newEmployee.subDepartment
    );
    const displayDeptName = matchedSub?.name || matchedDept?.name || targetDeptCode;

    if (this.isEditMode && this.editingEmployeeId) {
      const matchedDesig = this.designationsList.find((d) => d.code === this.newEmployee.role);
      const roleDisplay = matchedDesig
        ? `${matchedDesig.title} (${matchedDesig.levelCode})`
        : this.selectedEmployee?.role || this.newEmployee.role;

      this.employees = this.employees.map((emp) =>
        emp.id === this.editingEmployeeId
          ? {
            ...emp,
            name: this.newEmployee.name,
            email: this.newEmployee.email,
            phone: this.newEmployee.phone,
            department: displayDeptName,
            role: roleDisplay,
            type: this.newEmployee.type,
            status: this.newEmployee.status,
            location: this.newEmployee.location,
            manager: this.newEmployee.manager || emp.manager,
            joiningDate: this.newEmployee.joiningDate || emp.joiningDate,
          }
          : emp
      );
      this.closeAddEmployee();
      return;
    }

    this.companyDirectoryService
      .createEmployeeByMainHr$(
        {
          fullName: this.newEmployee.name,
          email: this.newEmployee.email,
          phone: this.newEmployee.phone,
          departmentCode: targetDeptCode,
          designationCode: this.newEmployee.role || 'DESIG_DEV',
          roleCode: this.newEmployee.systemRole || 'EMP_DEVELOPER',
          employmentType: this.newEmployee.type,
          workLocation: this.newEmployee.location,
          managerEmployeeCode: this.newEmployee.manager,
        },
        this.activeCompanyCode
      )
      .subscribe(() => {
        this.closeAddEmployee();
        this.loadDirectoryFromBackend(this.activeCompanyCode);
      });
  }

  // =========================================================================
  // EXPORT ROSTER & BULK CSV IMPORT
  // =========================================================================

  /**
   * Exports the currently displayed employee directory to a CSV file.
   */
  exportRosterToCsv(): void {
    const listToExport = this.filteredEmployees.length > 0 ? this.filteredEmployees : this.employees;
    this.companyDirectoryService.exportDirectoryCsv(
      listToExport,
      `WorkSphere_Employee_Roster_${this.activeCompanyCode}_${new Date().toISOString().split('T')[0]}.csv`
    );
  }

  openImportModal(): void {
    this.showImportModal = true;
    this.importFileName = '';
    this.importErrors = [];
    this.importSuccessMsg = '';
    this.parsedImportEmployees = [];
  }

  closeImportModal(): void {
    this.showImportModal = false;
    this.isUploading = false;
  }

  /**
   * Downloads a clean template CSV with standard headers.
   */
  downloadTemplateCsv(): void {
    const templateContent = [
      SAMPLE_EMPLOYEES_CSV_HEADER,
      '"Example User","user@worksphere.com","ENG","DESIG_DEV","EMP_DEVELOPER","Full-time","Bangalore, India","+91 98450 12345","Welcome@12345","HR-001"'
    ].join('\r\n');

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'WorkSphere_Employee_Import_Template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Instantly loads all 105 sample pre-configured employees into the preview table!
   */
  loadSample100Employees(): void {
    this.importFileName = 'sample_100_employees.csv (Built-in 105 Records)';
    this.importErrors = [];
    this.importSuccessMsg = '';
    this.parsedImportEmployees = SAMPLE_105_EMPLOYEES.map((e) => ({
      fullName: e.fullName,
      email: e.email,
      departmentCode: e.departmentCode,
      designationCode: e.designationCode,
      roleCode: e.roleCode,
      employmentType: e.employmentType,
      workLocation: e.workLocation,
      phone: e.phone,
      initialPassword: e.initialPassword,
      managerEmployeeCode: e.managerEmployeeCode,
    }));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.parseCsvFile(file);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.parseCsvFile(file);
    }
  }

  private parseCsvFile(file: File): void {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.importErrors = ['Please upload a valid .csv file format.'];
      return;
    }

    this.importFileName = file.name;
    this.importErrors = [];
    this.importSuccessMsg = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      this.parseCsvContent(text);
    };
    reader.onerror = () => {
      this.importErrors = ['Error reading file. Please try again.'];
    };
    reader.readAsText(file);
  }

  private parseCsvContent(csvText: string): void {
    if (!csvText || !csvText.trim()) {
      this.importErrors = ['Uploaded CSV file is empty.'];
      return;
    }

    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      this.importErrors = ['CSV file must have at least one header row and one data row.'];
      return;
    }

    const headerCols = this.parseCsvLine(lines[0])
      .map((h) => h.trim().toLowerCase().replace(/[\s_-]/g, ''));

    const idxName = headerCols.findIndex((h) => h === 'fullname' || h === 'name');
    const idxEmail = headerCols.findIndex((h) => h === 'email' || h === 'workemail');
    const idxDept = headerCols.findIndex((h) => h === 'departmentcode' || h === 'department' || h === 'dept');
    const idxDesig = headerCols.findIndex((h) => h === 'designationcode' || h === 'designation' || h === 'role');
    const idxRole = headerCols.findIndex((h) => h === 'rolecode' || h === 'systemrole' || h === 'systemrolecode');
    const idxType = headerCols.findIndex((h) => h === 'employmenttype' || h === 'type');
    const idxLoc = headerCols.findIndex((h) => h === 'worklocation' || h === 'location');
    const idxPhone = headerCols.findIndex((h) => h === 'phone' || h === 'phonenumber');
    const idxPassword = headerCols.findIndex((h) => h === 'initialpassword' || h === 'password');
    const idxManager = headerCols.findIndex((h) => h === 'manageremployeecode' || h === 'manager');

    if (idxName === -1 || idxEmail === -1) {
      this.importErrors = [
        'Invalid CSV headers. The file must contain at least "FullName" and "Email" columns.',
        'Expected headers: FullName, Email, DepartmentCode, DesignationCode, RoleCode, EmploymentType, WorkLocation, Phone, InitialPassword, ManagerEmployeeCode'
      ];
      return;
    }

    const parsed: CreateDirectoryEmployeePayload[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = this.parseCsvLine(lines[i]);
      if (cols.length <= Math.max(idxName, idxEmail)) continue;

      const name = cols[idxName]?.trim();
      const email = cols[idxEmail]?.trim();

      if (!name || !email) {
        errors.push(`Row ${i + 1}: Skipped due to missing Name or Email.`);
        continue;
      }

      parsed.push({
        fullName: name,
        email: email,
        departmentCode: idxDept >= 0 && cols[idxDept] ? cols[idxDept].trim() : 'ENG',
        designationCode: idxDesig >= 0 && cols[idxDesig] ? cols[idxDesig].trim() : 'DESIG_DEV',
        roleCode: idxRole >= 0 && cols[idxRole] ? cols[idxRole].trim() : 'EMP_DEVELOPER',
        employmentType: idxType >= 0 && cols[idxType] ? (cols[idxType].trim() as any) : 'Full-time',
        workLocation: idxLoc >= 0 && cols[idxLoc] ? cols[idxLoc].trim() : 'Bangalore, India',
        phone: idxPhone >= 0 && cols[idxPhone] ? cols[idxPhone].trim() : '+91 98450 55667',
        initialPassword: idxPassword >= 0 && cols[idxPassword] ? cols[idxPassword].trim() : 'Welcome@12345',
        managerEmployeeCode: idxManager >= 0 && cols[idxManager] ? cols[idxManager].trim() : '',
      });
    }

    this.parsedImportEmployees = parsed;
    this.importErrors = errors;
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  }

  /**
   * Submits the parsed employees array to POST /api/companies/{companyCode}/directory/bulk-import
   */
  submitBulkImport(): void {
    if (this.parsedImportEmployees.length === 0) return;

    this.isUploading = true;
    this.importErrors = [];
    this.importSuccessMsg = '';

    this.companyDirectoryService
      .bulkImportEmployees$(this.parsedImportEmployees, this.activeCompanyCode)
      .subscribe({
        next: (res) => {
          this.isUploading = false;
          const imported = res?.totalImported ?? this.parsedImportEmployees.length;
          const skipped = res?.totalSkipped ?? 0;
          this.importSuccessMsg = `Successfully imported ${imported} employees into ${this.activeCompanyCode}! ${skipped > 0 ? `(${skipped} skipped/duplicate)` : ''
            }`;

          // Reload employee directory from PostgreSQL
          this.loadDirectoryFromBackend(this.activeCompanyCode);

          setTimeout(() => {
            this.closeImportModal();
          }, 1500);
        },
        error: (err) => {
          this.isUploading = false;
          const msg = err?.error?.message || 'Error occurred while importing employees. Please check data format.';
          this.importErrors = [msg];
        },
      });
  }
}
