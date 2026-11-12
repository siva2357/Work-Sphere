import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../../core/services/leave.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  LeaveBalance,
  LeaveRecord,
  UpcomingHoliday,
} from '../../../core/models/leave.interface';

export type { LeaveBalance, LeaveRecord, UpcomingHoliday };

@Component({
  selector: 'app-my-leaves',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './my-leaves.html',
  styleUrl: './my-leaves.css',
})
export class MyLeaves implements OnInit {
  private leaveService = inject(LeaveService);
  private authService = inject(AuthService);

  currentMonth: string = 'October 2026';
  availableMonths: string[] = [
    'October 2026',
    'September 2026',
    'August 2026',
    'July 2026',
    'June 2026',
    'May 2026',
    'April 2026',
    'March 2026',
    'February 2026',
    'January 2026',
  ];
  statusFilter: string = 'ALL';
  typeFilter: string = 'ALL';

  appliedLeaves = 0;
  pendingLeaves = 0;
  approvedLeaves = 0;
  rejectedLeaves = 0;
  earnedLeaves = 0;
  paidLeaves = 0;

  leaveBalances: LeaveBalance[] = [];
  upcomingHolidays: UpcomingHoliday[] = [];
  leaveRecords: LeaveRecord[] = [];

  ngOnInit(): void {
    const empCode = this.authService.getCurrentEmployeeCode();
    this.leaveService.fetchMyLeaves$(empCode).subscribe((res: any) => {
      if (Array.isArray(res?.balances)) {
        this.leaveBalances = res.balances.map((b: any) => ({
          type: b.leaveType || 'Casual Leave',
          shortCode: b.shortCode || 'CL',
          used: Number(b.used ?? 0),
          total: Number(b.totalAllocated ?? 12),
          available: Number(b.available ?? 12),
          colorClass: b.colorClass || 'bg-emerald',
        }));

        const el = this.leaveBalances.find((b) => b.shortCode === 'EL');
        if (el) {
          this.earnedLeaves = el.available;
        }
        this.paidLeaves = this.leaveBalances.reduce((acc, b) => acc + b.available, 0);
      }

      if (Array.isArray(res?.upcomingHolidays)) {
        this.upcomingHolidays = res.upcomingHolidays;
      }

      if (Array.isArray(res?.leaveHistory)) {
        this.leaveRecords = res.leaveHistory.map((h: any, idx: number) => ({
          sNo: idx + 1,
          leaveType: (h.leaveType as LeaveRecord['leaveType']) || 'Casual Leave',
          fromDate: h.fromDate || '',
          toDate: h.toDate || '',
          days: Number(h.daysCount ?? 1),
          month: h.month || 'October 2026',
          reason: h.reason || '',
          appliedDate: h.appliedDate || '',
          approvedBy: h.approvedBy || 'Manager',
          status: (h.status as LeaveRecord['status']) || 'Pending',
        }));
        this.updateStatsForMonth();
      }
    });
  }

  get filteredLeaveRecords(): LeaveRecord[] {
    return this.leaveRecords.filter((rec) => {
      if (this.currentMonth && rec.month && rec.month !== this.currentMonth) {
        return false;
      }
      if (this.statusFilter !== 'ALL' && rec.status.toUpperCase() !== this.statusFilter) {
        return false;
      }
      if (this.typeFilter !== 'ALL' && rec.leaveType !== this.typeFilter) {
        return false;
      }
      return true;
    });
  }

  clearFilters(): void {
    this.statusFilter = 'ALL';
    this.typeFilter = 'ALL';
  }

  onMonthChange(): void {
    this.clearFilters();
    this.updateStatsForMonth();
  }

  updateStatsForMonth(): void {
    const monthRecs = this.leaveRecords.filter(
      (r) => !this.currentMonth || !r.month || r.month === this.currentMonth
    );
    if (monthRecs.length > 0) {
      this.appliedLeaves = monthRecs.reduce((acc, r) => acc + r.days, 0);
      this.pendingLeaves = monthRecs
        .filter((r) => r.status === 'Pending')
        .reduce((acc, r) => acc + r.days, 0);
      this.approvedLeaves = monthRecs
        .filter((r) => r.status === 'Approved')
        .reduce((acc, r) => acc + r.days, 0);
      this.rejectedLeaves = monthRecs
        .filter((r) => r.status === 'Rejected')
        .reduce((acc, r) => acc + r.days, 0);
    } else {
      this.appliedLeaves = 0;
      this.pendingLeaves = 0;
      this.approvedLeaves = 0;
      this.rejectedLeaves = 0;
    }
  }
}
