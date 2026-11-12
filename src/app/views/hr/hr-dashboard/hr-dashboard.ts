import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CompanyDirectoryService } from '../../../core/services/company-directory.service';
import { RecruitmentService } from '../../../core/services/recruitment.service';
import { RequestService } from '../../../core/services/request.service';
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
  imports: [CommonModule, RouterModule],
  templateUrl: './hr-dashboard.html',
  styleUrl: './hr-dashboard.css',
})
export class HrDashboard implements OnInit {
  private authService = inject(AuthService);
  private companyDirectoryService = inject(CompanyDirectoryService);
  private recruitmentService = inject(RecruitmentService);
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
      title: 'Active Recruitment',
      value: '0 Jobs',
      subtitle: '0 Candidates in Pipeline',
      badgeText: '4-Phase Funnel',
      badgeType: 'info',
      icon: 'bi-briefcase-fill',
      route: '/recruitment-management',
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

  recruitmentStages: { stage: string; count: number; color: string }[] = [];
  recentActivities: ActivityItem[] = [];
  celebrations: CelebrationItem[] = [];

  quickActions = [
    {
      title: 'Add Employee',
      desc: 'Create employee record & credentials',
      icon: 'bi-person-plus-fill',
      route: '/employee-directory',
      badge: 'Directory',
    },
    {
      title: 'Post Job Opening',
      desc: 'Publish opening & start screening',
      icon: 'bi-plus-circle-fill',
      route: '/recruitment-management',
      badge: 'Hiring',
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

      if (total > 0) {
        const present = employees.filter((e) => e.status === 'Active').length;
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

    this.recruitmentService.getJobOpenings$().subscribe((jobs) => {
      this.recruitmentService.getCandidates$().subscribe((candidates) => {
        const jobsCount = Array.isArray(jobs) ? jobs.length : 0;
        const cands = Array.isArray(candidates) ? candidates : [];
        this.statCards[2].value = `${jobsCount} Jobs`;
        this.statCards[2].subtitle = `${cands.length} Candidates in Pipeline`;

        this.recruitmentStages = [
          { stage: 'Phase 1: Assessment', count: cands.filter((c) => c.currentPhase === 'Phase1_Assessment').length, color: 'text-primary' },
          { stage: 'Phase 2: Technical', count: cands.filter((c) => c.currentPhase === 'Phase2_TechnicalRound').length, color: 'text-info' },
          { stage: 'Phase 3: Online Interview', count: cands.filter((c) => c.currentPhase === 'Phase3_OnlineInterview').length, color: 'text-warning' },
          { stage: 'Phase 4: Offer Release', count: cands.filter((c) => c.currentPhase === 'Phase4_OfferRelease').length, color: 'text-emerald' },
          { stage: 'Onboarded / Hired', count: cands.filter((c) => c.currentPhase === 'Hired').length, color: 'text-success' },
        ];
      });
    });

    const reqs = this.requestService.getRequests();
    const pendingCount = reqs.filter((r) => r.overallStatus === 'Pending' || r.overallStatus === 'Under Review').length;
    this.statCards[3].value = String(pendingCount);
  }
}
