import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { RbacService } from '../../../core/services/rbac.service';
import { StatCards, StatMetric } from '../../../library/shared/components/stat-cards/stat-cards';
import {
  Badge,
  Button,
  InputDropdownOption,
  InputField,
  Modal,
  Pagination,
  Table,
  TableColumn,
  Toaster,
  ToastVariant,
} from '../../../library/UI/components';
import { RolePermissionItemDto } from '../../../core/dtos/auth.dto';
import {
  CreateDepartmentDto,
  DepartmentHierarchyItem,
  OrganizationalLevelHierarchyItem,
  PermissionModuleGroup,
  RoleItem,
  UpdateDepartmentDto,
} from '../../../core/dtos/rbac.dto';

export interface LevelTableRow {
  id: string;
  sno: number;
  code: string;
  name: string;
  description: string;
  rankOrder: number;
}

export interface ModuleMatrixTableRow {
  module: string;
  actionCount: number;
  allChecked: boolean;
  viewChecked: boolean;
  createChecked: boolean;
  editChecked: boolean;
  deleteChecked: boolean;
  approveChecked: boolean;
  assignChecked: boolean;
  exportChecked: boolean;
  manageChecked: boolean;
}

@Component({
  selector: 'app-roles-organizations-departments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatCards,
    Button,
    InputField,
    Badge,
    Table,
    Pagination,
    Modal,
    Toaster,
  ],
  templateUrl: './roles-organizations-departments.html',
  styleUrl: './roles-organizations-departments.css',
})
export class RolesOrganizationsDepartments implements OnInit {
  private rbacService = inject(RbacService);

  @ViewChild('levelCodeTpl', { static: true }) levelCodeTpl!: TemplateRef<any>;
  @ViewChild('levelActionsTpl', { static: true }) levelActionsTpl!: TemplateRef<any>;

  // Reusable <app-table> Cell Templates for Matrix Table
  @ViewChild('modNameTpl', { static: true }) modNameTpl!: TemplateRef<any>;
  @ViewChild('modSelectAllTpl', { static: true }) modSelectAllTpl!: TemplateRef<any>;
  @ViewChild('modViewTpl', { static: true }) modViewTpl!: TemplateRef<any>;
  @ViewChild('modCreateTpl', { static: true }) modCreateTpl!: TemplateRef<any>;
  @ViewChild('modEditTpl', { static: true }) modEditTpl!: TemplateRef<any>;
  @ViewChild('modDeleteTpl', { static: true }) modDeleteTpl!: TemplateRef<any>;
  @ViewChild('modApproveTpl', { static: true }) modApproveTpl!: TemplateRef<any>;
  @ViewChild('modAssignTpl', { static: true }) modAssignTpl!: TemplateRef<any>;
  @ViewChild('modExportTpl', { static: true }) modExportTpl!: TemplateRef<any>;
  @ViewChild('modManageTpl', { static: true }) modManageTpl!: TemplateRef<any>;

  // Active navigation tab (Departments, Levels, Roles) - Roster removed
  activeTab: 'departments' | 'levels' | 'roles' = 'departments';

  // Loading states
  isLoading = false;
  isLoadingLevels = false;
  isSavingRole = false;

  // Notification Toast
  toastMessage = '';
  toastTitle = 'Organization Governance';
  toastVariant: ToastVariant = 'emerald';
  private toastTimer: any = null;

  // Tab 1: Departments (Stat Cards view with Employee Count)
  departmentSearch = '';
  departments: DepartmentHierarchyItem[] = [];
  filteredDepartments: DepartmentHierarchyItem[] = [];
  departmentHeadOptions: InputDropdownOption[] = [];

  // Tab 2: Levels Minimal Table (Level Number, Description, Edit Option)
  levelsTableColumns: TableColumn[] = [];
  levelSearch = '';
  levelCurrentPage = 1;
  levelPageSize = 10;
  levelEffectivePage = 1;
  levels: OrganizationalLevelHierarchyItem[] = [];
  filteredLevelsTable: LevelTableRow[] = [];
  paginatedLevels: LevelTableRow[] = [];

  // Tab 3: Roles & RBAC Matrix with Level Number & Checkboxes
  roleSearch = '';
  selectedLevelTab = 'L2';
  readonly allLevelCodes: string[] = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'];
  readonly standardActions: string[] = ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Assign', 'Export', 'Manage'];
  moduleSearch = '';

  matrixTableColumns: TableColumn[] = [];
  matrixTableData: ModuleMatrixTableRow[] = [];

  roles: RoleItem[] = [];
  filteredRoles: RoleItem[] = [];
  selectedRole: RoleItem | null = null;
  allPermissions: PermissionModuleGroup[] = [];

  // Role Permissions Matrix State
  rolePermissionsMap: Record<string, { granted: boolean; scope: string }> = {};
  originalRolePermissionsMap: Record<string, { granted: boolean; scope: string }> = {};
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

  // Top Stat Summary Cards (Informational only, no tab switching)
  topStatCards: StatMetric[] = [];

  // Modal States - Department
  showAddDeptModal = false;
  showEditDeptModal = false;
  editingDept: DepartmentHierarchyItem | null = null;
  deptForm: CreateDepartmentDto = {
    name: '',
    code: '',
    description: '',
    headEmployeeId: null,
    parentDepartmentId: null,
  };
  editDeptForm: UpdateDepartmentDto = {
    name: '',
    description: '',
    headEmployeeId: null,
    isActive: true,
  };

  // Modal States - Level Edit
  showEditLevelModal = false;
  editingLevel: OrganizationalLevelHierarchyItem | null = null;
  editLevelForm = {
    code: '',
    name: '',
    description: '',
  };

  ngOnInit(): void {
    this.initLevelsTableColumns();
    this.initMatrixTableColumns();
    this.rebuildTopStatCards();
    this.loadAllData();
  }

  private initMatrixTableColumns(): void {
    this.matrixTableColumns = [
      {
        field: 'module',
        headerName: 'Application Module',
        cellTemplate: this.modNameTpl,
        width: 260,
        minWidth: 240,
      },
      {
        field: 'allChecked',
        headerName: 'Select All',
        cellTemplate: this.modSelectAllTpl,
        width: 100,
        minWidth: 90,
      },
      {
        field: 'viewChecked',
        headerName: 'View',
        cellTemplate: this.modViewTpl,
        width: 85,
        minWidth: 75,
      },
      {
        field: 'createChecked',
        headerName: 'Create',
        cellTemplate: this.modCreateTpl,
        width: 85,
        minWidth: 75,
      },
      {
        field: 'editChecked',
        headerName: 'Edit',
        cellTemplate: this.modEditTpl,
        width: 85,
        minWidth: 75,
      },
      {
        field: 'deleteChecked',
        headerName: 'Delete',
        cellTemplate: this.modDeleteTpl,
        width: 85,
        minWidth: 75,
      },
      {
        field: 'approveChecked',
        headerName: 'Approve',
        cellTemplate: this.modApproveTpl,
        width: 90,
        minWidth: 80,
      },
      {
        field: 'assignChecked',
        headerName: 'Assign',
        cellTemplate: this.modAssignTpl,
        width: 85,
        minWidth: 75,
      },
      {
        field: 'exportChecked',
        headerName: 'Export',
        cellTemplate: this.modExportTpl,
        width: 85,
        minWidth: 75,
      },
      {
        field: 'manageChecked',
        headerName: 'Manage',
        cellTemplate: this.modManageTpl,
        width: 90,
        minWidth: 80,
      },
    ];
  }

  private initLevelsTableColumns(): void {
    this.levelsTableColumns = [
      {
        field: 'sno',
        headerName: 'S.No',
        width: 70,
      },
      {
        field: 'code',
        headerName: 'Level',
        cellTemplate: this.levelCodeTpl,
        width: 120,
      },
      {
        field: 'name',
        headerName: 'Level Title',
        width: 250,
      },
      {
        field: 'description',
        headerName: 'Level Description & Role Focus',
        width: 380,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        cellTemplate: this.levelActionsTpl,
        width: 100,
      },
    ];
  }

  loadAllData(): void {
    this.isLoading = true;
    this.loadDepartments();
    this.loadDepartmentHeads();
    this.loadLevels();
    this.loadPermissionsCatalog();
    this.loadRoles();
  }

  loadDepartmentHeads(currentDeptId?: string): void {
    this.rbacService.getEligibleDepartmentHeads$(currentDeptId).subscribe({
      next: (eligibleList) => {
        if (eligibleList && eligibleList.length > 0) {
          this.departmentHeadOptions = [
            { label: '-- Select Department Head (Optional) --', value: '' },
            ...eligibleList.map((e: any) => ({
              label: `${e.fullName} (${e.employeeCode} • Level ${e.levelCode})`,
              value: e.id,
            })),
          ];
        } else {
          this.departmentHeadOptions = [
            { label: '-- No unassigned Level 3 employees available --', value: '' },
          ];
        }
      },
      error: () => {
        this.departmentHeadOptions = [
          { label: '-- No unassigned Level 3 employees available --', value: '' },
        ];
      },
    });
  }

  private rebuildTopStatCards(): void {
    const totalEmployeesAcrossDepts = this.departments.reduce(
      (acc, d) => acc + (d.employeeCount || 0),
      0
    );

    this.topStatCards = [
      {
        title: 'Total Departments',
        value: this.departments.length || 11,
        subtitle: `${totalEmployeesAcrossDepts} Total Employees`,
        badgeText: 'Active',
        badgeType: 'emerald',
        icon: 'bi-buildings-fill',
      },
      {
        title: 'Organization Levels',
        value: `${this.levels.length || 10} Levels`,
        subtitle: 'L1 to L10 Hierarchy',
        badgeText: 'Standardized',
        badgeType: 'info',
        icon: 'bi-layers-fill',
      },
      {
        title: 'System Roles',
        value: `${this.roles.length || 23} Roles`,
        subtitle: `${this.allPermissions.length || 13} Application Modules`,
        badgeText: 'RBAC Active',
        badgeType: 'warning',
        icon: 'bi-shield-lock-fill',
      },
    ];
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
      this.toastTimer = null;
    }
  }

  // ====================================================================
  // 1. DEPARTMENTS SECTION (STAT CARDS WITH EMPLOYEE COUNT)
  // ====================================================================

  loadDepartments(): void {
    this.rbacService.getDepartments$().subscribe({
      next: (depts) => {
        this.departments = depts || [];
        this.updateDepartmentsView();
        this.rebuildTopStatCards();
        this.isLoading = false;
      },
      error: () => {
        this.showToast('Failed to load company departments.', 'danger');
        this.isLoading = false;
      },
    });
  }

  updateDepartmentsView(): void {
    const q = this.departmentSearch.toLowerCase().trim();
    this.filteredDepartments = this.departments.filter((d) => {
      return (
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q))
      );
    });
  }

  openAddDepartmentModal(): void {
    this.deptForm = {
      name: '',
      code: '',
      description: '',
      headEmployeeId: null,
      parentDepartmentId: null,
    };
    this.loadDepartmentHeads();
    this.showAddDeptModal = true;
  }

  closeAddDepartmentModal(): void {
    this.showAddDeptModal = false;
  }

  saveDepartment(): void {
    if (!this.deptForm.name.trim() || !this.deptForm.code.trim()) {
      this.showToast('Department Name and Code are required.', 'danger');
      return;
    }

    const payload = {
      ...this.deptForm,
      headEmployeeId: this.deptForm.headEmployeeId ? this.deptForm.headEmployeeId : null,
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

  openEditDepartmentModal(dept: DepartmentHierarchyItem): void {
    this.editingDept = dept;
    this.editDeptForm = {
      name: dept.name,
      description: dept.description || '',
      headEmployeeId: dept.headEmployeeId || null,
      isActive: dept.isActive !== false,
    };
    this.loadDepartmentHeads(dept.id);
    this.showEditDeptModal = true;
  }

  closeEditDepartmentModal(): void {
    this.showEditDeptModal = false;
    this.editingDept = null;
  }

  updateDepartment(): void {
    if (!this.editingDept || !this.editDeptForm.name.trim()) {
      this.showToast('Department name is required.', 'danger');
      return;
    }

    const payload = {
      ...this.editDeptForm,
      headEmployeeId: this.editDeptForm.headEmployeeId ? this.editDeptForm.headEmployeeId : null,
    };

    this.rbacService.updateDepartment$(this.editingDept.id, payload).subscribe({
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

  deleteDepartment(dept: DepartmentHierarchyItem): void {
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
  // 2. LEVELS SECTION (MINIMAL TABLE WITH EDIT OPTION)
  // ====================================================================

  loadLevels(): void {
    this.isLoadingLevels = true;
    this.rbacService
      .getLevelsAndDesignations$()
      .pipe(finalize(() => (this.isLoadingLevels = false)))
      .subscribe({
        next: (levels) => {
          this.levels = levels || [];
          this.updateLevelsView();
          this.rebuildTopStatCards();
        },
        error: () => {
          this.showToast('Failed to load organizational levels.', 'danger');
        },
      });
  }

  updateLevelsView(): void {
    const q = this.levelSearch.toLowerCase().trim();
    const rows: LevelTableRow[] = this.levels
      .filter((lvl) => {
        return (
          !q ||
          lvl.code.toLowerCase().includes(q) ||
          lvl.name.toLowerCase().includes(q) ||
          (lvl.description && lvl.description.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => a.rankOrder - b.rankOrder)
      .map((lvl, idx) => ({
        id: lvl.id,
        sno: idx + 1,
        code: lvl.code,
        name: lvl.name,
        description: lvl.description || 'Seniority level within organization hierarchy.',
        rankOrder: lvl.rankOrder,
      }));

    this.filteredLevelsTable = rows;
    const totalPages = Math.max(1, Math.ceil(this.filteredLevelsTable.length / this.levelPageSize));
    this.levelEffectivePage = Math.min(Math.max(1, this.levelCurrentPage), totalPages);
    const start = (this.levelEffectivePage - 1) * this.levelPageSize;
    this.paginatedLevels = this.filteredLevelsTable.slice(start, start + this.levelPageSize);
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

  openEditLevelModal(levelRow: LevelTableRow): void {
    const fullLevel = this.levels.find((l) => l.id === levelRow.id);
    if (!fullLevel) return;

    this.editingLevel = fullLevel;
    this.editLevelForm = {
      code: fullLevel.code,
      name: fullLevel.name,
      description: fullLevel.description || '',
    };
    this.showEditLevelModal = true;
  }

  closeEditLevelModal(): void {
    this.showEditLevelModal = false;
    this.editingLevel = null;
  }

  saveEditLevel(): void {
    if (!this.editingLevel || !this.editLevelForm.code.trim() || !this.editLevelForm.name.trim()) {
      this.showToast('Level code and name are required.', 'danger');
      return;
    }

    this.rbacService
      .updateOrganizationalLevel$(this.editingLevel.id, {
        code: this.editLevelForm.code.trim().toUpperCase(),
        name: this.editLevelForm.name.trim(),
        description: this.editLevelForm.description.trim(),
      })
      .subscribe({
        next: () => {
          this.showToast(`Level '${this.editLevelForm.code}' updated successfully!`, 'success');
          this.closeEditLevelModal();
          this.loadLevels();
        },
        error: (err) => {
          const msg = err.error?.message || 'Failed to update level.';
          this.showToast(msg, 'danger');
        },
      });
  }

  // Helper to extract default level number (e.g. L1..L10) for a given system role
  getRoleLevel(roleCode?: string): string {
    if (!roleCode) return 'L8';
    switch (roleCode.toUpperCase()) {
      case 'EMP_SUPER_ADMIN':
        return 'L1';
      case 'EMP_HR_ADMIN':
      case 'EMP_ORG_ADMIN':
        return 'L2';
      case 'EMP_DEPT_MANAGER':
        return 'L3';
      case 'EMP_FINANCE_MANAGER':
      case 'EMP_RECRUITMENT_MANAGER':
      case 'EMP_PROJECT_MANAGER':
        return 'L4';
      case 'EMP_TASK_MANAGER':
      case 'EMP_IT_ADMIN':
        return 'L5';
      case 'EMP_TEAM_LEAD':
      case 'EMP_RECRUITER':
        return 'L6';
      case 'EMP_PAYROLL_ADMIN':
      case 'EMP_ATTENDANCE_ADMIN':
      case 'EMP_LEAVE_ADMIN':
      case 'EMP_REPORTS_ANALYST':
      case 'EMP_DOCUMENT_ADMIN':
      case 'EMP_REQUEST_APPROVER':
      case 'EMP_AUDITOR':
        return 'L7';
      case 'EMP_HR_EXECUTIVE':
      case 'EMP_EMPLOYEE':
      case 'EMP_SUPPORT_AGENT':
        return 'L8';
      case 'EMP_TEAM_COORDINATOR':
      case 'EMP_DEPARTMENT_COORDINATOR':
        return 'L9';
      default:
        return 'L8';
    }
  }

  // ====================================================================
  // 3. ROLES & RBAC PERMISSIONS MATRIX WITH LEVEL NUMBER & CHECKBOXES
  // ====================================================================

  get rolesForSelectedLevel(): RoleItem[] {
    return this.roles.filter((r) => this.getRoleLevel(r.code) === this.selectedLevelTab);
  }

  updateMatrixTableData(): void {
    const q = this.moduleSearch.toLowerCase().trim();
    const modules = this.allPermissions.filter(
      (m) =>
        !q ||
        m.module.toLowerCase().includes(q) ||
        m.permissions?.some((p) => p.action.toLowerCase().includes(q))
    );

    this.matrixTableData = modules.map((mod) => ({
      module: mod.module,
      actionCount: mod.permissions.length,
      allChecked: this.isAllActionsGranted(mod.module),
      viewChecked: this.isActionChecked(mod.module, 'View'),
      createChecked: this.isActionChecked(mod.module, 'Create'),
      editChecked: this.isActionChecked(mod.module, 'Edit'),
      deleteChecked: this.isActionChecked(mod.module, 'Delete'),
      approveChecked: this.isActionChecked(mod.module, 'Approve'),
      assignChecked: this.isActionChecked(mod.module, 'Assign'),
      exportChecked: this.isActionChecked(mod.module, 'Export'),
      manageChecked: this.isActionChecked(mod.module, 'Manage'),
    }));
  }

  selectLevelTab(lvlCode: string): void {
    if (this.selectedLevelTab === lvlCode) return;
    this.selectedLevelTab = lvlCode;
    const rolesForLevel = this.rolesForSelectedLevel;
    if (rolesForLevel.length > 0) {
      this.selectRole(rolesForLevel[0]);
    } else {
      // Find default fallback
      const matching = this.roles.find((r) => this.getRoleLevel(r.code) === lvlCode);
      if (matching) {
        this.selectRole(matching);
      }
    }
  }

  getPermissionByModuleAndAction(moduleName: string, actionName: string) {
    const grp = this.allPermissions.find((g) => g.module === moduleName);
    return grp?.permissions.find((p) => p.action.toLowerCase() === actionName.toLowerCase());
  }

  isActionChecked(moduleName: string, actionName: string): boolean {
    const perm = this.getPermissionByModuleAndAction(moduleName, actionName);
    if (!perm) return false;
    return !!this.rolePermissionsMap[perm.code]?.granted;
  }

  getActionScope(moduleName: string, actionName: string): string {
    const perm = this.getPermissionByModuleAndAction(moduleName, actionName);
    if (!perm) return 'Own';
    return this.rolePermissionsMap[perm.code]?.scope || 'Own';
  }

  toggleModuleAction(moduleName: string, actionName: string): void {
    const perm = this.getPermissionByModuleAndAction(moduleName, actionName);
    if (!perm) return;
    this.togglePermission(perm.code);
    this.updateMatrixTableData();
  }

  setModuleActionScope(moduleName: string, actionName: string, scope: string): void {
    const perm = this.getPermissionByModuleAndAction(moduleName, actionName);
    if (!perm) return;
    this.changeScope(perm.code, scope);
    this.updateMatrixTableData();
  }

  toggleAllActionsInModule(moduleName: string): void {
    const grp = this.allPermissions.find((g) => g.module === moduleName);
    if (!grp) return;
    const allGranted = grp.permissions.every((p) => this.rolePermissionsMap[p.code]?.granted);
    if (allGranted) {
      this.clearAllInModule(moduleName);
    } else {
      this.grantAllInModule(moduleName);
    }
    this.updateMatrixTableData();
  }

  isAllActionsGranted(moduleName: string): boolean {
    const grp = this.allPermissions.find((g) => g.module === moduleName);
    if (!grp || grp.permissions.length === 0) return false;
    return grp.permissions.every((p) => this.rolePermissionsMap[p.code]?.granted);
  }

  loadPermissionsCatalog(): void {
    this.rbacService.getAllPermissions$().subscribe({
      next: (groups) => {
        this.allPermissions = groups || [];
        this.updateMatrixTableData();
      },
      error: () => {},
    });
  }

  loadRoles(): void {
    this.rbacService.getRoles$().subscribe({
      next: (roles) => {
        this.roles = roles || [];
        this.updateRolesView();
        this.rebuildTopStatCards();

        if (this.roles.length > 0 && !this.selectedRole) {
          const defaultRole =
            this.roles.find((r) => r.code === 'EMP_HR_ADMIN') || this.roles[0];
          this.selectRole(defaultRole);
        }
      },
      error: () => {
        this.showToast('Failed to load system roles.', 'danger');
      },
    });
  }

  updateRolesView(): void {
    const q = this.roleSearch.toLowerCase().trim();
    this.filteredRoles = this.roles.filter((r) => {
      const level = this.getRoleLevel(r.code);
      return (
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        level.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    });
  }

  selectRole(role: RoleItem): void {
    if (this.isRoleDirty) {
      if (
        !confirm(
          `You have unsaved changes for '${this.selectedRole?.name}'. Switch to '${role.name}' and discard changes?`
        )
      ) {
        return;
      }
    }

    this.selectedRole = role;
    this.loadRolePermissions(role.code);
  }

  private loadRolePermissions(roleCode: string): void {
    this.rbacService.getRolePermissions$(roleCode).subscribe({
      next: (res) => {
        const map: Record<string, { granted: boolean; scope: string }> = {};

        if (res?.modules) {
          for (const mod of res.modules) {
            if (mod.permissions) {
              for (const p of mod.permissions) {
                map[p.code] = {
                  granted: true,
                  scope: p.scope || 'Own',
                };
              }
            }
          }
        }

        this.rolePermissionsMap = { ...map };
        this.originalRolePermissionsMap = JSON.parse(JSON.stringify(map));
        this.isRoleDirty = false;
        this.recalculateGrantedCount();
        this.updateMatrixTableData();
      },
      error: () => {
        this.showToast(`Failed to load permissions for role '${roleCode}'.`, 'danger');
      },
    });
  }

  togglePermission(permCode: string): void {
    const current = this.rolePermissionsMap[permCode];
    if (current && current.granted) {
      this.rolePermissionsMap[permCode] = { granted: false, scope: current.scope };
    } else {
      this.rolePermissionsMap[permCode] = {
        granted: true,
        scope: current ? current.scope : 'Own',
      };
    }
    this.checkDirty();
    this.recalculateGrantedCount();
    this.updateMatrixTableData();
  }

  changeScope(permCode: string, newScope: string): void {
    const current = this.rolePermissionsMap[permCode];
    if (current && current.granted) {
      this.rolePermissionsMap[permCode] = {
        granted: true,
        scope: newScope,
      };
      this.checkDirty();
      this.updateMatrixTableData();
    }
  }

  grantAllInModule(moduleName: string): void {
    const group = this.allPermissions.find((g) => g.module === moduleName);
    if (!group) return;

    for (const p of group.permissions) {
      const prev = this.rolePermissionsMap[p.code];
      this.rolePermissionsMap[p.code] = {
        granted: true,
        scope: prev ? prev.scope : 'Department',
      };
    }
    this.checkDirty();
    this.recalculateGrantedCount();
    this.updateMatrixTableData();
  }

  clearAllInModule(moduleName: string): void {
    const group = this.allPermissions.find((g) => g.module === moduleName);
    if (!group) return;

    for (const p of group.permissions) {
      if (this.rolePermissionsMap[p.code]) {
        this.rolePermissionsMap[p.code].granted = false;
      }
    }
    this.checkDirty();
    this.recalculateGrantedCount();
    this.updateMatrixTableData();
  }

  grantAllPermissions(): void {
    for (const group of this.allPermissions) {
      for (const p of group.permissions) {
        const prev = this.rolePermissionsMap[p.code];
        this.rolePermissionsMap[p.code] = {
          granted: true,
          scope: prev ? prev.scope : 'Organization',
        };
      }
    }
    this.checkDirty();
    this.recalculateGrantedCount();
    this.updateMatrixTableData();
  }

  clearAllPermissions(): void {
    for (const code of Object.keys(this.rolePermissionsMap)) {
      this.rolePermissionsMap[code].granted = false;
    }
    this.checkDirty();
    this.recalculateGrantedCount();
    this.updateMatrixTableData();
  }

  private recalculateGrantedCount(): void {
    this.grantedCountForCurrentRole = Object.values(this.rolePermissionsMap).filter(
      (v) => v.granted
    ).length;
  }

  private checkDirty(): void {
    let dirty = false;
    const allCodes = new Set([
      ...Object.keys(this.rolePermissionsMap),
      ...Object.keys(this.originalRolePermissionsMap),
    ]);

    for (const code of allCodes) {
      const curr = this.rolePermissionsMap[code];
      const orig = this.originalRolePermissionsMap[code];
      const currGranted = curr ? curr.granted : false;
      const origGranted = orig ? orig.granted : false;

      if (currGranted !== origGranted) {
        dirty = true;
        break;
      }
      if (currGranted && origGranted && curr.scope !== orig.scope) {
        dirty = true;
        break;
      }
    }
    this.isRoleDirty = dirty;
  }

  saveRolePermissions(): void {
    if (!this.selectedRole) return;

    const payload: RolePermissionItemDto[] = [];
    for (const [code, val] of Object.entries(this.rolePermissionsMap)) {
      if (val.granted) {
        payload.push({
          permissionCode: code,
          scope: val.scope,
        });
      }
    }

    this.isSavingRole = true;
    this.rbacService
      .updateRolePermissions$(this.selectedRole.code, payload)
      .pipe(finalize(() => (this.isSavingRole = false)))
      .subscribe({
        next: (res) => {
          this.showToast(
            res.message || `Saved permissions for '${this.selectedRole?.name}'!`,
            'success'
          );
          this.originalRolePermissionsMap = JSON.parse(JSON.stringify(this.rolePermissionsMap));
          this.isRoleDirty = false;
          this.loadRoles();
        },
        error: (err) => {
          const msg = err.error?.message || 'Failed to update role permissions.';
          this.showToast(msg, 'danger');
        },
      });
  }
}
