import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestService, ManagedRequest, ApprovalLevel } from '../../../core/services/request.service';

@Component({
  selector: 'app-request-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-management.html',
  styleUrl: './request-management.css',
})
export class RequestManagement implements OnInit {
  requests: ManagedRequest[] = [];
  selectedRequest?: ManagedRequest;

  // Search & Filter State
  searchQuery: string = '';
  selectedStatus: 'ALL' | 'Pending' | 'Under Review' | 'Approved' | 'Rejected' = 'ALL';
  selectedCategory: string = 'ALL';
  selectedPriority: string = 'ALL';

  readonly categories: string[] = [
    'Hardware / Asset',
    'IT & System Access',
    'Promotion Request',
    'Appraisal & Salary Review',
    'Department Transfer',
    'Resignation Request',
    'Work From Home',
    'Expense Reimbursement',
  ];

  // Manager Remarks Input
  managerRemarks: string = '';

  // Feedback Notification Toast
  actionToastMessage: string = '';
  private toastTimer: any;

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.requests = this.requestService.getRequests();
    if (!this.selectedRequest && this.requests.length > 0) {
      this.selectedRequest = this.requests[0];
    } else if (this.selectedRequest) {
      // Re-link updated request
      const updated = this.requests.find((r) => r.id === this.selectedRequest?.id);
      if (updated) this.selectedRequest = updated;
    }
  }

  get filteredRequests(): ManagedRequest[] {
    let result = [...this.requests];

    // Status Filter
    if (this.selectedStatus !== 'ALL') {
      result = result.filter((r) => r.overallStatus === this.selectedStatus);
    }

    // Category Filter
    if (this.selectedCategory !== 'ALL') {
      result = result.filter((r) => r.category === this.selectedCategory);
    }

    // Priority Filter
    if (this.selectedPriority !== 'ALL') {
      result = result.filter((r) => r.priority === this.selectedPriority);
    }

    // Search Query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.employeeName.toLowerCase().includes(q) ||
          r.employeeId.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }

    return result;
  }

  // Quick select a request card
  selectRequest(req: ManagedRequest): void {
    this.selectedRequest = req;
    this.managerRemarks = '';
  }

  // Current active level helper
  getCurrentApprovalLevel(req?: ManagedRequest): ApprovalLevel | undefined {
    if (!req) return undefined;
    return req.approvalChain.find((l) => l.isCurrent);
  }

  // Is current stage the Final HR level
  isCurrentLevelFinalHR(req?: ManagedRequest): boolean {
    const current = this.getCurrentApprovalLevel(req);
    return current?.isFinalHR === true;
  }

  // Timeline progress helpers
  getTimelineProgressPercent(req?: ManagedRequest): number {
    if (!req || req.approvalChain.length === 0) return 0;
    if (req.overallStatus === 'Approved') return 100;
    const approvedCount = req.approvalChain.filter((l) => l.status === 'Approved').length;
    return Math.round((approvedCount / req.approvalChain.length) * 100);
  }

  // Modal view states
  viewingForm: boolean = false;
  viewingDetailsStep?: ApprovalLevel;

  // Approver display helpers matching HROne workflow style
  getCurrentApproverDisplay(req: ManagedRequest): string {
    const current = req.approvalChain.find((l) => l.isCurrent);
    if (current) {
      const code = this.getApproverCode(current);
      return `${current.approverName} (${code})`;
    }
    if (req.overallStatus === 'Approved') {
      const last = req.approvalChain[req.approvalChain.length - 1];
      return `${last?.approverName || 'HR Operations'} (Completed)`;
    }
    if (req.overallStatus === 'Rejected') {
      const rejected = req.approvalChain.find((l) => l.status === 'Rejected');
      return `${rejected?.approverName || 'Management'} (Declined)`;
    }
    return 'HR Operations';
  }

  getApproverCode(step: ApprovalLevel): string {
    return step.approverId || `#P${11000 + step.levelNumber * 115}`;
  }

  openFormModal(): void {
    this.viewingForm = true;
  }

  closeFormModal(): void {
    this.viewingForm = false;
  }

  openDetailsModal(step: ApprovalLevel): void {
    this.viewingDetailsStep = step;
  }

  closeDetailsModal(): void {
    this.viewingDetailsStep = undefined;
  }

  // Executive Counters
  get totalCount(): number {
    return this.requests.length;
  }

  get pendingReviewCount(): number {
    return this.requests.filter((r) => r.overallStatus === 'Pending' || r.overallStatus === 'Under Review').length;
  }

  get approvedCount(): number {
    return this.requests.filter((r) => r.overallStatus === 'Approved').length;
  }

  get rejectedCount(): number {
    return this.requests.filter((r) => r.overallStatus === 'Rejected').length;
  }

  // Direct Decision: Approve & Advance to Next Level (or Final HR Approval)
  onApproveCurrentStage(): void {
    if (!this.selectedRequest) return;

    const result = this.requestService.approveCurrentLevel(this.selectedRequest.id, this.managerRemarks);
    if (result.success) {
      this.loadRequests();
      this.managerRemarks = '';
      this.showToast(result.message);
    }
  }

  // Direct Decision: Decline / Reject Request at Current Stage
  onRejectCurrentStage(): void {
    if (!this.selectedRequest) return;

    const success = this.requestService.rejectCurrentLevel(this.selectedRequest.id, this.managerRemarks);
    if (success) {
      this.loadRequests();
      this.managerRemarks = '';
      this.showToast(`✗ Request ${this.selectedRequest.id} has been declined.`);
    }
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedCategory = 'ALL';
    this.selectedPriority = 'ALL';
    this.loadRequests();
    this.showToast('Request filters reset.');
  }

  // Style Helpers
  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-subtle text-emerald border border-emerald-subtle';
      case 'Under Review':
        return 'bg-info-subtle text-info border border-info-subtle';
      case 'Pending':
        return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'Rejected':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      default:
        return 'bg-light text-dark';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Urgent':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'High':
        return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'Medium':
        return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'Low':
        return 'bg-light text-muted border';
      default:
        return 'bg-light text-dark';
    }
  }

  getCategoryBadgeClass(category: string): string {
    switch (category) {
      case 'Hardware / Asset':
        return 'bg-primary-subtle text-primary';
      case 'Promotion Request':
        return 'bg-emerald-subtle text-emerald';
      case 'IT & System Access':
        return 'bg-danger-subtle text-danger';
      case 'Appraisal & Salary Review':
        return 'bg-warning-subtle text-warning-emphasis';
      case 'Department Transfer':
        return 'bg-info-subtle text-info';
      case 'Resignation Request':
        return 'bg-secondary-subtle text-dark';
      case 'Work From Home':
        return 'bg-emerald-subtle text-emerald';
      case 'Expense Reimbursement':
        return 'bg-primary-subtle text-primary';
      default:
        return 'bg-light text-dark';
    }
  }

  getInitials(name?: string): string {
    if (!name) return 'REQ';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }

  private showToast(msg: string): void {
    this.actionToastMessage = msg;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.actionToastMessage = '';
    }, 4500);
  }
}
