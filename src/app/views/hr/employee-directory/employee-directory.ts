import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
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
  SAMPLE_EMPLOYEES_CSV_HEADER
} from '../../../core/constants/sample-employees.data';
import { StatCards, StatMetric } from '../../../library/shared/components/stat-cards/stat-cards';
import { EmployeeCard } from '../../../library/shared/components/employee-card/employee-card';
import {
  Alert,
  Badge,
  BadgeVariant,
  Button,
  Chip,
  InputDropdownOption,
  InputField,
  Pagination,
  Table,
  TableColumn,
} from '../../../library/UI/components';

export type { EmployeeRecord };

export interface EmployeeTableRow extends EmployeeRecord {
  sno: number;
  initials?: string;
}

export interface ActiveFilterChip {
  key: 'search' | 'department' | 'status';
  label: string;
  icon: string;
}

@Component({
  selector: 'app-employee-directory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatCards,
    EmployeeCard,
    Button,
    InputField,
    Badge,
    Chip,
    Alert,
    Table,
    Pagination,
  ],
  templateUrl: './employee-directory.html',
  styleUrl: './employee-directory.css',
})
export class EmployeeDirectory implements OnInit {
  private companyDirectoryService = inject(CompanyDirectoryService);
  private authService = inject(AuthService);
  private dropdownService = inject(DropdownService);

  @ViewChild('profileImgTpl', { static: true }) profileImgTpl!: TemplateRef<any>;
  @ViewChild('deptTpl', { static: true }) deptTpl!: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;

  tableColumns: TableColumn[] = [];
  isLoadingDirectory = false;

  // Draft Filter Inputs (bound to the filter controls)
  draftSearchTerm = '';
  draftDepartment = 'All';
  draftStatus = 'All';

  // Applied Filter Values
  searchTerm = '';
  selectedDepartment = 'All';
  selectedStatus = 'All';

  currentPage = 1;
  pageSize = 10;
  effectiveCurrentPage = 1;

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

  // Cached Dropdown & View Arrays (prevents infinite change detection loops in ngx-datatable)
  departmentFilterOptions: InputDropdownOption[] = [{ label: 'All Departments', value: 'All' }];
  departmentFormOptions: InputDropdownOption[] = [];
  subDepartmentFormOptions: InputDropdownOption[] = [];
  levelFormOptions: InputDropdownOption[] = [];
  designationFormOptions: InputDropdownOption[] = [];
  roleFormOptions: InputDropdownOption[] = [];
  reportingManagerOptions: { value: string; label: string; group: string }[] = [];

  employees: EmployeeRecord[] = [];
  filteredEmployees: EmployeeRecord[] = [];
  paginatedEmployees: EmployeeTableRow[] = [];
  activeFilterChips: ActiveFilterChip[] = [];
  statCards: StatMetric[] = [];

  newEmployee = {
    name: '',
    email: '',
    phone: '',
    department: 'IT',
    subDepartment: '',
    levelCode: 'L8',
    jobTitle: '',
    role: 'EMP_EMPLOYEE',
    systemRole: 'EMP_EMPLOYEE',
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

  readonly statusFilterOptions: InputDropdownOption[] = [
    { label: 'All Statuses', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Remote', value: 'Remote' },
    { label: 'On Leave', value: 'On Leave' },
  ];

  readonly employmentTypeOptions: string[] = ['Full-time', 'Contract', 'Intern'];
  readonly workStatusOptions: string[] = ['Active', 'Remote', 'On Leave'];

  ngOnInit(): void {
    this.initTableColumns();
    const companyCode = this.authService.getCurrentCompanyCode();
    this.activeCompanyCode = companyCode;
    this.rebuildStatCards();
    this.loadHelperDropdowns();
    this.loadDirectoryFromBackend(companyCode);
  }

  /**
   * 12 Table Columns:
   * S.No, Employee ID, Profile Image, Full Name, Email, Department,
   * Designation, Reporting Manager, Location, Employment, Status, Actions
   */
  private initTableColumns(): void {
    this.tableColumns = [
      {
        field: 'sno',
        headerName: 'S.No',
        width: 75,
      },
      {
        field: 'id',
        headerName: 'Employee ID',
        width: 120,
      },
      {
        field: 'avatar',
        headerName: 'Profile Image',
        cellTemplate: this.profileImgTpl,
        width: 115,
      },
      {
        field: 'name',
        headerName: 'Full Name',
        width: 185,
      },
      {
        field: 'email',
        headerName: 'Email',
        width: 245,
      },
      {
        field: 'department',
        headerName: 'Department',
        cellTemplate: this.deptTpl,
        width: 245,
      },
      {
        field: 'role',
        headerName: 'Designation',
        width: 215,
      },
      {
        field: 'manager',
        headerName: 'Reporting Manager',
        width: 195,
      },
      {
        field: 'location',
        headerName: 'Location',
        width: 155,
      },
      {
        field: 'type',
        headerName: 'Employment',
        width: 120,
      },
      {
        field: 'status',
        headerName: 'Status',
        cellTemplate: this.statusTpl,
        width: 115,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        cellTemplate: this.actionsTpl,
        width: 90,
      },
    ];
  }

  loadHelperDropdowns(): void {
    this.dropdownService.dropdowns$.subscribe((dropdowns) => {
      this.departmentsList = dropdowns.departments || [];
      this.levelsList = dropdowns.organizationalLevels || [];
      this.designationsList = dropdowns.designations || [];
      this.rolesList = dropdowns.roles || [];

      this.departmentFilterOptions = [
        { label: 'All Departments', value: 'All' },
        ...this.departmentsList.map((dept) => ({
          label: `${dept.name} (${dept.code})`,
          value: dept.name,
        })),
      ];

      this.departmentFormOptions = this.departmentsList.map((dept) => ({
        label: `${dept.name} (${dept.code})`,
        value: dept.code,
      }));

      this.levelFormOptions = this.levelsList.map((lvl) => ({
        label: `${lvl.code} — ${lvl.name} (${lvl.hierarchyTrack})`,
        value: lvl.code,
      }));

      this.designationFormOptions = this.designationsList.map((desig) => ({
        label: `${desig.title} (${desig.levelCode})`,
        value: desig.code,
      }));

      this.roleFormOptions = this.rolesList.map((r) => ({
        label: `${r.name} (${r.code})`,
        value: r.code,
      }));

      this.rebuildSubDepartmentOptions();
      this.rebuildStatCards();
    });
  }

  private rebuildSubDepartmentOptions(): void {
    const found = this.departmentsList.find((d) => d.code === this.newEmployee.department);
    const subs = found?.subDepartments || [];
    this.subDepartmentFormOptions = subs.map((sub) => ({
      label: `${sub.name} (${sub.code})`,
      value: sub.code,
    }));
  }

  private rebuildStatCards(): void {
    const activeCount = this.employees.filter((e) => e.status === 'Active' || !e.status).length;
    this.statCards = [
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

  private rebuildActiveFilterChips(): void {
    const chips: ActiveFilterChip[] = [];
    if (this.searchTerm.trim()) {
      chips.push({
        key: 'search',
        label: `Search: "${this.searchTerm.trim()}"`,
        icon: 'bi-search',
      });
    }
    if (this.selectedDepartment && this.selectedDepartment !== 'All') {
      chips.push({
        key: 'department',
        label: `Department: ${this.selectedDepartment}`,
        icon: 'bi-diagram-3',
      });
    }
    if (this.selectedStatus && this.selectedStatus !== 'All') {
      chips.push({
        key: 'status',
        label: `Status: ${this.selectedStatus}`,
        icon: 'bi-check2-circle',
      });
    }
    this.activeFilterChips = chips;
  }

  /**
   * Computes and caches filteredEmployees and paginatedEmployees so ngx-datatable
   * receives stable array references instead of re-rendering infinitely.
   */
  private updateDirectoryView(): void {
    const q = this.searchTerm.toLowerCase();
    this.filteredEmployees = this.employees.filter((emp) => {
      const matchesSearch =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.id.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        (emp.manager || '').toLowerCase().includes(q);
      const matchesDept =
        this.selectedDepartment === 'All' ||
        emp.department.toLowerCase().includes(this.selectedDepartment.toLowerCase());
      const matchesStatus =
        this.selectedStatus === 'All' || emp.status === this.selectedStatus;
      return matchesSearch && matchesDept && matchesStatus;
    });

    const totalPages = Math.max(1, Math.ceil(this.filteredEmployees.length / this.pageSize));
    this.effectiveCurrentPage = Math.min(Math.max(1, this.currentPage), totalPages);

    const start = (this.effectiveCurrentPage - 1) * this.pageSize;
    this.paginatedEmployees = this.filteredEmployees
      .slice(start, start + this.pageSize)
      .map((emp, idx) => ({
        ...emp,
        sno: start + idx + 1,
      }));

    this.rebuildActiveFilterChips();
    this.rebuildStatCards();
  }

  applyFilters(): void {
    this.searchTerm = this.draftSearchTerm.trim();
    this.selectedDepartment = this.draftDepartment || 'All';
    this.selectedStatus = this.draftStatus || 'All';
    this.currentPage = 1;
    this.updateDirectoryView();
  }

  resetFilters(): void {
    this.draftSearchTerm = '';
    this.draftDepartment = 'All';
    this.draftStatus = 'All';
    this.searchTerm = '';
    this.selectedDepartment = 'All';
    this.selectedStatus = 'All';
    this.currentPage = 1;
    this.updateDirectoryView();
  }

  removeFilterChip(key: 'search' | 'department' | 'status'): void {
    if (key === 'search') {
      this.draftSearchTerm = '';
      this.searchTerm = '';
    } else if (key === 'department') {
      this.draftDepartment = 'All';
      this.selectedDepartment = 'All';
    } else if (key === 'status') {
      this.draftStatus = 'All';
      this.selectedStatus = 'All';
    }
    this.currentPage = 1;
    this.updateDirectoryView();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateDirectoryView();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updateDirectoryView();
  }

  getStatusBadgeVariant(status?: string): BadgeVariant {
    switch (status) {
      case 'Active':
        return 'soft-success';
      case 'Remote':
        return 'soft-info';
      case 'On Leave':
        return 'soft-warning';
      default:
        return 'soft-emerald';
    }
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

  private rebuildReportingManagerOptions(): void {
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

    sameDeptManagers.sort((a, b) => a.rank - b.rank);
    crossDeptManagers.sort((a, b) => a.rank - b.rank);

    const combined: { value: string; label: string; group: string }[] = [
      ...sameDeptManagers,
      ...crossDeptManagers,
    ];

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

    this.reportingManagerOptions = combined;
  }

  onDepartmentChange(deptCode: string): void {
    this.newEmployee.department = deptCode;
    this.newEmployee.subDepartment = '';
    this.rebuildSubDepartmentOptions();
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
    this.rebuildReportingManagerOptions();
    if (this.reportingManagerOptions.length > 0) {
      this.newEmployee.manager = this.reportingManagerOptions[0].value;
    }
  }

  loadDirectoryFromBackend(companyCode: string = 'CMP-001'): void {
    this.isLoadingDirectory = true;
    const avatars = [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    ];

    this.companyDirectoryService
      .getEmployeeDirectory$(companyCode)
      .pipe(finalize(() => (this.isLoadingDirectory = false)))
      .subscribe((res) => {
        if (res?.company) {
          this.activeCompanyCode = res.company.companyCode || companyCode;
          this.activeCompanyName = res.company.name || '';
        }
        if (res?.employees) {
          this.employees = res.employees.map((e, idx) => ({
            id: e.employeeCode || e.id,
            name: e.name,
            role: e.level && !e.role.includes(`(${e.level})`) ? `${e.role} (${e.level})` : e.role,
            department: e.department,
            email: e.email,
            phone: e.phone || '+91 98450 12345',
            location: e.location || 'Bangalore, India',
            status: (e.status as EmployeeRecord['status']) || 'Active',
            joiningDate: e.joiningDate || '',
            avatar: e.avatar?.startsWith('http') ? e.avatar : avatars[idx % avatars.length],
            type: (e.type as EmployeeRecord['type']) || 'Full-time',
            manager: e.manager || (e.isMainHr ? 'CEO / Executive Board' : 'Department Head'),
          }));
        }
        this.updateDirectoryView();
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
    const defaultDept = this.departmentsList[0]?.code || 'IT';

    this.newEmployee = {
      name: '',
      email: '',
      phone: '',
      department: defaultDept,
      subDepartment: '',
      levelCode: 'L8',
      jobTitle: '',
      role: 'EMP_EMPLOYEE',
      systemRole: 'EMP_EMPLOYEE',
      type: 'Full-time',
      status: 'Active',
      location: 'Bangalore, India',
      manager: '',
      joiningDate: new Date().toISOString().split('T')[0],
    };
    this.rebuildSubDepartmentOptions();
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
      jobTitle: emp.jobTitle || emp.role || '',
      role: matchedDesig?.code || 'EMP_EMPLOYEE',
      systemRole: matchedDesig?.defaultRoleCode || 'EMP_DEVELOPER',
      type: emp.type || 'Full-time',
      status: emp.status || 'Active',
      location: emp.location || 'Bangalore, India',
      manager: cleanManager,
      joiningDate: formattedJoinDate,
    };

    this.rebuildSubDepartmentOptions();
    this.rebuildReportingManagerOptions();
    if (!this.newEmployee.manager && this.reportingManagerOptions.length > 0) {
      this.newEmployee.manager = this.reportingManagerOptions[0].value;
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
      this.companyDirectoryService
        .updateEmployeeByMainHr$(
          this.editingEmployeeId,
          {
            fullName: this.newEmployee.name,
            email: this.newEmployee.email,
            phone: this.newEmployee.phone,
            departmentCode: targetDeptCode,
            levelCode: this.newEmployee.levelCode,
            jobTitle: this.newEmployee.jobTitle,
            designationCode: this.newEmployee.jobTitle,
            roleCode: this.newEmployee.systemRole,
            employmentType: this.newEmployee.type,
            workStatus: this.newEmployee.status,
            workLocation: this.newEmployee.location,
            managerEmployeeCode: this.newEmployee.manager,
          },
          this.activeCompanyCode
        )
        .subscribe(() => {
          this.closeAddEmployee();
          this.loadDirectoryFromBackend(this.activeCompanyCode);
        });
      return;
    }

    this.companyDirectoryService
      .createEmployeeByMainHr$(
        {
          fullName: this.newEmployee.name,
          email: this.newEmployee.email,
          phone: this.newEmployee.phone,
          departmentCode: targetDeptCode,
          levelCode: this.newEmployee.levelCode,
          jobTitle: this.newEmployee.jobTitle,
          designationCode: this.newEmployee.jobTitle,
          roleCode: this.newEmployee.systemRole || 'EMP_EMPLOYEE',
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

  downloadTemplateCsv(): void {
    const templateContent = [
      SAMPLE_EMPLOYEES_CSV_HEADER,
      '"SUBK-IT-001","Murali Mohan Reddy","murali.mohan.reddy@subk.co.in","IT","L2","Director of Technology & CTO","EMP_ORG_ADMIN","Full-time","Hyderabad HQ, India","+91 98490 20001","Murali@123","HR-001"',
      '"SUBK-IT-002","Tanvi Agarwal","tanvi.agarwal@subk.co.in","IT","L3","Head of IT & Software Engineering","EMP_DEPT_MANAGER","Full-time","Hyderabad HQ, India","+91 98490 20002","Tanvi@123","SUBK-IT-001"',
      '"SUBK-HR-001","Nandita Deshpande","nandita.deshpande@subk.co.in","HR","L3","Head of People & Human Resources","EMP_DEPT_MANAGER","Full-time","Hyderabad HQ, India","+91 98490 30001","Nandita@123","HR-001"',
      '"SUBK-HR-002","Sunita Mukherjee","sunita.mukherjee@subk.co.in","HR","L5","HR Payroll & Compensation Manager","EMP_PAYROLL_ADMIN","Full-time","Hyderabad HQ, India","+91 98490 30002","Sunita@123","SUBK-HR-001"'
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

  loadSample100Employees(): void {
    this.importFileName = 'sample_100_employees.csv (IT & HR Department Hierarchy)';
    this.importErrors = [];
    this.importSuccessMsg = '';
    this.parsedImportEmployees = SAMPLE_105_EMPLOYEES.map((e) => ({
      employeeCode: e.employeeCode,
      fullName: e.fullName,
      email: e.email,
      departmentCode: e.departmentCode,
      levelCode: e.levelCode,
      jobTitle: e.designationCode,
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

    const idxCode = headerCols.findIndex((h) => h === 'employeecode' || h === 'empcode' || h === 'code' || h === 'id' || h === 'employeeid');
    const idxName = headerCols.findIndex((h) => h === 'fullname' || h === 'name');
    const idxEmail = headerCols.findIndex((h) => h === 'email' || h === 'workemail');
    const idxDept = headerCols.findIndex((h) => h === 'departmentcode' || h === 'department' || h === 'dept');
    const idxLevel = headerCols.findIndex((h) => h === 'levelcode' || h === 'level' || h === 'orglevel');
    const idxJobTitle = headerCols.findIndex((h) => h === 'jobtitle' || h === 'title' || h === 'position');
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
        'Expected headers: EmployeeCode, FullName, Email, DepartmentCode, LevelCode, JobTitle, RoleCode, EmploymentType, WorkLocation, Phone, InitialPassword, ManagerEmployeeCode'
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

      const title = idxJobTitle >= 0 && cols[idxJobTitle]
        ? cols[idxJobTitle].trim()
        : (idxDesig >= 0 && cols[idxDesig] ? cols[idxDesig].trim() : 'Software Engineer');

      parsed.push({
        employeeCode: idxCode >= 0 && cols[idxCode] ? cols[idxCode].trim() : undefined,
        fullName: name,
        email: email,
        departmentCode: idxDept >= 0 && cols[idxDept] ? cols[idxDept].trim() : 'IT',
        levelCode: idxLevel >= 0 && cols[idxLevel] ? cols[idxLevel].trim() : undefined,
        jobTitle: title,
        designationCode: title,
        roleCode: idxRole >= 0 && cols[idxRole] ? cols[idxRole].trim() : 'EMP_EMPLOYEE',
        employmentType: idxType >= 0 && cols[idxType] ? (cols[idxType].trim() as any) : 'Full-time',
        workLocation: idxLoc >= 0 && cols[idxLoc] ? cols[idxLoc].trim() : 'Hyderabad HQ, India',
        phone: idxPhone >= 0 && cols[idxPhone] ? cols[idxPhone].trim() : '+91 98450 55667',
        initialPassword: idxPassword >= 0 && cols[idxPassword] ? cols[idxPassword].trim() : 'Welcome@123',
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
