import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../../../library/UI/components/button/button';

export interface FeatureModuleItem {
  id: string;
  category: 'hr' | 'time-payroll' | 'projects';
  categoryLabel: string;
  title: string;
  subtitle: string;
  icon: string;
  roles: string[];
  highlights: string[];
}

@Component({
  selector: 'app-features-page',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './features-page.html',
  styleUrl: './features-page.css',
})
export class FeaturesPage {
  selectedCategory: 'all' | 'hr' | 'time-payroll' | 'projects' = 'all';

  categories: { key: 'all' | 'hr' | 'time-payroll' | 'projects'; label: string; icon: string }[] = [
    { key: 'all', label: 'All Capabilities', icon: 'bi-grid-fill' },
    { key: 'hr', label: 'HR, Governance & Talent Hub', icon: 'bi-diagram-3-fill' },
    { key: 'time-payroll', label: 'Attendance, Leave & Payroll', icon: 'bi-cash-stack' },
    { key: 'projects', label: 'Projects, Tasks & Service Desk', icon: 'bi-kanban-fill' },
  ];

  modules: FeatureModuleItem[] = [
    {
      id: 'recruitment',
      category: 'hr',
      categoryLabel: 'Linked to Talent Hub',
      title: 'Recruitment Management & Talent Hub Sync',
      subtitle: 'Post job vacancies in Work-Sphere and sync them with Talent Hub for external candidate discovery and 4-phase evaluation.',
      icon: 'bi-funnel-fill',
      roles: ['HR Admin', 'TA Manager', 'Tech Lead'],
      highlights: [
        'Publishes Work-Sphere job openings to Talent Hub career portal',
        '4-Phase pipeline (Assessment, Tech Round, HR/Manager Interview, Offer)',
        'One-click conversion from hired Talent Hub candidate to Employee',
      ],
    },
    {
      id: 'org-hierarchy',
      category: 'hr',
      categoryLabel: 'HR & Governance',
      title: 'Roles, Levels & Departments',
      subtitle: 'Model your exact organizational hierarchy from executive leadership (L1/H1) to individual contributors.',
      icon: 'bi-diagram-3-fill',
      roles: ['HR Admin'],
      highlights: [
        'Configurable organizational levels & designations',
        'Department-wise headcount & budget visibility',
        'Automatic RBAC permission mapping on login',
      ],
    },
    {
      id: 'employee-directory',
      category: 'hr',
      categoryLabel: 'HR & Governance',
      title: 'Enterprise Employee Directory',
      subtitle: 'Searchable, filterable personnel directory with rich profile cards and reporting lines.',
      icon: 'bi-people-fill',
      roles: ['HR Admin', 'Team Lead'],
      highlights: [
        'Instant search by department, role, or workspace status',
        'Bulk CSV onboarding & profile management',
        'Direct access to employee documents & history',
      ],
    },
    {
      id: 'attendance',
      category: 'time-payroll',
      categoryLabel: 'Time & Payroll',
      title: 'Smart Attendance & Presence',
      subtitle: 'Real-time check-in/out with support for in-office, remote, and hybrid schedules.',
      icon: 'bi-clock-history',
      roles: ['HR Admin', 'Employee'],
      highlights: [
        'One-click daily attendance marking with timestamps',
        'Live presence breakdown (Present, Remote, Late, Leave)',
        'Monthly attendance sheets & exportable logs',
      ],
    },
    {
      id: 'leaves',
      category: 'time-payroll',
      categoryLabel: 'Time & Payroll',
      title: 'Leave Management & Approvals',
      subtitle: 'Transparent leave balances, conflict-free calendars, and rapid manager approval workflows.',
      icon: 'bi-calendar2-check-fill',
      roles: ['HR Admin', 'Employee'],
      highlights: [
        'Categorized leave types (Casual, Sick, Earned, Unpaid)',
        'Real-time balance calculation before applying',
        'Instant status updates & approval audit trails',
      ],
    },
    {
      id: 'payroll-docs',
      category: 'time-payroll',
      categoryLabel: 'Time & Payroll',
      title: 'Payroll & Official Document Studio',
      subtitle: 'Compile monthly salaries, issue itemized payslips, and generate verified HR letters.',
      icon: 'bi-file-earmark-medical-fill',
      roles: ['HR Admin', 'Employee'],
      highlights: [
        'Automated earnings, deductions, and net pay calculation',
        'Formatted printable payslip & official letter templates',
        'Self-service document vault for every employee',
      ],
    },
    {
      id: 'project-task',
      category: 'projects',
      categoryLabel: 'Projects & Execution',
      title: 'Project & Task Management',
      subtitle: 'Plan deliverables, assign tasks with priority badges, and track execution velocity.',
      icon: 'bi-kanban-fill',
      roles: ['Employee', 'Team Lead'],
      highlights: [
        'Create projects with timelines, leads, and team members',
        'Granular task details, status transitions, and deadlines',
        'Personal "My Tasks" and "My Projects" focus views',
      ],
    },
    {
      id: 'team-management',
      category: 'projects',
      categoryLabel: 'Projects & Execution',
      title: 'Team Rosters & Member Profiles',
      subtitle: 'Give managers complete visibility into their direct reports, workload, and availability.',
      icon: 'bi-person-lines-fill',
      roles: ['Team Lead', 'Employee'],
      highlights: [
        'Dedicated team profile views & skill matrices',
        'Onboard new members directly into project squads',
        'Cross-department collaboration support',
      ],
    },
    {
      id: 'requests-announcements',
      category: 'projects',
      categoryLabel: 'Service Desk & Comms',
      title: 'Service Requests & Announcements',
      subtitle: 'Handle internal IT/HR requests and broadcast company-wide updates without email clutter.',
      icon: 'bi-megaphone-fill',
      roles: ['HR Admin', 'Employee'],
      highlights: [
        'Structured request tickets for hardware, access, or HR help',
        'Priority-tagged company announcements & alerts',
        'Real-time navbar notification dropdown',
      ],
    },
  ];

  comparisonRows = [
    { capability: 'External Career & Candidate Sync', legacy: 'Manual Resume Uploads', worksphere: 'Linked to Talent Hub (4-Phase ATS)' },
    { capability: 'Role-Based Automatic Workspace Routing', legacy: 'Manual URLs / Separate Apps', worksphere: 'Built-in JWT + RoleGuard' },
    { capability: 'Attendance to Payroll Sync', legacy: 'Manual CSV Exports', worksphere: 'Unified Real-Time Data Model' },
    { capability: 'Official Letters & Payslip Generation', legacy: 'Word Templates & Mail Merge', worksphere: 'Instant In-App Document Components' },
  ];

  get filteredModules(): FeatureModuleItem[] {
    if (this.selectedCategory === 'all') {
      return this.modules;
    }
    return this.modules.filter((m) => m.category === this.selectedCategory);
  }

  setCategory(cat: 'all' | 'hr' | 'time-payroll' | 'projects'): void {
    this.selectedCategory = cat;
  }
}
