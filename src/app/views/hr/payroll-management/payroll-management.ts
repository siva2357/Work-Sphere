import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { CompanyDirectoryService } from '../../../core/services/company-directory.service';
import { AuthService } from '../../../core/services/auth.service';
import { DropdownService } from '../../../core/services/dropdown.service';
import { PayrollRecord } from '../../../core/models/workspace.interface';
import { StatCards, StatMetric } from '../../../library/shared/components/stat-cards/stat-cards';
import {
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

export type { PayrollRecord };

export interface PayrollTableRow extends PayrollRecord {
  sno: number;
}

export interface PayrollFilterChip {
  key: 'search' | 'department' | 'status';
  label: string;
  icon: string;
}

@Component({
  selector: 'app-payroll-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatCards,
    Button,
    InputField,
    Badge,
    Chip,
    Table,
    Pagination,
  ],
  templateUrl: './payroll-management.html',
  styleUrl: './payroll-management.css',
})
export class PayrollManagement implements OnInit {
  private companyDirectoryService = inject(CompanyDirectoryService);
  private authService = inject(AuthService);
  private dropdownService = inject(DropdownService);

  @ViewChild('profileImgTpl', { static: true }) profileImgTpl!: TemplateRef<any>;
  @ViewChild('deptTpl', { static: true }) deptTpl!: TemplateRef<any>;
  @ViewChild('basicSalaryTpl', { static: true }) basicSalaryTpl!: TemplateRef<any>;
  @ViewChild('allowancesTpl', { static: true }) allowancesTpl!: TemplateRef<any>;
  @ViewChild('deductionsTpl', { static: true }) deductionsTpl!: TemplateRef<any>;
  @ViewChild('netSalaryTpl', { static: true }) netSalaryTpl!: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;

  tableColumns: TableColumn[] = [];
  isLoadingPayroll = false;

  currentCycle = 'October 2026';

  // Draft Filter Inputs (bound to the filter controls)
  draftSearchTerm = '';
  draftDept = 'All';
  draftStatus = 'All';

  // Applied Filter Values
  searchTerm = '';
  selectedDept = 'All';
  selectedStatus = 'All';

  currentPage = 1;
  pageSize = 10;
  effectiveCurrentPage = 1;

  showPayslipModal = false;
  selectedPayroll: PayrollRecord | null = null;

  payrollList: PayrollRecord[] = [];
  filteredPayroll: PayrollRecord[] = [];
  paginatedPayroll: PayrollTableRow[] = [];
  activeFilterChips: PayrollFilterChip[] = [];
  statCards: StatMetric[] = [];

  departmentFilterOptions: InputDropdownOption[] = [{ label: 'All Departments', value: 'All' }];

  readonly statusFilterOptions: InputDropdownOption[] = [
    { label: 'All Statuses', value: 'All' },
    { label: 'Paid', value: 'Paid' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Pending Approval', value: 'Pending Approval' },
  ];

  ngOnInit(): void {
    this.initTableColumns();
    this.rebuildStatCards();
    this.loadHelperDropdowns();
    this.loadPayrollFromDirectory();
  }

  private initTableColumns(): void {
    this.tableColumns = [
      {
        field: 'sno',
        headerName: 'S.No',
        width: 70,
      },
      {
        field: 'id',
        headerName: 'Payroll ID',
        width: 115,
      },
      {
        field: 'employeeId',
        headerName: 'Employee ID',
        width: 120,
      },
      {
        field: 'avatar',
        headerName: 'Profile Image',
        cellTemplate: this.profileImgTpl,
        width: 110,
      },
      {
        field: 'name',
        headerName: 'Full Name',
        width: 180,
      },
      {
        field: 'department',
        headerName: 'Department',
        cellTemplate: this.deptTpl,
        width: 230,
      },
      {
        field: 'role',
        headerName: 'Designation',
        width: 210,
      },
      {
        field: 'basicSalary',
        headerName: 'Basic Salary',
        cellTemplate: this.basicSalaryTpl,
        width: 130,
      },
      {
        field: 'allowances',
        headerName: 'Allowances',
        cellTemplate: this.allowancesTpl,
        width: 130,
      },
      {
        field: 'deductions',
        headerName: 'Deductions',
        cellTemplate: this.deductionsTpl,
        width: 130,
      },
      {
        field: 'netSalary',
        headerName: 'Net Salary',
        cellTemplate: this.netSalaryTpl,
        width: 135,
      },
      {
        field: 'status',
        headerName: 'Status',
        cellTemplate: this.statusTpl,
        width: 140,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        cellTemplate: this.actionsTpl,
        width: 90,
      },
    ];
  }

  private loadHelperDropdowns(): void {
    this.dropdownService.dropdowns$.subscribe((dropdowns) => {
      const depts = dropdowns.departments || [];
      if (depts.length > 0) {
        this.departmentFilterOptions = [
          { label: 'All Departments', value: 'All' },
          ...depts.map((dept) => ({
            label: `${dept.name} (${dept.code})`,
            value: dept.name,
          })),
        ];
      }
    });
  }

  private loadPayrollFromDirectory(): void {
    this.isLoadingPayroll = true;
    const companyCode = this.authService.getCurrentCompanyCode();
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
      .pipe(finalize(() => (this.isLoadingPayroll = false)))
      .subscribe((res) => {
        const employees = res?.employees || [];
        this.payrollList = employees.map((e, idx) => {
          const basicSalary = 55000 + idx * 5000;
          const allowances = Math.round(basicSalary * 0.4);
          const deductions = Math.round(basicSalary * 0.12);
          const roleDisplay =
            e.level && !e.role.includes(`(${e.level})`) ? `${e.role} (${e.level})` : e.role;
          return {
            id: `PAY-${1001 + idx}`,
            employeeId: e.employeeCode || e.id,
            name: e.name,
            role: roleDisplay,
            department: e.department,
            avatar: e.avatar?.startsWith('http') ? e.avatar : avatars[idx % avatars.length],
            basicSalary,
            allowances,
            deductions,
            netSalary: basicSalary + allowances - deductions,
            paymentMethod: 'Direct Deposit (HDFC Bank)',
            status: 'Paid',
          };
        });
        this.updatePayrollView();
      });
  }

  private rebuildStatCards(): void {
    const totalNet = this.payrollList.reduce((acc, curr) => acc + curr.netSalary, 0);
    const totalAllow = this.payrollList.reduce((acc, curr) => acc + curr.allowances, 0);
    const totalDed = this.payrollList.reduce((acc, curr) => acc + curr.deductions, 0);

    this.statCards = [
      {
        title: 'Estimated Net Pay',
        value: `$${totalNet.toLocaleString('en-US')}`,
        subtitle: `${this.payrollList.length} active employees`,
        badgeText: 'Ready',
        badgeType: 'emerald',
        icon: 'bi-wallet2',
      },
      {
        title: 'Total Allowances',
        value: `$${totalAllow.toLocaleString('en-US')}`,
        subtitle: 'HRA, Travel & Medical',
        badgeText: '+4.2%',
        badgeType: 'info',
        icon: 'bi-gift',
      },
      {
        title: 'Taxes & Deductions',
        value: `$${totalDed.toLocaleString('en-US')}`,
        subtitle: 'TDS, PF & Insurance',
        badgeText: 'Compliant',
        badgeType: 'warning',
        icon: 'bi-shield-check',
      },
      {
        title: 'Disbursement Date',
        value: 'Oct 31',
        subtitle: 'Automated ACH Direct',
        badgeText: 'Scheduled',
        badgeType: 'success',
        icon: 'bi-calendar-event',
      },
    ];
  }

  private rebuildActiveFilterChips(): void {
    const chips: PayrollFilterChip[] = [];
    if (this.searchTerm.trim()) {
      chips.push({
        key: 'search',
        label: `Search: "${this.searchTerm.trim()}"`,
        icon: 'bi-search',
      });
    }
    if (this.selectedDept && this.selectedDept !== 'All') {
      chips.push({
        key: 'department',
        label: `Department: ${this.selectedDept}`,
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

  private updatePayrollView(): void {
    const q = this.searchTerm.toLowerCase();
    this.filteredPayroll = this.payrollList.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.employeeId.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q);
      const matchesDept =
        this.selectedDept === 'All' ||
        item.department.toLowerCase().includes(this.selectedDept.toLowerCase());
      const matchesStatus =
        this.selectedStatus === 'All' || item.status === this.selectedStatus;
      return matchesSearch && matchesDept && matchesStatus;
    });

    const totalPages = Math.max(1, Math.ceil(this.filteredPayroll.length / this.pageSize));
    this.effectiveCurrentPage = Math.min(Math.max(1, this.currentPage), totalPages);

    const start = (this.effectiveCurrentPage - 1) * this.pageSize;
    this.paginatedPayroll = this.filteredPayroll
      .slice(start, start + this.pageSize)
      .map((item, idx) => ({
        ...item,
        sno: start + idx + 1,
      }));

    this.rebuildActiveFilterChips();
    this.rebuildStatCards();
  }

  applyFilters(): void {
    this.searchTerm = this.draftSearchTerm.trim();
    this.selectedDept = this.draftDept || 'All';
    this.selectedStatus = this.draftStatus || 'All';
    this.currentPage = 1;
    this.updatePayrollView();
  }

  resetFilters(): void {
    this.draftSearchTerm = '';
    this.draftDept = 'All';
    this.draftStatus = 'All';
    this.searchTerm = '';
    this.selectedDept = 'All';
    this.selectedStatus = 'All';
    this.currentPage = 1;
    this.updatePayrollView();
  }

  removeFilterChip(key: 'search' | 'department' | 'status'): void {
    if (key === 'search') {
      this.draftSearchTerm = '';
      this.searchTerm = '';
    } else if (key === 'department') {
      this.draftDept = 'All';
      this.selectedDept = 'All';
    } else if (key === 'status') {
      this.draftStatus = 'All';
      this.selectedStatus = 'All';
    }
    this.currentPage = 1;
    this.updatePayrollView();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePayrollView();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updatePayrollView();
  }

  getStatusBadgeVariant(status?: string): BadgeVariant {
    switch (status) {
      case 'Paid':
        return 'soft-success';
      case 'Processing':
        return 'soft-emerald';
      case 'Pending Approval':
        return 'soft-warning';
      default:
        return 'soft-emerald';
    }
  }

  markPayrollStatus(item: PayrollRecord, status: PayrollRecord['status']): void {
    this.payrollList = this.payrollList.map((p) =>
      p.id === item.id ? { ...p, status } : p
    );
    this.updatePayrollView();
  }

  viewPayslip(item: PayrollRecord): void {
    this.selectedPayroll = item;
    this.showPayslipModal = true;
  }

  closePayslipModal(): void {
    this.showPayslipModal = false;
    this.selectedPayroll = null;
  }
}
