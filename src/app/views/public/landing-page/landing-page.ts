import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../../../library/UI/components/button/button';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  highlights = [
    { value: '99.9%', label: 'Platform Uptime', icon: 'bi-activity' },
    { value: '10+', label: 'Integrated Modules', icon: 'bi-grid-1x2-fill' },
    { value: '2-Tier', label: 'Role Portals (HR & Staff)', icon: 'bi-shield-lock-fill' },
    { value: 'Talent Hub', label: 'Connected ATS Ecosystem', icon: 'bi-link-45deg' },
  ];

  corePillars = [
    {
      icon: 'bi-diagram-3-fill',
      badge: 'Organization & RBAC',
      title: 'Smart Hierarchy & Role Routing',
      description:
        'Automatically maps employees across organizational levels (L1–L10 & H1–H6), departments, and designations with granular role-based access control.',
      points: ['Multi-department structure', 'Level & designation mapping', 'Dynamic sidebar & permissions'],
    },
    {
      icon: 'bi-funnel-fill',
      badge: 'Linked to Talent Hub',
      title: 'Recruitment & Talent Hub Sync',
      description:
        'Publish job openings from Work-Sphere directly to Talent Hub. Candidate applications sync back automatically into a 4-phase evaluation funnel.',
      points: ['Work-Sphere ↔ Talent Hub job sync', '4-Phase technical & HR evaluation', 'One-click candidate-to-employee onboarding'],
    },
    {
      icon: 'bi-calendar2-check-fill',
      badge: 'Time & Presence',
      title: 'Attendance & Leave Automation',
      description:
        'Real-time check-in/out tracking across in-office and remote teams, paired with streamlined leave applications and instant manager approvals.',
      points: ['Live attendance breakdown', 'Custom leave quotas & balances', 'One-click approval workflows'],
    },
    {
      icon: 'bi-kanban-fill',
      badge: 'Execution & Delivery',
      title: 'Projects, Tasks & Team Synergy',
      description:
        'Bridge HR data with daily execution. Create projects, assign tasks with priorities, and monitor sprint progress across cross-functional teams.',
      points: ['Project & team workspaces', 'Task status & priority tracking', 'Direct team member profiles'],
    },
    {
      icon: 'bi-cash-coin',
      badge: 'Compensation & Docs',
      title: 'Payroll & Official Document Engine',
      description:
        'Generate itemized monthly payslips, manage tax & allowance breakdowns, and issue verified HR letters and documents in seconds.',
      points: ['Automated salary computation', 'Downloadable PDF payslips', 'Official offer & experience letters'],
    },
    {
      icon: 'bi-inbox-fill',
      badge: 'Employee Service Desk',
      title: 'Unified Request & Announcement Hub',
      description:
        'Centralize IT, asset, and HR support requests while keeping everyone aligned through targeted company announcements.',
      points: ['SLA-backed request tracking', 'Company-wide broadcasts', 'Real-time notification feed'],
    },
  ];

  talentHubFlow = [
    {
      phase: 'Step 1 · Work-Sphere HR',
      title: 'Create & Publish Requisition',
      detail: 'Engineering Leads & TA Managers open a vacancy in Work-Sphere and publish it to Talent Hub.',
      icon: 'bi-briefcase-fill',
    },
    {
      phase: 'Step 2 · Talent Hub Portal',
      title: 'Candidate Discovery & Apply',
      detail: 'Candidates discover openings on Talent Hub and submit applications with resumes & portfolios.',
      icon: 'bi-globe2',
    },
    {
      phase: 'Step 3 · 4-Phase Funnel',
      title: 'Joint Technical & HR Evaluation',
      detail: 'Applications sync into Work-Sphere across Assessment, Technical Round, and Managerial + HR Interviews.',
      icon: 'bi-kanban-fill',
    },
    {
      phase: 'Step 4 · Auto-Onboarding',
      title: 'Offer Release & Employee Creation',
      detail: 'Hired candidates are converted into active Work-Sphere employees with corporate credentials in one click.',
      icon: 'bi-person-check-fill',
    },
  ];

  workflowSteps = [
    {
      step: '01',
      title: 'Configure Organization & Roles',
      desc: 'Define departments, organizational levels, and designations to mirror your enterprise structure.',
      icon: 'bi-building-gear',
    },
    {
      step: '02',
      title: 'Hire via Talent Hub & Onboard Teams',
      desc: 'Sync openings with Talent Hub, evaluate candidates across 4 phases, and onboard hires into project squads.',
      icon: 'bi-people-fill',
    },
    {
      step: '03',
      title: 'Automate Daily Operations',
      desc: 'Track attendance, approve leaves and requests, run monthly payroll, and monitor live KPIs.',
      icon: 'bi-rocket-takeoff-fill',
    },
  ];
}
