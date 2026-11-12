import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyDirectoryService } from '../../../core/services/company-directory.service';
import { AuthService } from '../../../core/services/auth.service';
import { PayrollRecord } from '../../../core/models/workspace.interface';

export type { PayrollRecord };

@Component({
  selector: 'app-payroll-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payroll-management.html',
  styleUrl: './payroll-management.css',
})
export class PayrollManagement implements OnInit {
  private companyDirectoryService = inject(CompanyDirectoryService);
  private authService = inject(AuthService);

  currentCycle = 'October 2026';
  searchTerm = '';
  selectedDept = 'All';
  selectedStatus = 'All';

  showPayslipModal = false;
  selectedPayroll: PayrollRecord | null = null;

  payrollList: PayrollRecord[] = [];

  ngOnInit(): void {
    const companyCode = this.authService.getCurrentCompanyCode();
    const avatars = [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    ];

    this.companyDirectoryService.getEmployeeDirectory$(companyCode).subscribe((res) => {
      const employees = res?.employees || [];
      this.payrollList = employees.map((e, idx) => {
        const basicSalary = 55000 + idx * 5000;
        const allowances = Math.round(basicSalary * 0.4);
        const deductions = Math.round(basicSalary * 0.12);
        return {
          id: `PAY-${1001 + idx}`,
          employeeId: e.employeeCode || e.id,
          name: e.name,
          role: e.role,
          department: e.department,
          avatar: avatars[idx % avatars.length],
          basicSalary,
          allowances,
          deductions,
          netSalary: basicSalary + allowances - deductions,
          paymentMethod: 'Direct Deposit (HDFC Bank)',
          status: 'Paid',
        };
      });
    });
  }

  get filteredPayroll(): PayrollRecord[] {
    return this.payrollList.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.employeeId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.role.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesDept =
        this.selectedDept === 'All' || item.department === this.selectedDept;
      const matchesStatus =
        this.selectedStatus === 'All' || item.status === this.selectedStatus;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }

  get totalNetPayroll(): number {
    return this.payrollList.reduce((acc, curr) => acc + curr.netSalary, 0);
  }

  get totalAllowances(): number {
    return this.payrollList.reduce((acc, curr) => acc + curr.allowances, 0);
  }

  get totalDeductions(): number {
    return this.payrollList.reduce((acc, curr) => acc + curr.deductions, 0);
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
