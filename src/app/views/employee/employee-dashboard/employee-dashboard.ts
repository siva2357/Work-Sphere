import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  route: string;
  badgeText: string;
  badgeType: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  route: string;
}

interface RecentRequest {
  id: string;
  type: string;
  date: string;
  duration: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Under Review';
}

interface DayAttendance {
  day: string;
  date: string;
  hours: number;
  percentage: number;
  status: 'completed' | 'in-progress' | 'upcoming';
}

interface TaskItem {
  id: number;
  title: string;
  dueDate: string;
  completed: boolean;
  tag: string;
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css',
})
export class EmployeeDashboard implements OnInit, OnDestroy {
  // Employee details
  employeeName = 'Siva Prasad';
  employeeRole = 'Software Engineer';
  employeeDepartment = 'IT Department';
  profileImage = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';

  // Live Time
  currentDateTime = new Date();
  private timerInterval: any;

  // Punch In / Punch Out State
  isClockedIn = true;
  clockInTime = '09:15 AM';
  elapsedHours = 4;
  elapsedMinutes = 38;

  // Performance Data
  performanceScore = 88; // 88%
  performanceRating = 4.4; // out of 5
  goalsAchieved = 14;
  totalGoals = 16;

  // Task Management Data
  tasks: TaskItem[] = [
    { id: 1, title: 'Complete Employee Portal dashboard responsive layout', dueDate: 'Today', completed: true, tag: 'UI/UX' },
    { id: 2, title: 'Connect Attendance Punch-in API integration', dueDate: 'Tomorrow', completed: true, tag: 'API' },
    { id: 3, title: 'Verify Leave Balance & approval workflow specs', dueDate: 'Oct 26', completed: false, tag: 'Review' },
    { id: 4, title: 'Submit signed quarterly compliance acknowledgment', dueDate: 'Oct 28', completed: false, tag: 'HR' }
  ];

  get tasksCompletedCount(): number {
    return this.tasks.filter(t => t.completed).length;
  }

  get taskPercentage(): number {
    if (!this.tasks.length) return 0;
    return Math.round((this.tasksCompletedCount / this.tasks.length) * 100);
  }

  // 4 Main Metric Stat Cards
  statCards: StatCard[] = [
    {
      title: 'Attendance Rate',
      value: '96.2%',
      subtitle: '21 of 22 Days logged this month',
      icon: 'bi-calendar-check',
      route: '/employee/my-attendance',
      badgeText: '+2.4% vs last mo',
      badgeType: 'success'
    },
    {
      title: 'Leave Balance',
      value: '14 Days',
      subtitle: '6 Casual · 5 Sick · 3 Earned',
      icon: 'bi-calendar2-week',
      route: '/employee/my-leaves',
      badgeText: 'Available',
      badgeType: 'emerald'
    },
    {
      title: 'Next Payday',
      value: 'Oct 31',
      subtitle: '7 days remaining (₹95,400 est.)',
      icon: 'bi-cash-coin',
      route: '/employee/my-payroll',
      badgeText: 'On Schedule',
      badgeType: 'success'
    },
    {
      title: 'Active Requests',
      value: '2 Pending',
      subtitle: '1 Leave, 1 WFH Request',
      icon: 'bi-inbox',
      route: '/employee/my-requests',
      badgeText: 'Under Review',
      badgeType: 'warning'
    }
  ];

  // Exactly the 5 requested Quick Actions:
  // 1. Mark Attendance, 2. Apply Leave, 3. Raise Request, 4. Payroll, 5. My Letters
  quickActions: QuickAction[] = [
    {
      title: 'Mark Attendance',
      description: 'Clock in / clock out & review daily hours',
      icon: 'bi-clock-history',
      route: '/employee/my-attendance'
    },
    {
      title: 'Apply Leave',
      description: 'Request casual, medical, or annual time-off',
      icon: 'bi-calendar-plus',
      route: '/employee/my-leaves'
    },
    {
      title: 'Raise Request',
      description: 'Submit WFH, expense claims, or equipment',
      icon: 'bi-send-plus',
      route: '/employee/my-requests'
    },
    {
      title: 'My Payroll',
      description: 'Download monthly payslips & tax breakdown',
      icon: 'bi-receipt-cutoff',
      route: '/employee/my-payroll'
    },
    {
      title: 'My Letters',
      description: 'Access offer, appointment, & appraisal documents',
      icon: 'bi-award',
      route: '/employee/my-documents'
    }
  ];

  // Weekly Working Hours Bar Chart (Mon - Fri)
  weeklyHours: DayAttendance[] = [
    { day: 'Mon', date: 'Oct 20', hours: 8.5, percentage: 94, status: 'completed' },
    { day: 'Tue', date: 'Oct 21', hours: 9.0, percentage: 100, status: 'completed' },
    { day: 'Wed', date: 'Oct 22', hours: 8.2, percentage: 91, status: 'completed' },
    { day: 'Thu', date: 'Oct 23', hours: 8.8, percentage: 98, status: 'completed' },
    { day: 'Fri', date: 'Today', hours: 4.6, percentage: 51, status: 'in-progress' }
  ];

  // Recent Requests List
  recentRequests: RecentRequest[] = [
    { id: 'REQ-1042', type: 'Casual Leave', date: 'Oct 28 - Oct 29', duration: '2 Days', status: 'Approved' },
    { id: 'REQ-1039', type: 'Work From Home', date: 'Oct 25', duration: '1 Day', status: 'Pending' },
    { id: 'REQ-1031', type: 'Expense Claim', date: 'Oct 18', duration: 'Travel ₹2,400', status: 'Approved' },
    { id: 'REQ-1025', type: 'Asset Request', date: 'Oct 12', duration: 'Monitor Stand', status: 'Under Review' }
  ];

  // Announcements
  announcements = [
    {
      tag: 'HR Announcement',
      title: 'Diwali Festive Holiday & Annual Celebration Event',
      date: 'Oct 24, 2026',
      badge: 'Important'
    },
    {
      tag: 'Policy Update',
      title: 'Updated Hybrid Work Policy & Flexible Hours Guidelines',
      date: 'Oct 22, 2026',
      badge: 'Policy'
    }
  ];

  // Upcoming Holidays
  upcomingHolidays = [
    { name: 'Diwali / Deepavali', date: 'Nov 01, 2026', day: 'Sunday', badge: 'Festival' },
    { name: 'Guru Nanak Jayanti', date: 'Nov 15, 2026', day: 'Sunday', badge: 'National' },
    { name: 'Christmas Day', date: 'Dec 25, 2026', day: 'Friday', badge: 'Public' }
  ];

  ngOnInit(): void {
    this.timerInterval = setInterval(() => {
      this.currentDateTime = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  toggleClock(): void {
    this.isClockedIn = !this.isClockedIn;
    if (this.isClockedIn) {
      const now = new Date();
      this.clockInTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  toggleTask(task: TaskItem): void {
    task.completed = !task.completed;
  }
}
