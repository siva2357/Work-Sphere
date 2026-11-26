import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CompanyDirectoryService } from '../../../core/services/company-directory.service';
import { RequestService } from '../../../core/services/request.service';
import { StatCards } from '../../../library/shared/components/stat-cards/stat-cards';
import { Button } from '../../../library/UI/components/button/button';
import {
  ActivityItem,
  CelebrationItem,
  DeptMetric,
  StatMetric,
} from '../../../core/models/workspace.interface';

export type { ActivityItem, CelebrationItem, DeptMetric, StatMetric };

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCards, Button],
  templateUrl: './hr-dashboard.html',
  styleUrl: './hr-dashboard.css',
})
export class HrDashboard implements OnInit {
  private authService = inject(AuthService);
  private companyDirectoryService = inject(CompanyDirectoryService);
  private requestService = inject(RequestService);

  adminName = '';
  adminRole = '';
  currentDateTime = new Date();

  statCards: StatMetric[] = [
    {
      title: 'Total Workforce',
      value: '0',
      subtitle: 'Synced from Employee Directory',
      badgeText: 'Active',
      badgeType: 'emerald',
      icon: 'bi-people-fill',
      route: '/employee-directory',
    },
    {
      title: 'Attendance Today',
      value: '100%',
      subtitle: 'Live Attendance Tracking',
      badgeText: 'Optimal',
      badgeType: 'success',
      icon: 'bi-clock-history',
      route: '/employee-directory',
    },
    {
      title: 'Active Departments',
      value: '11 Depts',
      subtitle: 'Sub-K IMPACT Solutions',
      badgeText: 'Structured',
      badgeType: 'info',
      icon: 'bi-diagram-3-fill',
      route: '/organizations&departments',
    },
    {
      title: 'Pending Approvals',
      value: '0',
      subtitle: 'Multi-Stage Requests',
      badgeText: 'Requires Action',
      badgeType: 'warning',
      icon: 'bi-inbox-fill',
      route: '/requests-management',
    },
  ];

  departmentBreakdown: DeptMetric[] = [];

  attendanceBreakdown = {
    present: 0,
    presentPct: 0,
    onLeave: 0,
    onLeavePct: 0,
    remote: 0,
    remotePct: 0,
    late: 0,
    latePct: 0,
  };

  recentActivities: ActivityItem[] = [];
  celebrations: CelebrationItem[] = [];

  payrollSummary = {
    count: 0,
    total: 0,
    month: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date()),
  };

  quickActions = [
    {
      title: 'Add Employee',
      desc: 'Create employee record & credentials',
      icon: 'bi-person-plus-fill',
      route: '/employee-directory',
      badge: 'Directory',
    },
    {
      title: 'Manage Structure',
      desc: 'Departments & organizational roles',
      icon: 'bi-diagram-3-fill',
      route: '/organizations&departments',
      badge: 'Org Chart',
    },
    {
      title: 'Review Requests',
      desc: 'Items awaiting HR approval',
      icon: 'bi-check-circle-fill',
      route: '/requests-management',
      badge: 'Action req.',
    },
    {
      title: 'Run Monthly Payroll',
      desc: 'Review disbursement list',
      icon: 'bi-wallet2',
      route: '/payroll-management',
      badge: 'Payroll',
    },
    {
      title: 'New Announcement',
      desc: 'Post company or team notification',
      icon: 'bi-megaphone-fill',
      route: '/announcements',
      badge: 'Broadcast',
    },
  ];

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.adminName = user.fullName;
        this.adminRole = user.designationTitle || user.levelName || 'Main HR';
      }
    });

    const companyCode = this.authService.getCurrentCompanyCode();
    this.companyDirectoryService.getEmployeeDirectory$(companyCode).subscribe((res) => {
      const employees = res?.employees || [];
      const total = employees.length;
      this.statCards[0].value = String(total);
      this.statCards[0].subtitle = `${res?.company?.name || companyCode}`;

      const totalNet = employees.reduce((acc, _, idx) => {
        const basic = 55000 + idx * 5000;
        return acc + (basic + Math.round(basic * 0.4) - Math.round(basic * 0.12));
      }, 0);
      this.payrollSummary.count = total;
      this.payrollSummary.total = totalNet;

      this.recentActivities = employees.slice(0, 4).map((e, idx) => ({
        id: String(idx + 1),
        title: e.isMainHr ? 'Main HR Administrator Active' : 'Employee Directory Record',
        description: `${e.name} — ${e.role} [${e.department}]`,
        time: e.joiningDate || 'Active',
        icon: e.isMainHr ? 'bi-shield-check' : 'bi-person-check',
        badgeClass: e.isMainHr ? 'bg-primary-subtle text-primary' : 'bg-emerald-subtle text-emerald',
        type: 'onboarding' as const,
      }));

      this.celebrations = employees.slice(0, 3).map((e) => ({
        name: e.name,
        role: e.role,
        department: e.department,
        avatar: e.avatar?.startsWith('http')
          ? e.avatar
          : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        event: e.isMainHr ? 'HR Lead' : 'Team Member',
        date: e.joiningDate || 'Active this month',
        type: 'anniversary' as const,
      }));

      if (total > 0) {
        const present = employees.filter((e) => e.status === 'Active' || !e.status).length;
        const onLeave = employees.filter((e) => e.status === 'On Leave').length;
        const remote = employees.filter((e) => e.status === 'Remote').length;
        const presentPct = Math.round((present / total) * 100);
        this.statCards[1].value = `${presentPct}%`;
        this.statCards[1].subtitle = `${present} Present · ${onLeave} On Leave`;

        this.attendanceBreakdown = {
          present,
          presentPct,
          onLeave,
          onLeavePct: Math.round((onLeave / total) * 100),
          remote,
          remotePct: Math.round((remote / total) * 100),
          late: 0,
          latePct: 0,
        };

        const deptMap: Record<string, number> = {};
        employees.forEach((e) => {
          deptMap[e.department] = (deptMap[e.department] || 0) + 1;
        });
        const colors = ['bg-emerald', 'bg-teal', 'bg-info', 'bg-primary', 'bg-warning', 'bg-secondary'];
        this.departmentBreakdown = Object.entries(deptMap).map(([name, count], idx) => ({
          name,
          count,
          percentage: Math.round((count / total) * 100),
          colorClass: colors[idx % colors.length],
        }));
      }
    });

    this.requestService.requests$.subscribe((reqs) => {
      const list = reqs || [];
      const pendingCount = list.filter((r) => r.overallStatus === 'Pending' || r.overallStatus === 'Under Review').length;
      this.statCards[3].value = String(pendingCount);
    });
    this.requestService.refreshRequests();
  }
}
