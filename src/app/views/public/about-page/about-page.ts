import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../../../library/UI/components/button/button';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './about-page.html',
  styleUrl: './about-page.css',
})
export class AboutPage {
  values = [
    {
      icon: 'bi-shield-lock-fill',
      title: 'Role-First Clarity',
      description:
        'Every employee, team lead, and HR administrator sees a workspace tailored strictly to their organizational level and permissions.',
    },
    {
      icon: 'bi-lightning-charge-fill',
      title: 'Zero-Friction Operations',
      description:
        'Routine actions—like marking attendance, applying for leave, or generating a payslip—take seconds instead of email chains.',
    },
    {
      icon: 'bi-diagram-3-fill',
      title: 'Connected Hierarchy',
      description:
        'Departments, designations, and project teams stay synchronized so org charts and sprint boards always reflect reality.',
    },
    {
      icon: 'bi-lock-fill',
      title: 'Enterprise-Grade Trust',
      description:
        'Built with strict JWT authentication, route guards, and structured data contracts across both frontend and backend layers.',
    },
  ];

  milestones = [
    {
      year: 'Phase 1',
      title: 'Core Identity & RBAC Foundation',
      detail: 'Designed multi-level organizational hierarchy, department mapping, and JWT-guarded role routing.',
    },
    {
      year: 'Phase 2',
      title: 'Time, Attendance & Leave Engine',
      detail: 'Launched real-time attendance sheets, hybrid presence tracking, and multi-tier leave approval workflows.',
    },
    {
      year: 'Phase 3',
      title: 'Project, Task & Team Workspaces',
      detail: 'Integrated agile task boards, project creation, and team rosters directly alongside HR records.',
    },
    {
      year: 'Work-Sphere 2.0',
      title: 'Payroll, Official Letters & Recruitment',
      detail: 'Completed the full-stack suite with automated payslips, letter generation, and candidate pipeline tracking.',
    },
  ];

  architectureHighlights = [
    { label: 'Frontend Framework', value: 'Angular 20 Standalone Architecture', icon: 'bi-code-square' },
    { label: 'Design System', value: 'Emerald & Slate Enterprise UI + Bootstrap 5', icon: 'bi-palette2' },
    { label: 'Security & Access', value: 'JWT Interceptors + Role & Auth Guards', icon: 'bi-shield-check' },
    { label: 'Data Coverage', value: '100+ Sample Enterprise Personnel & Live APIs', icon: 'bi-database-check' },
  ];
}
