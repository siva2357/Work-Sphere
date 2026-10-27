import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface StatMetric {
  title: string;
  value: string;
  subtitle: string;
  badgeText: string;
  badgeType: 'emerald' | 'success' | 'warning' | 'info';
  icon: string;
  route: string;
}

interface DeptMetric {
  name: string;
  count: number;
  percentage: number;
  colorClass: string;
}

interface ActivityItem {
  id: string;
  type: 'onboarding' | 'leave' | 'payroll' | 'recruitment' | 'announcement';
  title: string;
  description: string;
  time: string;
  icon: string;
  badgeClass: string;
}

interface CelebrationItem {
  name: string;
  role: string;
  department: string;
  event: string;
  date: string;
  avatar: string;
  type: 'birthday' | 'anniversary';
}

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hr-dashboard.html',
  styleUrl: './hr-dashboard.css',
})
export class HrDashboard implements OnInit {
  adminName = 'Eleanor Vance';
  adminRole = 'Head of People & Culture';
  currentDateTime = new Date();

  statCards: StatMetric[] = [
    {
      title: 'Total Workforce',
      value: '248',
      subtitle: '+12 joined this month',
      badgeText: '+5.4% QoQ',
      badgeType: 'emerald',
      icon: 'bi-people-fill',
      route: '/hr/employee-directory'
    },
    {
      title: 'Attendance Today',
      value: '94.2%',
      subtitle: '234 Present · 14 On Leave',
      badgeText: 'Optimal',
      badgeType: 'success',
      icon: 'bi-clock-history',
      route: '/hr/employee-directory'
    },
    {
      title: 'Active Recruitment',
      value: '8 Jobs',
      subtitle: '42 Candidates in Pipeline',
      badgeText: '3 Final Round',
      badgeType: 'info',
      icon: 'bi-briefcase-fill',
      route: '/hr/recruitment-management'
    },
    {
      title: 'Pending Approvals',
      value: '11',
      subtitle: '7 Leaves · 4 Expense Claims',
      badgeText: 'Requires Action',
      badgeType: 'warning',
      icon: 'bi-inbox-fill',
      route: '/hr/requests-management'
    }
  ];

  departmentBreakdown: DeptMetric[] = [
    { name: 'Engineering & Tech', count: 98, percentage: 40, colorClass: 'bg-emerald' },
    { name: 'Product & Design', count: 36, percentage: 15, colorClass: 'bg-teal' },
    { name: 'Sales & Business', count: 52, percentage: 21, colorClass: 'bg-info' },
    { name: 'Marketing & Comms', count: 28, percentage: 11, colorClass: 'bg-primary' },
    { name: 'Operations & HR', count: 20, percentage: 8, colorClass: 'bg-warning' },
    { name: 'Finance & Legal', count: 14, percentage: 5, colorClass: 'bg-secondary' }
  ];

  attendanceBreakdown = {
    present: 218,
    presentPct: 88,
    onLeave: 14,
    onLeavePct: 6,
    remote: 12,
    remotePct: 5,
    late: 4,
    latePct: 1
  };

  recruitmentStages = [
    { stage: 'Applications', count: 86, color: 'text-primary' },
    { stage: 'Screening', count: 34, color: 'text-info' },
    { stage: 'Technical Interviews', count: 18, color: 'text-warning' },
    { stage: 'HR & Final', count: 7, color: 'text-emerald' },
    { stage: 'Offer Extended', count: 4, color: 'text-success' }
  ];

  recentActivities: ActivityItem[] = [
    {
      id: 'ACT-101',
      type: 'onboarding',
      title: 'New Employee Onboarded',
      description: 'David Miller joined as Senior Frontend Engineer in Engineering team.',
      time: '35 mins ago',
      icon: 'bi-person-check',
      badgeClass: 'bg-emerald-subtle text-emerald'
    },
    {
      id: 'ACT-102',
      type: 'leave',
      title: 'Annual Leave Approved',
      description: 'Approved 4 days of leave for Sarah Connor (Product Manager).',
      time: '2 hours ago',
      icon: 'bi-calendar2-check',
      badgeClass: 'bg-info-subtle text-info'
    },
    {
      id: 'ACT-103',
      type: 'payroll',
      title: 'October Payroll Calculated',
      description: 'Payroll cycle for 248 staff compiled. Net payable: $318,450.',
      time: '4 hours ago',
      icon: 'bi-cash-coin',
      badgeClass: 'bg-success-subtle text-success'
    },
    {
      id: 'ACT-104',
      type: 'recruitment',
      title: 'New Position Opened',
      description: 'Published job opening: Lead DevOps Architect (Full-time / Hybrid).',
      time: 'Yesterday',
      icon: 'bi-briefcase',
      badgeClass: 'bg-warning-subtle text-warning'
    },
    {
      id: 'ACT-105',
      type: 'announcement',
      title: 'Company Notice Broadcasted',
      description: 'Annual Health & Wellness Week schedule shared with all departments.',
      time: '2 days ago',
      icon: 'bi-megaphone',
      badgeClass: 'bg-primary-subtle text-primary'
    }
  ];

  celebrations: CelebrationItem[] = [
    {
      name: 'Alex Rivera',
      role: 'Staff UX Designer',
      department: 'Design',
      event: 'Birthday Today 🎂',
      date: 'Today',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      type: 'birthday'
    },
    {
      name: 'Maya Lin',
      role: 'Backend Team Lead',
      department: 'Engineering',
      event: 'Birthday on Oct 29 🎈',
      date: 'Oct 29',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      type: 'birthday'
    },
    {
      name: 'Priya Sharma',
      role: 'Senior Product Manager',
      department: 'Product',
      event: '3 Years Anniversary 🏆',
      date: 'Oct 30',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      type: 'anniversary'
    },
    {
      name: 'Marcus Vance',
      role: 'VP Engineering',
      department: 'Leadership',
      event: '5 Years Milestone 🌟',
      date: 'Nov 02',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      type: 'anniversary'
    }
  ];

  quickActions = [
    {
      title: 'Add Employee',
      desc: 'Create employee record & credentials',
      icon: 'bi-person-plus-fill',
      route: '/hr/employee-directory',
      badge: 'Directory'
    },
    {
      title: 'Post Job Opening',
      desc: 'Publish opening & start screening',
      icon: 'bi-plus-circle-fill',
      route: '/hr/recruitment-management',
      badge: 'Hiring'
    },
    {
      title: 'Review Requests',
      desc: '11 items awaiting HR approval',
      icon: 'bi-check-circle-fill',
      route: '/hr/requests-management',
      badge: 'Action req.'
    },
    {
      title: 'Run Monthly Payroll',
      desc: 'Review Oct disbursement list',
      icon: 'bi-wallet2',
      route: '/hr/payroll-management',
      badge: 'Payroll'
    },
    {
      title: 'New Announcement',
      desc: 'Post company or team notification',
      icon: 'bi-megaphone-fill',
      route: '/hr/announcements',
      badge: 'Broadcast'
    }
  ];

  ngOnInit(): void {}
}
