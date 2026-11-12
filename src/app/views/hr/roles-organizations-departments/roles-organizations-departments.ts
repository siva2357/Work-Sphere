import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RbacService } from '../../../core/services/rbac.service';
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

@Component({
  selector: 'app-roles-organizations-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-organizations-departments.html',
  styleUrl: './roles-organizations-departments.css',
})
export class RolesOrganizationsDepartments implements OnInit {
  private rbacService = inject(RbacService);

  // Active navigation tab
  activeTab: 'departments' | 'levels' | 'roles' | 'roster' = 'departments';

  // Loading states
  isLoading = false;
  isSavingRole = false;

  // Notification Toast
  toastMessage = '';
  toastType: 'success' | 'danger' | 'info' = 'success';
  private toastTimer: any = null;

  // Filter & Search states
  departmentSearch = '';
  levelTrackFilter: 'ALL' | 'Employee' | 'HR' = 'ALL';
  roleTrackFilter: 'ALL' | 'Employee' | 'HR' = 'ALL';
  roleSearch = '';
  employeeSearch = '';

  // Core Data
  departments: DepartmentHierarchyItem[] = [];
  levels: OrganizationalLevelHierarchyItem[] = [];
  designations: DesignationItem[] = [];
  roles: RoleItem[] = [];
  allPermissions: PermissionModuleGroup[] = [];
  employees: EmployeeHierarchyItem[] = [];

  // Selected Role & Permission Matrix
  selectedRole: RoleItem | null = null;
  rolePermissionsMap: { [permissionCode: string]: { granted: boolean; scope: string } } = {};
  isRoleDirty = false;
  readonly availableScopes: string[] = ['Own', 'Team', 'Project', 'Department', 'Organization', 'Delegated'];

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
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    this.loadDepartments();
    this.loadLevelsAndDesignations();
    this.loadPermissionsCatalog();
    this.loadRoles();
    this.loadEmployees();
  }

  // ====================================================================
  // TOAST NOTIFICATIONS
  // ====================================================================

  showToast(message: string, type: 'success' | 'danger' | 'info' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
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
        this.isLoading = false;
      },
      error: () => {
        this.showToast('Failed to load company departments.', 'danger');
        this.isLoading = false;
      },
    });
  }

  get filteredDepartments(): DepartmentHierarchyItem[] {
    if (!this.departmentSearch.trim()) {
      return this.departments;
    }
    const q = this.departmentSearch.toLowerCase().trim();
    return this.departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q)) ||
        d.subDepartments?.some(
          (sub) => sub.name.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q)
        )
    );
  }

  get totalSubDepartmentsCount(): number {
    return this.departments.reduce((sum, d) => sum + (d.subDepartments?.length || 0), 0);
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

    this.rbacService.createDepartment$(this.deptForm).subscribe({
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
    this.rbacService.getLevelsAndDesignations$().subscribe({
      next: (levels) => {
        this.levels = levels || [];
        this.extractAllDesignations();
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
          });
        }
      }
    }
    this.designations = list;
  }

  get filteredLevels(): OrganizationalLevelHierarchyItem[] {
    if (this.levelTrackFilter === 'ALL') {
      return this.levels;
    }
    return this.levels.filter(
      (l) => l.hierarchyTrack.toLowerCase() === this.levelTrackFilter.toLowerCase()
    );
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
    if (!this.desigForm.title.trim() || !this.desigForm.code.trim() || !this.desigForm.organizationalLevelId) {
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
        this.showToast(`Designation '${this.editDesigForm.title}' updated successfully!`, 'success');
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
        if (!this.selectedRole && this.roles.length > 0) {
          this.selectRole(this.roles[0]);
        }
      },
      error: () => {
        this.showToast('Failed to load system roles.', 'danger');
      },
    });
  }

  get filteredRoles(): RoleItem[] {
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
    return result;
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

        // Initialize all permissions as ungranted by default
        for (const group of this.allPermissions) {
          for (const perm of group.permissions) {
            map[perm.code] = { granted: false, scope: 'Own' };
          }
        }

        // Apply granted permissions from backend response
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
        this.isRoleDirty = false;
      },
      error: () => {
        this.showToast(`Failed to load permissions for role '${roleCode}'.`, 'danger');
      },
    });
  }

  togglePermission(permCode: string): void {
    if (!this.rolePermissionsMap[permCode]) {
      this.rolePermissionsMap[permCode] = { granted: true, scope: 'Own' };
    } else {
      this.rolePermissionsMap[permCode].granted = !this.rolePermissionsMap[permCode].granted;
    }
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
    this.isRoleDirty = true;
  }

  get grantedCountForCurrentRole(): number {
    return Object.values(this.rolePermissionsMap).filter((p) => p.granted).length;
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

  // Create Role Modal
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
  // 4. EMPLOYEE HIERARCHY & ROSTER
  // ====================================================================

  loadEmployees(): void {
    this.rbacService.getEmployeesHierarchy$().subscribe({
      next: (emps) => {
        this.employees = emps || [];
      },
      error: () => {
        // Soft error, employee roster may be populated later
      },
    });
  }

  get filteredEmployees(): EmployeeHierarchyItem[] {
    if (!this.employeeSearch.trim()) {
      return this.employees;
    }
    const q = this.employeeSearch.toLowerCase().trim();
    return this.employees.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.departmentName && e.departmentName.toLowerCase().includes(q)) ||
        (e.designationTitle && e.designationTitle.toLowerCase().includes(q)) ||
        e.roles?.some((r) => r.toLowerCase().includes(q))
    );
  }
}
