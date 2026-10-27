import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PayrollRecord {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentMethod: string;
  status: 'Paid' | 'Processing' | 'Pending Approval';
}

@Component({
  selector: 'app-payroll-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payroll-management.html',
  styleUrl: './payroll-management.css',
})
export class PayrollManagement implements OnInit {
  currentCycle = 'October 2026';
  searchTerm = '';
  selectedDept = 'All';
  selectedStatus = 'All';

  // Modal
  showPayslipModal = false;
  selectedPayroll: PayrollRecord | null = null;

  payrollList: PayrollRecord[] = [
    {
      id: 'PAY-1001',
      employeeId: 'WS-101',
      name: 'Eleanor Vance',
      role: 'Head of People & Culture',
      department: 'Human Resources',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      basicSalary: 6200,
      allowances: 1200,
      deductions: 750,
      netSalary: 6650,
      paymentMethod: 'Direct Deposit (Chase ****4821)',
      status: 'Processing'
    },
    {
      id: 'PAY-1002',
      employeeId: 'WS-102',
      name: 'Marcus Vance',
      role: 'VP of Engineering',
      department: 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      basicSalary: 8500,
      allowances: 1500,
      deductions: 1100,
      netSalary: 8900,
      paymentMethod: 'Direct Deposit (Wells Fargo ****9123)',
      status: 'Processing'
    },
    {
      id: 'PAY-1003',
      employeeId: 'WS-103',
      name: 'Maya Lin',
      role: 'Backend Engineering Lead',
      department: 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      basicSalary: 5800,
      allowances: 900,
      deductions: 620,
      netSalary: 6080,
      paymentMethod: 'Direct Deposit (Bank of America ****3301)',
      status: 'Paid'
    },
    {
      id: 'PAY-1004',
      employeeId: 'WS-104',
      name: 'Alex Rivera',
      role: 'Staff UX/UI Designer',
      department: 'Product & Design',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      basicSalary: 5200,
      allowances: 850,
      deductions: 540,
      netSalary: 5510,
      paymentMethod: 'Direct Deposit (Citibank ****8849)',
      status: 'Processing'
    },
    {
      id: 'PAY-1005',
      employeeId: 'WS-105',
      name: 'Priya Sharma',
      role: 'Senior Product Manager',
      department: 'Product & Design',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
      basicSalary: 6000,
      allowances: 1100,
      deductions: 720,
      netSalary: 6380,
      paymentMethod: 'Direct Deposit (Chase ****1092)',
      status: 'Processing'
    },
    {
      id: 'PAY-1006',
      employeeId: 'WS-106',
      name: 'David Miller',
      role: 'Senior Frontend Engineer',
      department: 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      basicSalary: 5400,
      allowances: 800,
      deductions: 580,
      netSalary: 5620,
      paymentMethod: 'Direct Deposit (HSBC ****7761)',
      status: 'Pending Approval'
    },
    {
      id: 'PAY-1007',
      employeeId: 'WS-108',
      name: 'Rohan Verma',
      role: 'Senior Growth & Sales Manager',
      department: 'Sales',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      basicSalary: 5000,
      allowances: 1600,
      deductions: 680,
      netSalary: 5920,
      paymentMethod: 'Direct Deposit (Standard Chartered ****2311)',
      status: 'Paid'
    }
  ];

  ngOnInit(): void {}

  get filteredPayroll(): PayrollRecord[] {
    return this.payrollList.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.employeeId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.role.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesDept = this.selectedDept === 'All' || item.department === this.selectedDept;
      const matchesStatus = this.selectedStatus === 'All' || item.status === this.selectedStatus;
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

  viewPayslip(item: PayrollRecord) {
    this.selectedPayroll = item;
    this.showPayslipModal = true;
  }

  closePayslipModal() {
    this.showPayslipModal = false;
    this.selectedPayroll = null;
  }
}
