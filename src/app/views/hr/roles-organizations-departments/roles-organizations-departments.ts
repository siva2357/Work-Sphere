import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { RbacService } from '../../../core/services/rbac.service';
import { StatCards, StatMetric } from '../../../library/shared/components/stat-cards/stat-cards';
import { LevelDesignationCard } from '../../../library/shared/components/level-designation-card/level-designation-card';
import {
  Accordian,
  Badge,
  Button,
  Chip,
  InputDropdownOption,
  InputField,
  Pagination,
  Table,
  TableColumn,
  Toaster,
  ToastVariant,
} from '../../../library/UI/components';
import { RolePermissionItemDto } from '../../../core/dtos/auth.dto';
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
  SubDepartmentItem,
  UpdateDepartmentDto,
  UpdateDesignationDto,
} from '../../../core/dtos/rbac.dto';

export interface RosterTableRow extends EmployeeHierarchyItem {
  sno: number;
  reportingManager: string;
}

export interface LevelDesignationTableRow extends DesignationItem {
  sno: number;
  rankOrder: number;
  levelDescription?: string;
}

export interface OrgFilterChip {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-roles-organizations-departments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatCards,
    LevelDesignationCard,
    Accordian,
    Button,
    InputField,
    Badge,
    Chip,
    Table,
    Pagination,
    Toaster,
  ],
  templateUrl: './roles-organizations-departments.html',
  styleUrl: './roles-organizations-departments.css',
})
export class RolesOrganizationsDepartments implements OnInit {
  private rbacService = inject(RbacService);

  @ViewChild('rosterEmpTpl', { static: true }) rosterEmpTpl!: TemplateRef<any>;
  @ViewChild('rosterDeptTpl', { static: true }) rosterDeptTpl!: TemplateRef<any>;
  @ViewChild('rosterLevelTpl', { static: true }) rosterLevelTpl!: TemplateRef<any>;
  @ViewChild('rosterRolesTpl', { static: true }) rosterRolesTpl!: TemplateRef<any>;
  @ViewChild('rosterReportingTpl', { static: true }) rosterReportingTpl!: TemplateRef<any>;
  @ViewChild('rosterActionsTpl', { static: true }) rosterActionsTpl!: TemplateRef<any>;

  @ViewChild('desigLevelCodeTpl', { static: true }) desigLevelCodeTpl!: TemplateRef<any>;
  @ViewChild('desigTrackTpl', { static: true }) desigTrackTpl!: TemplateRef<any>;
  @ViewChild('desigRankTpl', { static: true }) desigRankTpl!: TemplateRef<any>;
  @ViewChild('desigCodeTpl', { static: true }) desigCodeTpl!: TemplateRef<any>;
  @ViewChild('desigRoleTpl', { static: true }) desigRoleTpl!: TemplateRef<any>;
  @ViewChild('desigActionsTpl', { static: true }) desigActionsTpl!: TemplateRef<any>;

  // Active navigation tab
  activeTab: 'departments' | 'levels' | 'roles' | 'roster' = 'departments';

  // Loading states
  isLoading = false;
  isLoadingRoster = false;
  isSavingRole = false;

  // Notification Toast
  toastMessage = '';
  toastTitle = 'Organization Governance';
  toastVariant: ToastVariant = 'emerald';
  private toastTimer: any = null;

  // Tab 1: Departments Filter, Accordion & Pagination
  draftDeptSearch = '';
  draftDeptUnitType = 'ALL';
  departmentSearch = '';
  deptUnitType = 'ALL';
  deptCurrentPage = 1;
  deptPageSize = 8;
  deptEffectivePage = 1;
  deptFilterChips: OrgFilterChip[] = [];
  expandedDeptMap: Record<string, boolean> = {};
  allDeptsExpanded = false;

  // Tab 2: Levels & Designations Filter, Table & Pagination
  levelDesigTableColumns: TableColumn[] = [];
  isLoadingLevels = false;
  draftLevelSearch = '';
  draftLevelTrack: 'ALL' | 'Employee' | 'HR' = 'ALL';
  levelSearch = '';
  levelTrackFilter: 'ALL' | 'Employee' | 'HR' = 'ALL';
  levelCurrentPage = 1;
  levelPageSize = 10;
  levelEffectivePage = 1;
  levelFilterChips: OrgFilterChip[] = [];

  // Tab 3: Roles Filter
  roleTrackFilter: 'ALL' | 'Employee' | 'HR' = 'ALL';
  roleSearch = '';

  // Tab 4: Hierarchy Roster Filter, Table & Pagination
  rosterTableColumns: TableColumn[] = [];
  draftRosterSearch = '';
  draftRosterDept = 'All';
  draftRosterTrack = 'ALL';
  employeeSearch = '';
  rosterDeptFilter = 'All';
  rosterTrackFilter = 'ALL';
  rosterCurrentPage = 1;
  rosterPageSize = 10;
  rosterEffectivePage = 1;
  rosterFilterChips: OrgFilterChip[] = [];

  // Core Data
  departments: DepartmentHierarchyItem[] = [];
  filteredDepartments: DepartmentHierarchyItem[] = [];
  paginatedDepartments: DepartmentHierarchyItem[] = [];
  totalSubDepartmentsCount = 0;

  levels: OrganizationalLevelHierarchyItem[] = [];
  filteredLevels: OrganizationalLevelHierarchyItem[] = [];
  designations: DesignationItem[] = [];
  filteredLevelDesignations: LevelDesignationTableRow[] = [];
  paginatedLevelDesignations: LevelDesignationTableRow[] = [];

  roles: RoleItem[] = [];
  filteredRoles: RoleItem[] = [];
  allPermissions: PermissionModuleGroup[] = [];

  employees: EmployeeHierarchyItem[] = [];
  filteredEmployees: EmployeeHierarchyItem[] = [];
  paginatedRosterEmployees: RosterTableRow[] = [];

  statCards: StatMetric[] = [];

  // Cached Dropdown Options
  readonly deptUnitTypeOptions: InputDropdownOption[] = [
    { label: 'All Departments', value: 'ALL' },
    { label: 'With Subdepartments', value: 'WITH_SUB' },
    { label: 'Top-Level Only', value: 'NO_SUB' },
  ];

  readonly trackDropdownOptions: InputDropdownOption[] = [
    { label: 'All Hierarchy Tracks', value: 'ALL' },
    { label: 'Employee Hierarchy (L1–L10)', value: 'Employee' },
    { label: 'HR Hierarchy (H1–H6)', value: 'HR' },
  ];

  readonly roleTrackModalOptions: InputDropdownOption[] = [
    { label: 'Employee Hierarchy', value: 'Employee' },
    { label: 'HR Hierarchy', value: 'HR' },
  ];

  rosterDeptOptions: InputDropdownOption[] = [{ label: 'All Departments', value: 'All' }];
  parentDeptModalOptions: InputDropdownOption[] = [];
  levelModalOptions: InputDropdownOption[] = [];
  roleCodeModalOptions: InputDropdownOption[] = [{ label: '-- None --', value: '' }];

  // Selected Role & Permission Matrix
  selectedRole: RoleItem | null = null;
  rolePermissionsMap: { [permissionCode: string]: { granted: boolean; scope: string } } = {};
  isRoleDirty = false;
  grantedCountForCurrentRole = 0;
  readonly availableScopes: string[] = [
    'Own',
    'Team',
    'Project',
    'Department',
    'Organization',
    'Delegated',
  ];

  // Modal States - Department
  showAddDeptModal = false;
  showEditDeptModal = false;
  editingDept: DepartmentHierarchyItem | SubDepartmentItem | null = null;
  deptForm: CreateDepartmentDto = {
    name: '',
    code: '',
    description: '',
    parentDepartmentId: null,
  };
  editDeptForm: UpdateDepartmentDto = {
    name: '',
    description: '',
    headEmployeeId: null,
    isActive: true,
  };

  // Modal States - Designation
  showAddDesigModal = false;
  showEditDesigModal = false;
  editingDesig: DesignationItem | null = null;
  desigForm: CreateDesignationDto = {
    title: '',
    code: '',
    organizationalLevelId: '',
    hierarchyTrack: 'Employee',
    typicalReportingTo: '',
    defaultRoleCode: '',
    responsibilities: '',
  };
  editDesigForm: UpdateDesignationDto = {
    title: '',
    typicalReportingTo: '',
    defaultRoleCode: '',
    responsibilities: '',
  };

  // Modal States - Role
  showAddRoleModal = false;
  roleForm: CreateRoleDto = {
    code: '',
    name: '',
    hierarchyTrack: 'Employee',
    description: '',
  };

  ngOnInit(): void {
    this.initLevelDesigTableColumns();
    this.initRosterTableColumns();
    this.rebuildStatCards();
    this.loadAllData();
  }

  private initLevelDesigTableColumns(): void {
    this.levelDesigTableColumns = [
      {
        field: 'sno',
        headerName: 'S.No',
        width: 70,
      },
      {
        field: 'levelCode',
        headerName: 'Level Code',
        cellTemplate: this.desigLevelCodeTpl,
        width: 115,
      },
      {
        field: 'levelName',
        headerName: 'Level Name',
        width: 225,
      },
      {
        field: 'hierarchyTrack',
        headerName: 'Hierarchy Track',
        cellTemplate: this.desigTrackTpl,
        width: 155,
      },
      {
        field: 'rankOrder',
        headerName: 'Rank',
        cellTemplate: this.desigRankTpl,
        width: 105,
      },
      {
        field: 'title',
        headerName: 'Designation Title',
        width: 215,
      },
      {
        field: 'code',
        headerName: 'Designation Code',
        cellTemplate: this.desigCodeTpl,
        width: 185,
      },
      {
        field: 'typicalReportingTo',
        headerName: 'Typical Reporting To',
        width: 215,
      },
      {
        field: 'defaultRoleCode',
        headerName: 'Default System Role',
        cellTemplate: this.desigRoleTpl,
        width: 185,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        cellTemplate: this.desigActionsTpl,
        width: 90,
      },
    ];
  }

  private initRosterTableColumns(): void {
    this.rosterTableColumns = [
      {
        field: 'sno',
        headerName: 'S.No',
        width: 70,
      },
      {
        field: 'employeeCode',
        headerName: 'Employee ID',
        width: 120,
      },
      {
        field: 'fullName',
        headerName: 'Employee',
        cellTemplate: this.rosterEmpTpl,
        width: 210,
      },
      {
        field: 'email',
        headerName: 'Email',
        width: 235,
      },
      {
        field: 'departmentName',
        headerName: 'Department',
        cellTemplate: this.rosterDeptTpl,
        width: 230,
      },
      {
        field: 'levelCode',
        headerName: 'Organizational Level',
        cellTemplate: this.rosterLevelTpl,
        width: 175,
      },
      {
        field: 'designationTitle',
        headerName: 'Designation',
        width: 205,
      },
      {
        field: 'roles',
        headerName: 'Assigned Roles',
        cellTemplate: this.rosterRolesTpl,
        width: 250,
      },
      {
        field: 'reportingManager',
        headerName: 'Reporting Line',
        cellTemplate: this.rosterReportingTpl,
        width: 200,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        cellTemplate: this.rosterActionsTpl,
        width: 90,
      },
    ];
  }

  loadAllData(): void {
    this.isLoading = true;
    this.loadDepartments();
    this.loadLevelsAndDesignations();
    this.loadPermissionsCatalog();
    this.loadRoles();
    this.loadEmployees();
  }

  private rebuildStatCards(): void {
    this.statCards = [
      {
        title: 'Departments',
        value: this.departments.length,
        subtitle: `${this.totalSubDepartmentsCount} Sub-departments`,
        badgeText: 'Hierarchy',
        badgeType: 'emerald',
        icon: 'bi-buildings-fill',
      },
      {
        title: 'Levels & Titles',
        value: `${this.levels.length} Levels`,
        subtitle: `${this.designations.length} Designations Mapped`,
        badgeText: 'L1–L10 & H1–H6',
        badgeType: 'info',
        icon: 'bi-layers-fill',
      },
      {
        title: 'RBAC Roles',
        value: `${this.roles.length} Roles`,
        subtitle: `${this.allPermissions.length} Permission Modules`,
        badgeText: 'Matrix Active',
        badgeType: 'warning',
        icon: 'bi-shield-lock-fill',
      },
      {
        title: 'Hierarchy Roster',
        value: this.employees.length,
        subtitle: 'Staff Assigned Roles',
        badgeText: 'Synced DB',
        badgeType: 'success',
        icon: 'bi-people-fill',
      },
    ];
  }

  onStatCardSelected(card: StatMetric): void {
    if (card.title === 'Departments') this.activeTab = 'departments';
    else if (card.title === 'Levels & Titles') this.activeTab = 'levels';
    else if (card.title === 'RBAC Roles') this.activeTab = 'roles';
    else if (card.title === 'Hierarchy Roster') this.activeTab = 'roster';
  }

  // ====================================================================
  // TOAST NOTIFICATIONS
  // ====================================================================

  showToast(message: string, type: 'success' | 'danger' | 'info' = 'success'): void {
    this.toastMessage = message;
    this.toastVariant = type === 'success' ? 'emerald' : type === 'danger' ? 'danger' : 'info';
    this.toastTitle =
      type === 'success' ? 'Saved Successfully' : type === 'danger' ? 'Action Failed' : 'Notice';
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
    }, 4500);
  }

  dismissToast(): void {
    this.toastMessage = '';
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  // ====================================================================
  // 1. DEPARTMENTS & SUB-DEPARTMENTS
  // ====================================================================

  loadDepartments(): void {
    this.rbacService.getDepartments$().subscribe({
      next: (depts) => {
        this.departments = depts || [];
        this.totalSubDepartmentsCount = this.departments.reduce(
          (sum, d) => sum + (d.subDepartments?.length || 0),
          0
        );
        this.parentDeptModalOptions = [
          { label: '-- None (Top-Level Department) --', value: '' },
          ...this.departments.map((d) => ({
            label: `${d.name} (${d.code})`,
            value: d.id,
          })),
        ];
        this.rosterDeptOptions = [
          { label: 'All Departments', value: 'All' },
          ...this.departments.map((d) => ({
            label: `${d.name} (${d.code})`,
            value: d.name,
          })),
        ];
        this.isLoading = false;
        this.updateDepartmentsView();
        this.rebuildStatCards();
      },
      error: () => {
        this.showToast('Failed to load company departments.', 'danger');
        this.isLoading = false;
      },
    });
  }

  private updateDepartmentsView(): void {
    const q = this.departmentSearch.toLowerCase().trim();
    this.filteredDepartments = this.departments.filter((d) => {
      const matchesQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q)) ||
        d.subDepartments?.some(
          (sub) => sub.name.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q)
        );
      const subCount = d.subDepartments?.length || 0;
      const matchesUnit =
        this.deptUnitType === 'ALL' ||
        (this.deptUnitType === 'WITH_SUB' && subCount > 0) ||
        (this.deptUnitType === 'NO_SUB' && subCount === 0);
      return matchesQuery && matchesUnit;
    });

    const totalPages = Math.max(1, Math.ceil(this.filteredDepartments.length / this.deptPageSize));
    this.deptEffectivePage = Math.min(Math.max(1, this.deptCurrentPage), totalPages);
    const start = (this.deptEffectivePage - 1) * this.deptPageSize;
    this.paginatedDepartments = this.filteredDepartments.slice(start, start + this.deptPageSize);

    const chips: OrgFilterChip[] = [];
    if (this.departmentSearch.trim()) {
      chips.push({
        key: 'search',
        label: `Search: "${this.departmentSearch.trim()}"`,
        icon: 'bi-search',
      });
    }
    if (this.deptUnitType !== 'ALL') {
      const unitLabel =
        this.deptUnitType === 'WITH_SUB' ? 'With Subdepartments' : 'Top-Level Only';
      chips.push({
        key: 'unitType',
        label: `Structure: ${unitLabel}`,
        icon: 'bi-diagram-2',
      });
    }
    this.deptFilterChips = chips;
  }

  applyDeptFilters(): void {
    this.departmentSearch = this.draftDeptSearch.trim();
    this.deptUnitType = this.draftDeptUnitType || 'ALL';
    this.deptCurrentPage = 1;
    this.updateDepartmentsView();
  }

  resetDeptFilters(): void {
    this.draftDeptSearch = '';
    this.draftDeptUnitType = 'ALL';
    this.departmentSearch = '';
    this.deptUnitType = 'ALL';
    this.deptCurrentPage = 1;
    this.updateDepartmentsView();
  }

  removeDeptFilterChip(key: string): void {
    if (key === 'search') {
      this.draftDeptSearch = '';
      this.departmentSearch = '';
    } else if (key === 'unitType') {
      this.draftDeptUnitType = 'ALL';
      this.deptUnitType = 'ALL';
    }
    this.deptCurrentPage = 1;
    this.updateDepartmentsView();
  }

  onDeptPageChange(page: number): void {
    this.deptCurrentPage = page;
    this.updateDepartmentsView();
  }

  onDeptPageSizeChange(size: number): void {
    this.deptPageSize = size;
    this.deptCurrentPage = 1;
    this.updateDepartmentsView();
  }

  isDeptExpanded(deptId: string, index: number): boolean {
    if (deptId in this.expandedDeptMap) {
      return this.expandedDeptMap[deptId];
    }
    return index === 0;
  }

  onDeptAccordionToggle(deptId: string, isOpen: boolean): void {
    this.expandedDeptMap[deptId] = isOpen;
  }

  toggleExpandAllDepts(): void {
    this.allDeptsExpanded = !this.allDeptsExpanded;
    for (const d of this.filteredDepartments) {
      this.expandedDeptMap[d.id] = this.allDeptsExpanded;
    }
  }

  openAddDepartmentModal(parentDeptId?: string): void {
    this.deptForm = {
      name: '',
      code: '',
      description: '',
      parentDepartmentId: parentDeptId || null,
    };
    this.showAddDeptModal = true;
  }

  closeAddDepartmentModal(): void {
    this.showAddDeptModal = false;
  }

  submitCreateDepartment(): void {
    if (!this.deptForm.name.trim() || !this.deptForm.code.trim()) {
      this.showToast('Please provide both Department Name and Code.', 'danger');
      return;
    }

    const payload: CreateDepartmentDto = {
      ...this.deptForm,
      parentDepartmentId: this.deptForm.parentDepartmentId || null,
    };

    this.rbacService.createDepartment$(payload).subscribe({
      next: () => {
        this.showToast(`Department '${this.deptForm.name}' created successfully!`, 'success');
        this.closeAddDepartmentModal();
        this.loadDepartments();
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to create department.';
        this.showToast(msg, 'danger');
      },
    });
  }

  openEditDepartmentModal(dept: DepartmentHierarchyItem | SubDepartmentItem): void {
    this.editingDept = dept;
    this.editDeptForm = {
      name: dept.name,
      description: dept.description || '',
      headEmployeeId: dept.headEmployeeId || null,
      isActive: dept.isActive,
    };
    this.showEditDeptModal = true;
  }

  closeEditDepartmentModal(): void {
    this.showEditDeptModal = false;
    this.editingDept = null;
  }

  submitUpdateDepartment(): void {
    if (!this.editingDept || !this.editDeptForm.name.trim()) {
      this.showToast('Department name is required.', 'danger');
      return;
    }

    this.rbacService.updateDepartment$(this.editingDept.id, this.editDeptForm).subscribe({
      next: () => {
        this.showToast(`Department '${this.editDeptForm.name}' updated successfully!`, 'success');
        this.closeEditDepartmentModal();
        this.loadDepartments();
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to update department.';
        this.showToast(msg, 'danger');
      },
    });
  }

  deleteDepartment(dept: DepartmentHierarchyItem | SubDepartmentItem): void {
    if (confirm(`Are you sure you want to delete or deactivate '${dept.name}' (${dept.code})?`)) {
      this.rbacService.deleteDepartment$(dept.id).subscribe({
        next: (res) => {
          this.showToast(res.message || 'Department updated.', 'success');
          this.loadDepartments();
        },
        error: (err) => {
          this.showToast(err.error?.message || 'Failed to delete department.', 'danger');
        },
      });
    }
  }

  // ====================================================================
  // 2. LEVELS & DESIGNATIONS
  // ====================================================================

  loadLevelsAndDesignations(): void {
    this.isLoadingLevels = true;
    this.rbacService
      .getLevelsAndDesignations$()
      .pipe(finalize(() => (this.isLoadingLevels = false)))
      .subscribe({
        next: (levels) => {
          this.levels = levels || [];
          this.levelModalOptions = this.levels.map((l) => ({
            label: `${l.code} - ${l.name} (${l.hierarchyTrack})`,
            value: l.id,
          }));
          this.extractAllDesignations();
          this.updateLevelsView();
          this.rebuildStatCards();
        },
        error: () => {
          this.showToast('Failed to load organizational levels.', 'danger');
        },
      });
  }

  extractAllDesignations(): void {
    const list: DesignationItem[] = [];
    for (const lvl of this.levels) {
      if (lvl.designations && lvl.designations.length > 0) {
        for (const d of lvl.designations) {
          list.push({
            ...d,
            organizationalLevelId: lvl.id,
            levelCode: lvl.code,
            levelName: lvl.name,
            hierarchyTrack: d.hierarchyTrack || lvl.hierarchyTrack,
          });
        }
      }
    }
    this.designations = list;
  }

  private updateLevelsView(): void {
    const q = this.levelSearch.toLowerCase().trim();
    this.filteredLevels = this.levels.filter((l) => {
      const matchesTrack =
        this.levelTrackFilter === 'ALL' ||
        l.hierarchyTrack.toLowerCase() === this.levelTrackFilter.toLowerCase();
      const matchesSearch =
        !q ||
        l.code.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        (l.description && l.description.toLowerCase().includes(q)) ||
        l.designations?.some(
          (d) => d.title.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)
        );
      return matchesTrack && matchesSearch;
    });

    // Flatten designations across filtered levels for <app-table>
    const rows: LevelDesignationTableRow[] = [];
    for (const lvl of this.levels) {
      const matchesTrack =
        this.levelTrackFilter === 'ALL' ||
        lvl.hierarchyTrack.toLowerCase() === this.levelTrackFilter.toLowerCase();
      if (!matchesTrack) continue;

      if (lvl.designations && lvl.designations.length > 0) {
        for (const d of lvl.designations) {
          const matchesSearch =
            !q ||
            lvl.code.toLowerCase().includes(q) ||
            lvl.name.toLowerCase().includes(q) ||
            d.title.toLowerCase().includes(q) ||
            d.code.toLowerCase().includes(q) ||
            (d.typicalReportingTo && d.typicalReportingTo.toLowerCase().includes(q)) ||
            (d.defaultRoleCode && d.defaultRoleCode.toLowerCase().includes(q));

          if (matchesSearch) {
            rows.push({
              ...d,
              sno: rows.length + 1,
              organizationalLevelId: lvl.id,
              levelCode: lvl.code,
              levelName: lvl.name,
              hierarchyTrack: d.hierarchyTrack || lvl.hierarchyTrack,
              rankOrder: lvl.rankOrder,
              levelDescription: lvl.description,
              typicalReportingTo: d.typicalReportingTo || '—',
            });
          }
        }
      }
    }

    this.filteredLevelDesignations = rows;
    const totalPages = Math.max(
      1,
      Math.ceil(this.filteredLevelDesignations.length / this.levelPageSize)
    );
    this.levelEffectivePage = Math.min(Math.max(1, this.levelCurrentPage), totalPages);
    const start = (this.levelEffectivePage - 1) * this.levelPageSize;
    this.paginatedLevelDesignations = this.filteredLevelDesignations
      .slice(start, start + this.levelPageSize)
      .map((item, idx) => ({
        ...item,
        sno: start + idx + 1,
      }));

    const chips: OrgFilterChip[] = [];
    if (this.levelSearch.trim()) {
      chips.push({
        key: 'search',
        label: `Search: "${this.levelSearch.trim()}"`,
        icon: 'bi-search',
      });
    }
    if (this.levelTrackFilter !== 'ALL') {
      chips.push({
        key: 'track',
        label: `Track: ${this.levelTrackFilter} Hierarchy`,
        icon: 'bi-layers-half',
      });
    }
    this.levelFilterChips = chips;
  }

  applyLevelFilters(): void {
    this.levelSearch = this.draftLevelSearch.trim();
    this.levelTrackFilter = this.draftLevelTrack || 'ALL';
    this.levelCurrentPage = 1;
    this.updateLevelsView();
  }

  resetLevelFilters(): void {
    this.draftLevelSearch = '';
    this.draftLevelTrack = 'ALL';
    this.levelSearch = '';
    this.levelTrackFilter = 'ALL';
    this.levelCurrentPage = 1;
    this.updateLevelsView();
  }

  removeLevelFilterChip(key: string): void {
    if (key === 'search') {
      this.draftLevelSearch = '';
      this.levelSearch = '';
    } else if (key === 'track') {
      this.draftLevelTrack = 'ALL';
      this.levelTrackFilter = 'ALL';
    }
    this.levelCurrentPage = 1;
    this.updateLevelsView();
  }

  onLevelPageChange(page: number): void {
    this.levelCurrentPage = page;
    this.updateLevelsView();
  }

  onLevelPageSizeChange(size: number): void {
    this.levelPageSize = size;
    this.levelCurrentPage = 1;
    this.updateLevelsView();
  }

  openAddDesignationModal(levelId?: string, hierarchyTrack?: string): void {
    const defaultLvl = levelId || (this.levels.length > 0 ? this.levels[0].id : '');
    const matched = this.levels.find((l) => l.id === defaultLvl);

    this.desigForm = {
      title: '',
      code: '',
      organizationalLevelId: defaultLvl,
      hierarchyTrack: hierarchyTrack || matched?.hierarchyTrack || 'Employee',
      typicalReportingTo: '',
      defaultRoleCode: '',
      responsibilities: '',
    };
    this.showAddDesigModal = true;
  }

  closeAddDesignationModal(): void {
    this.showAddDesigModal = false;
  }

  onDesigLevelChange(): void {
    const lvl = this.levels.find((l) => l.id === this.desigForm.organizationalLevelId);
    if (lvl) {
      this.desigForm.hierarchyTrack = lvl.hierarchyTrack;
    }
  }

  submitCreateDesignation(): void {
    if (
      !this.desigForm.title.trim() ||
      !this.desigForm.code.trim() ||
      !this.desigForm.organizationalLevelId
    ) {
      this.showToast('Please provide Title, Code, and select an Organizational Level.', 'danger');
      return;
    }

    this.rbacService.createDesignation$(this.desigForm).subscribe({
      next: () => {
        this.showToast(`Designation '${this.desigForm.title}' created successfully!`, 'success');
        this.closeAddDesignationModal();
        this.loadLevelsAndDesignations();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to create designation.', 'danger');
      },
    });
  }

  openEditDesignationModal(desig: DesignationItem): void {
    this.editingDesig = desig;
    this.editDesigForm = {
      title: desig.title,
      typicalReportingTo: desig.typicalReportingTo || '',
      defaultRoleCode: desig.defaultRoleCode || '',
      responsibilities: desig.responsibilities || '',
    };
    this.showEditDesigModal = true;
  }

  closeEditDesignationModal(): void {
    this.showEditDesigModal = false;
    this.editingDesig = null;
  }

  submitUpdateDesignation(): void {
    if (!this.editingDesig || !this.editDesigForm.title.trim()) {
      this.showToast('Designation title is required.', 'danger');
      return;
    }

    this.rbacService.updateDesignation$(this.editingDesig.id, this.editDesigForm).subscribe({
      next: () => {
        this.showToast(
          `Designation '${this.editDesigForm.title}' updated successfully!`,
          'success'
        );
        this.closeEditDesignationModal();
        this.loadLevelsAndDesignations();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to update designation.', 'danger');
      },
    });
  }

  deleteDesignation(desig: DesignationItem): void {
    if (confirm(`Are you sure you want to delete designation '${desig.title}' (${desig.code})?`)) {
      this.rbacService.deleteDesignation$(desig.id).subscribe({
        next: (res) => {
          this.showToast(res.message || 'Designation deleted.', 'success');
          this.loadLevelsAndDesignations();
        },
        error: (err) => {
          this.showToast(err.error?.message || 'Failed to delete designation.', 'danger');
        },
      });
    }
  }

  // ====================================================================
  // 3. ROLES & RBAC PERMISSIONS MATRIX
  // ====================================================================

  loadPermissionsCatalog(): void {
    this.rbacService.getAllPermissions$().subscribe({
      next: (groups) => {
        this.allPermissions = groups || [];
        this.rebuildStatCards();
        if (this.selectedRole) {
          this.loadRolePermissions(this.selectedRole.code);
        }
      },
      error: () => {
        this.showToast('Failed to load permissions catalog.', 'danger');
      },
    });
  }

  loadRoles(): void {
    this.rbacService.getRoles$().subscribe({
      next: (roles) => {
        this.roles = roles || [];
        this.roleCodeModalOptions = [
          { label: '-- None --', value: '' },
          ...this.roles.map((r) => ({
            label: `${r.name} (${r.code})`,
            value: r.code,
          })),
        ];
        this.updateRolesView();
        this.rebuildStatCards();
        if (!this.selectedRole && this.roles.length > 0) {
          this.selectRole(this.roles[0]);
        }
      },
      error: () => {
        this.showToast('Failed to load system roles.', 'danger');
      },
    });
  }

  updateRolesView(): void {
    let result = this.roles;
    if (this.roleTrackFilter !== 'ALL') {
      result = result.filter(
        (r) => r.hierarchyTrack.toLowerCase() === this.roleTrackFilter.toLowerCase()
      );
    }
    if (this.roleSearch.trim()) {
      const q = this.roleSearch.toLowerCase().trim();
      result = result.filter(
        (r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)
      );
    }
    this.filteredRoles = result;
  }

  setRoleTrackFilter(track: 'ALL' | 'Employee' | 'HR'): void {
    this.roleTrackFilter = track;
    this.updateRolesView();
  }

  selectRole(role: RoleItem): void {
    if (this.isRoleDirty && this.selectedRole) {
      if (
        !confirm(
          `You have unsaved permission changes for role '${this.selectedRole.name}'. Discard changes and switch?`
        )
      ) {
        return;
      }
    }

    this.selectedRole = role;
    this.isRoleDirty = false;
    this.loadRolePermissions(role.code);
  }

  loadRolePermissions(roleCode: string): void {
    this.rbacService.getRolePermissions$(roleCode).subscribe({
      next: (res) => {
        const map: { [permissionCode: string]: { granted: boolean; scope: string } } = {};

        for (const group of this.allPermissions) {
          for (const perm of group.permissions) {
            map[perm.code] = { granted: false, scope: 'Own' };
          }
        }

        if (res.modules && res.modules.length > 0) {
          for (const mod of res.modules) {
            for (const p of mod.permissions) {
              map[p.code] = {
                granted: true,
                scope: p.scope || 'Own',
              };
            }
          }
        }

        this.rolePermissionsMap = map;
        this.recalculateGrantedCount();
        this.isRoleDirty = false;
      },
      error: () => {
        this.showToast(`Failed to load permissions for role '${roleCode}'.`, 'danger');
      },
    });
  }

  private recalculateGrantedCount(): void {
    this.grantedCountForCurrentRole = Object.values(this.rolePermissionsMap).filter(
      (p) => p.granted
    ).length;
  }

  togglePermission(permCode: string): void {
    if (!this.rolePermissionsMap[permCode]) {
      this.rolePermissionsMap[permCode] = { granted: true, scope: 'Own' };
    } else {
      this.rolePermissionsMap[permCode].granted = !this.rolePermissionsMap[permCode].granted;
    }
    this.recalculateGrantedCount();
    this.isRoleDirty = true;
  }

  changeScope(permCode: string, scope: string): void {
    if (this.rolePermissionsMap[permCode]) {
      this.rolePermissionsMap[permCode].scope = scope;
      this.isRoleDirty = true;
    }
  }

  grantAllInModule(moduleName: string): void {
    const mod = this.allPermissions.find((m) => m.module === moduleName);
    if (!mod) return;
    for (const p of mod.permissions) {
      if (!this.rolePermissionsMap[p.code]) {
        this.rolePermissionsMap[p.code] = { granted: true, scope: 'Department' };
      } else {
        this.rolePermissionsMap[p.code].granted = true;
      }
    }
    this.recalculateGrantedCount();
    this.isRoleDirty = true;
  }

  clearAllInModule(moduleName: string): void {
    const mod = this.allPermissions.find((m) => m.module === moduleName);
    if (!mod) return;
    for (const p of mod.permissions) {
      if (this.rolePermissionsMap[p.code]) {
        this.rolePermissionsMap[p.code].granted = false;
      }
    }
    this.recalculateGrantedCount();
    this.isRoleDirty = true;
  }

  grantAllPermissions(): void {
    for (const group of this.allPermissions) {
      for (const p of group.permissions) {
        if (!this.rolePermissionsMap[p.code]) {
          this.rolePermissionsMap[p.code] = { granted: true, scope: 'Organization' };
        } else {
          this.rolePermissionsMap[p.code].granted = true;
        }
      }
    }
    this.recalculateGrantedCount();
    this.isRoleDirty = true;
  }

  clearAllPermissions(): void {
    for (const group of this.allPermissions) {
      for (const p of group.permissions) {
        if (this.rolePermissionsMap[p.code]) {
          this.rolePermissionsMap[p.code].granted = false;
        }
      }
    }
    this.recalculateGrantedCount();
    this.isRoleDirty = true;
  }

  saveRolePermissions(): void {
    if (!this.selectedRole) return;

    this.isSavingRole = true;
    const permissions: RolePermissionItemDto[] = Object.entries(this.rolePermissionsMap)
      .filter(([_, val]) => val.granted)
      .map(([code, val]) => ({
        permissionCode: code,
        scope: val.scope || 'Own',
      }));

    this.rbacService.updateRolePermissions$(this.selectedRole.code, permissions).subscribe({
      next: (res) => {
        this.isSavingRole = false;
        this.isRoleDirty = false;
        if (this.selectedRole) {
          this.selectedRole.permissionCount = permissions.length;
        }
        this.showToast(
          res.message || `Permissions saved successfully for '${this.selectedRole?.name}'!`,
          'success'
        );
      },
      error: (err) => {
        this.isSavingRole = false;
        this.showToast(err.error?.message || 'Failed to update role permissions.', 'danger');
      },
    });
  }

  openAddRoleModal(): void {
    this.roleForm = {
      code: '',
      name: '',
      hierarchyTrack: 'Employee',
      description: '',
    };
    this.showAddRoleModal = true;
  }

  closeAddRoleModal(): void {
    this.showAddRoleModal = false;
  }

  submitCreateRole(): void {
    if (!this.roleForm.name.trim() || !this.roleForm.code.trim()) {
      this.showToast('Please provide both Role Name and Code.', 'danger');
      return;
    }

    this.rbacService.createRole$(this.roleForm).subscribe({
      next: (role) => {
        this.showToast(`Custom Role '${role.name}' created successfully!`, 'success');
        this.closeAddRoleModal();
        this.loadRoles();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to create role.', 'danger');
      },
    });
  }

  // ====================================================================
  // 4. EMPLOYEE HIERARCHY & ROSTER (TABLE + CARDS + PAGINATION)
  // ====================================================================

  loadEmployees(): void {
    this.isLoadingRoster = true;
    this.rbacService
      .getEmployeesHierarchy$()
      .pipe(finalize(() => (this.isLoadingRoster = false)))
      .subscribe({
        next: (emps) => {
          this.employees = emps || [];
          this.updateRosterView();
          this.rebuildStatCards();
        },
        error: () => {},
      });
  }

  private updateRosterView(): void {
    const q = this.employeeSearch.toLowerCase().trim();
    this.filteredEmployees = this.employees.filter((e) => {
      const matchesSearch =
        !q ||
        e.fullName.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.departmentName && e.departmentName.toLowerCase().includes(q)) ||
        (e.designationTitle && e.designationTitle.toLowerCase().includes(q)) ||
        e.roles?.some((r) => r.toLowerCase().includes(q));
      const matchesDept =
        this.rosterDeptFilter === 'All' ||
        (e.departmentName || '').toLowerCase().includes(this.rosterDeptFilter.toLowerCase());
      const matchesTrack =
        this.rosterTrackFilter === 'ALL' ||
        (e.hierarchyTrack || '').toLowerCase() === this.rosterTrackFilter.toLowerCase();
      return matchesSearch && matchesDept && matchesTrack;
    });

    const totalPages = Math.max(1, Math.ceil(this.filteredEmployees.length / this.rosterPageSize));
    this.rosterEffectivePage = Math.min(Math.max(1, this.rosterCurrentPage), totalPages);
    const start = (this.rosterEffectivePage - 1) * this.rosterPageSize;

    this.paginatedRosterEmployees = this.filteredEmployees
      .slice(start, start + this.rosterPageSize)
      .map((emp, idx) => ({
        ...emp,
        sno: start + idx + 1,
        reportingManager:
          emp.reportingTo && emp.reportingTo.length > 0
            ? emp.reportingTo[0].managerName || '—'
            : '—',
      }));

    const chips: OrgFilterChip[] = [];
    if (this.employeeSearch.trim()) {
      chips.push({
        key: 'search',
        label: `Search: "${this.employeeSearch.trim()}"`,
        icon: 'bi-search',
      });
    }
    if (this.rosterDeptFilter !== 'All') {
      chips.push({
        key: 'department',
        label: `Department: ${this.rosterDeptFilter}`,
        icon: 'bi-diagram-3',
      });
    }
    if (this.rosterTrackFilter !== 'ALL') {
      chips.push({
        key: 'track',
        label: `Track: ${this.rosterTrackFilter}`,
        icon: 'bi-layers-half',
      });
    }
    this.rosterFilterChips = chips;
  }

  applyRosterFilters(): void {
    this.employeeSearch = this.draftRosterSearch.trim();
    this.rosterDeptFilter = this.draftRosterDept || 'All';
    this.rosterTrackFilter = this.draftRosterTrack || 'ALL';
    this.rosterCurrentPage = 1;
    this.updateRosterView();
  }

  resetRosterFilters(): void {
    this.draftRosterSearch = '';
    this.draftRosterDept = 'All';
    this.draftRosterTrack = 'ALL';
    this.employeeSearch = '';
    this.rosterDeptFilter = 'All';
    this.rosterTrackFilter = 'ALL';
    this.rosterCurrentPage = 1;
    this.updateRosterView();
  }

  removeRosterFilterChip(key: string): void {
    if (key === 'search') {
      this.draftRosterSearch = '';
      this.employeeSearch = '';
    } else if (key === 'department') {
      this.draftRosterDept = 'All';
      this.rosterDeptFilter = 'All';
    } else if (key === 'track') {
      this.draftRosterTrack = 'ALL';
      this.rosterTrackFilter = 'ALL';
    }
    this.rosterCurrentPage = 1;
    this.updateRosterView();
  }

  onRosterPageChange(page: number): void {
    this.rosterCurrentPage = page;
    this.updateRosterView();
  }

  onRosterPageSizeChange(size: number): void {
    this.rosterPageSize = size;
    this.rosterCurrentPage = 1;
    this.updateRosterView();
  }

  inspectEmployeePrimaryRole(emp: EmployeeHierarchyItem): void {
    const primaryRoleCode = emp.roles && emp.roles.length > 0 ? emp.roles[0] : '';
    const matchedRole = this.roles.find(
      (r) => r.code.toLowerCase() === primaryRoleCode.toLowerCase()
    );
    this.activeTab = 'roles';
    if (matchedRole) {
      this.selectRole(matchedRole);
      this.showToast(`Opened RBAC Matrix for role '${matchedRole.name}' (${emp.fullName}).`, 'info');
    }
  }

  inspectEmployeeLevel(emp: EmployeeHierarchyItem): void {
    this.activeTab = 'levels';
    this.draftLevelSearch = emp.levelCode || emp.designationTitle || '';
    this.draftLevelTrack = (emp.hierarchyTrack as 'Employee' | 'HR') || 'ALL';
    this.applyLevelFilters();
  }

  inspectEmployeeDepartment(emp: EmployeeHierarchyItem): void {
    this.activeTab = 'departments';
    this.draftDeptSearch = emp.departmentName || emp.departmentCode || '';
    this.draftDeptUnitType = 'ALL';
    this.applyDeptFilters();
  }
}
