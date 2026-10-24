import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface LeaveRecord {
  sNo: number;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Comp-Off' | 'Maternity/Paternity';
  fromDate: string;
  toDate: string;
  days: number;
  month: string;
  reason: string;
  appliedDate: string;
  approvedBy: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Cancelled';
}

export interface LeaveBalance {
  type: string;
  shortCode: string;
  used: number;
  total: number;
  available: number;
  colorClass: string;
}

export interface UpcomingHoliday {
  name: string;
  date: string;
  day: string;
  type: 'National' | 'Restricted' | 'Festival';
  isPast: boolean;
}

@Component({
  selector: 'app-my-leaves',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './my-leaves.html',
  styleUrl: './my-leaves.css',
})
export class MyLeaves {
  // Month & Filters
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

  // 6 Top Stat Cards (Applied, Pending, Approved, Rejected, Earned, Paid)
  appliedLeaves = 6;
  pendingLeaves = 1;
  approvedLeaves = 4;
  rejectedLeaves = 1;
  earnedLeaves = 12;
  paidLeaves = 18;

  // Leave Balances for Side Widget
  leaveBalances: LeaveBalance[] = [
    { type: 'Casual Leave', shortCode: 'CL', used: 4, total: 12, available: 8, colorClass: 'bg-emerald' },
    { type: 'Sick Leave', shortCode: 'SL', used: 2, total: 8, available: 6, colorClass: 'bg-info' },
    { type: 'Earned Leave', shortCode: 'EL', used: 3, total: 15, available: 12, colorClass: 'bg-primary' },
    { type: 'Comp-Off', shortCode: 'CO', used: 0, total: 2, available: 2, colorClass: 'bg-warning' },
  ];

  // Upcoming Holidays
  upcomingHolidays: UpcomingHoliday[] = [
    { name: 'Gandhi Jayanti', date: '02 Oct 2026', day: 'Friday', type: 'National', isPast: true },
    { name: 'Dussehra (Vijayadashami)', date: '20 Oct 2026', day: 'Tuesday', type: 'Festival', isPast: true },
    { name: 'Diwali (Deepavali)', date: '08 Nov 2026', day: 'Sunday', type: 'Festival', isPast: false },
    { name: 'Guru Nanak Jayanti', date: '24 Nov 2026', day: 'Tuesday', type: 'Restricted', isPast: false },
    { name: 'Christmas Day', date: '25 Dec 2026', day: 'Friday', type: 'National', isPast: false },
  ];

  // Full Leaves Records Table (Chronological)
  leaveRecords: LeaveRecord[] = [
    {
      sNo: 1,
      leaveType: 'Casual Leave',
      fromDate: '14 Oct 2026',
      toDate: '15 Oct 2026',
      days: 2,
      month: 'October 2026',
      reason: 'Attending family wedding & hometown visit',
      appliedDate: '09 Oct 2026',
      approvedBy: 'Karthik Rao (Team Lead)',
      status: 'Approved',
    },
    {
      sNo: 2,
      leaveType: 'Sick Leave',
      fromDate: '22 Oct 2026',
      toDate: '22 Oct 2026',
      days: 1,
      month: 'October 2026',
      reason: 'Acute fever, doctor consultation and rest',
      appliedDate: '21 Oct 2026',
      approvedBy: 'Pending Manager Sign-off',
      status: 'Pending',
    },
    {
      sNo: 3,
      leaveType: 'Comp-Off',
      fromDate: '05 Oct 2026',
      toDate: '05 Oct 2026',
      days: 1,
      month: 'October 2026',
      reason: 'Compensatory off for weekend critical release support and testing',
      appliedDate: '03 Oct 2026',
      approvedBy: 'Karthik Rao (Team Lead)',
      status: 'Rejected',
    },
    {
      sNo: 4,
      leaveType: 'Earned Leave',
      fromDate: '27 Oct 2026',
      toDate: '28 Oct 2026',
      days: 2,
      month: 'October 2026',
      reason: 'Personal urgent appointment and family event travel across city',
      appliedDate: '18 Oct 2026',
      approvedBy: 'Deepak Sharma (VP Engg)',
      status: 'Approved',
    },
    {
      sNo: 5,
      leaveType: 'Sick Leave',
      fromDate: '15 Sep 2026',
      toDate: '16 Sep 2026',
      days: 2,
      month: 'September 2026',
      reason: 'Acute seasonal flu and physician advised rest',
      appliedDate: '15 Sep 2026',
      approvedBy: 'Karthik Rao (Team Lead)',
      status: 'Approved',
    },
    {
      sNo: 6,
      leaveType: 'Earned Leave',
      fromDate: '18 Aug 2026',
      toDate: '21 Aug 2026',
      days: 4,
      month: 'August 2026',
      reason: 'Annual personal rejuvenation & vacation trip',
      appliedDate: '01 Aug 2026',
      approvedBy: 'Deepak Sharma (VP Engg)',
      status: 'Approved',
    },
  ];

  get filteredLeaveRecords(): LeaveRecord[] {
    return this.leaveRecords.filter((rec) => {
      if (this.currentMonth && rec.month !== this.currentMonth) {
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
    const monthRecs = this.leaveRecords.filter((r) => r.month === this.currentMonth);
    if (monthRecs.length > 0) {
      this.appliedLeaves = monthRecs.reduce((acc, r) => acc + r.days, 0);
      this.pendingLeaves = monthRecs.filter((r) => r.status === 'Pending').reduce((acc, r) => acc + r.days, 0);
      this.approvedLeaves = monthRecs.filter((r) => r.status === 'Approved').reduce((acc, r) => acc + r.days, 0);
      this.rejectedLeaves = monthRecs.filter((r) => r.status === 'Rejected').reduce((acc, r) => acc + r.days, 0);
    } else {
      this.appliedLeaves = 0;
      this.pendingLeaves = 0;
      this.approvedLeaves = 0;
      this.rejectedLeaves = 0;
    }
  }
}
