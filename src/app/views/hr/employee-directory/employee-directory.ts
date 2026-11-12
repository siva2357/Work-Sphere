import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyDirectoryService } from '../../../core/services/company-directory.service';
import { AuthService } from '../../../core/services/auth.service';
import { DropdownService } from '../../../core/services/dropdown.service';
import { EmployeeRecord } from '../../../core/models/company-directory.interface';
import {
  HelperDepartmentOption,
  HelperDesignationOption,
  HelperOrganizationalLevelOption,
  HelperRoleOption
} from '../../../core/models/helper.interface';

export type { EmployeeRecord };

@Component({
  selector: 'app-employee-directory',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  selectedEmployee: EmployeeRecord | null = null;

  departmentsList: HelperDepartmentOption[] = [];
  levelsList: HelperOrganizationalLevelOption[] = [];
  designationsList: HelperDesignationOption[] = [];
  rolesList: HelperRoleOption[] = [];

  newEmployee = {
    name: '',
    email: '',
    phone: '',
    department: 'ENG',
    levelCode: 'L8',
    role: 'DESIG_DEV',
    systemRole: 'EMP_DEVELOPER',
    type: 'Full-time' as 'Full-time' | 'Contract' | 'Intern',
    location: 'Bangalore, India',
    manager: '',
    joiningDate: new Date().toISOString().split('T')[0],
  };

  employees: EmployeeRecord[] = [];

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

  onDesignationChange(desigCode: string): void {
    const found = this.designationsList.find((d) => d.code === desigCode);
    if (found) {
      this.newEmployee.levelCode = found.levelCode;
      if (found.defaultRoleCode) {
        this.newEmployee.systemRole = found.defaultRoleCode;
      }
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
    this.showAddEmployeeModal = true;
  }

  closeAddEmployee(): void {
    this.showAddEmployeeModal = false;
  }

  saveEmployee(): void {
    if (!this.newEmployee.name || !this.newEmployee.email) return;

    this.companyDirectoryService
      .createEmployeeByMainHr$(
        {
          fullName: this.newEmployee.name,
          email: this.newEmployee.email,
          phone: this.newEmployee.phone,
          departmentCode: this.newEmployee.department,
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
}
