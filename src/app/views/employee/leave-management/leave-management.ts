import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService, EmployeeLeaveProposal } from '../../../core/services/leave.service';

@Component({
  selector: 'app-leave-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-management.html',
  styleUrl: './leave-management.css',
})
export class LeaveManagement implements OnInit {
  proposals: EmployeeLeaveProposal[] = [];

  // Filter & Search Controls
  searchQuery: string = '';
  selectedStatus: 'ALL' | 'Pending' | 'Approved' | 'Rejected' = 'ALL';
  selectedType: string = 'ALL';

  readonly leaveTypes: string[] = [
    'Casual Leave',
    'Sick Leave',
    'Earned Leave',
    'Comp-Off',
    'Annual Vacation',
  ];

  // Feedback Notification Toast
  actionToastMessage: string = '';
  private toastTimer: any;

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.loadProposals();
  }

  loadProposals(): void {
    this.proposals = this.leaveService.getProposals();
  }

  // Filtered List Getter
  get filteredProposals(): EmployeeLeaveProposal[] {
    let result = [...this.proposals];

    // 1. Status Filter
    if (this.selectedStatus !== 'ALL') {
      result = result.filter((p) => p.status === this.selectedStatus);
    }

    // 2. Type Filter
    if (this.selectedType !== 'ALL') {
      result = result.filter((p) => p.leaveType === this.selectedType);
    }

    // 3. Search Query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.employeeId.toLowerCase().includes(q) ||
          p.employeeName.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q) ||
          p.leaveType.toLowerCase().includes(q) ||
          p.reason.toLowerCase().includes(q)
      );
    }

    return result;
  }

  // Top Metrics
  get totalCount(): number {
    return this.proposals.length;
  }

  get pendingCount(): number {
    return this.proposals.filter((p) => p.status === 'Pending').length;
  }

  get approvedCount(): number {
    return this.proposals.filter((p) => p.status === 'Approved').length;
  }

  get rejectedCount(): number {
    return this.proposals.filter((p) => p.status === 'Rejected').length;
  }

  // Direct Manager Approval Action
  approve(proposal: EmployeeLeaveProposal): void {
    const success = this.leaveService.approveProposal(proposal.id);
    if (success) {
      this.loadProposals();
      this.showToast(`✓ Leave proposal for ${proposal.employeeName} (${proposal.days}d ${proposal.leaveType}) approved!`);
    }
  }

  // Direct Manager Rejection Action
  reject(proposal: EmployeeLeaveProposal): void {
    const success = this.leaveService.rejectProposal(proposal.id);
    if (success) {
      this.loadProposals();
      this.showToast(`✗ Leave proposal for ${proposal.employeeName} has been declined.`);
    }
  }

  // Batch Approve All Pending
  approveAllPending(): void {
    const count = this.leaveService.approveAllPending();
    if (count > 0) {
      this.loadProposals();
      this.showToast(`✓ Successfully approved all ${count} pending leave proposals!`);
    } else {
      this.showToast('No pending leave proposals to approve.');
    }
  }

  setStatusFilter(status: 'ALL' | 'Pending' | 'Approved' | 'Rejected'): void {
    this.selectedStatus = status;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedType = 'ALL';
    this.loadProposals();
    this.showToast('Leave proposal filters reset.');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-subtle text-emerald border border-emerald-subtle';
      case 'Pending':
        return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'Rejected':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      default:
        return 'bg-light text-dark';
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'Casual Leave':
        return 'bg-emerald-subtle text-emerald';
      case 'Sick Leave':
        return 'bg-info-subtle text-info';
      case 'Earned Leave':
        return 'bg-primary-subtle text-primary';
      case 'Comp-Off':
        return 'bg-secondary-subtle text-dark';
      case 'Annual Vacation':
        return 'bg-warning-subtle text-warning-emphasis';
      default:
        return 'bg-light text-dark';
    }
  }

  getInitials(name?: string): string {
    if (!name) return 'EMP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }

  private showToast(msg: string): void {
    this.actionToastMessage = msg;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.actionToastMessage = '';
    }, 4000);
  }
}
