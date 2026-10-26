import { Injectable } from '@angular/core';

export interface ProjectMember {
  id: string; // e.g. EMP-0135
  name: string;
  role: string;
  department: string;
  avatarColor: string;
}

export interface ManagedProject {
  id: number;
  code: string; // e.g. PRJ-IT-101
  title: string;
  department: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: 'In Progress' | 'Planning' | 'Completed' | 'On Hold';
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  lead: ProjectMember;
  teamMembers: ProjectMember[];
  progressPercent: number;
  budget: string;
  methodology: 'Agile Scrum' | 'Kanban' | 'Waterfall' | 'Milestone';
  milestones: string[];
  externalToolUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly STORAGE_KEY = 'worksphere_managed_projects';

  readonly availableDepartments: string[] = [
    'Information Technology',
    'Product Engineering',
    'Data & Cloud Platform',
    'Product Design (UI/UX)',
    'Cybersecurity & IAM',
    'Human Resources Tech',
    'Finance & Payroll Ops',
  ];

  readonly availableCategories: string[] = [
    'Core Web Platform',
    'Cloud & DevOps',
    'Mobile Engineering',
    'Cybersecurity & IAM',
    'Data Platform & AI',
    'Enterprise Automation',
    'Design System & UX',
  ];

  readonly teamMembersList: ProjectMember[] = [
    {
      id: 'EMP-0135',
      name: 'Priya Patel',
      role: 'Lead Architect & Senior Engineer',
      department: 'Core Web Platform',
      avatarColor: '#10b981',
    },
    {
      id: 'EMP-0112',
      name: 'David Chen',
      role: 'Database & Infrastructure Lead',
      department: 'Data Platform',
      avatarColor: '#0ea5e9',
    },
    {
      id: 'EMP-0128',
      name: 'Alex Rivera',
      role: 'Lead UI/UX Designer',
      department: 'Product Design',
      avatarColor: '#8b5cf6',
    },
    {
      id: 'EMP-0142',
      name: 'Rohan Sharma',
      role: 'Full Stack Java Engineer',
      department: 'Platform Services',
      avatarColor: '#f59e0b',
    },
    {
      id: 'EMP-0150',
      name: 'Neha Sharma',
      role: 'QA Automation Lead',
      department: 'Quality Assurance',
      avatarColor: '#ec4899',
    },
    {
      id: 'EMP-0164',
      name: 'Vikram Malhotra',
      role: 'Mobile Applications Developer',
      department: 'Mobile Engineering',
      avatarColor: '#6366f1',
    },
    {
      id: 'EMP-0171',
      name: 'Sneha Reddy',
      role: 'Cloud & SecOps Specialist',
      department: 'Cybersecurity & IAM',
      avatarColor: '#14b8a6',
    },
  ];

  private readonly defaultProjects: ManagedProject[] = [
    {
      id: 1,
      code: 'PRJ-IT-101',
      title: 'WorkSphere Enterprise Core v2.4',
      department: 'Information Technology',
      category: 'Core Web Platform',
      description: 'Revamping enterprise HRM core architecture with Angular 17 standalone components, OAuth2 social SSO authentication, real-time activity sync, and microservices gateway integration.',
      startDate: '2026-01-15',
      endDate: '2026-11-30',
      duration: '10.5 Months',
      status: 'In Progress',
      priority: 'High',
      lead: {
        id: 'EMP-0135',
        name: 'Priya Patel',
        role: 'Lead Architect & Senior Engineer',
        department: 'Core Web Platform',
        avatarColor: '#10b981',
      },
      teamMembers: [
        { id: 'EMP-0128', name: 'Alex Rivera', role: 'UI/UX Lead', department: 'Design', avatarColor: '#8b5cf6' },
        { id: 'EMP-0142', name: 'Rohan Sharma', role: 'Full Stack Java', department: 'Backend', avatarColor: '#f59e0b' },
        { id: 'EMP-0150', name: 'Neha Sharma', role: 'QA Lead', department: 'QA', avatarColor: '#ec4899' },
      ],
      progressPercent: 72,
      budget: '$120,000',
      methodology: 'Agile Scrum',
      milestones: ['RFC Architecture Approval', 'Component Migration Phase 1', 'End-to-End Test Suite Signoff'],
      externalToolUrl: 'https://habit-tracker-lake-zeta.vercel.app/login',
    },
    {
      id: 2,
      code: 'PRJ-IT-102',
      title: 'Cloud Infrastructure Migration & Kubernetes Orchestration',
      department: 'Information Technology',
      category: 'Cloud & DevOps',
      description: 'Migrating legacy on-premise application clusters to AWS EKS with Terraform infrastructure-as-code, automated blue-green CI/CD pipelines, and Prometheus observability.',
      startDate: '2026-02-01',
      endDate: '2026-08-15',
      duration: '6.5 Months',
      status: 'In Progress',
      priority: 'Urgent',
      lead: {
        id: 'EMP-0112',
        name: 'David Chen',
        role: 'Database & Infrastructure Lead',
        department: 'Data Platform',
        avatarColor: '#0ea5e9',
      },
      teamMembers: [
        { id: 'EMP-0171', name: 'Sneha Reddy', role: 'Cloud SecOps', department: 'Security', avatarColor: '#14b8a6' },
        { id: 'EMP-0142', name: 'Rohan Sharma', role: 'Backend Engineer', department: 'Platform', avatarColor: '#f59e0b' },
      ],
      progressPercent: 58,
      budget: '$85,000',
      methodology: 'Kanban',
      milestones: ['Terraform VPC provisioning', 'EKS cluster hardening', 'Prometheus & Grafana alerting'],
      externalToolUrl: 'https://habit-tracker-lake-zeta.vercel.app/login',
    },
    {
      id: 3,
      code: 'PRJ-IT-103',
      title: 'Employee Self-Service Mobile Application',
      department: 'Product Engineering',
      category: 'Mobile Engineering',
      description: 'Cross-platform mobile application built using Flutter for biometric check-in/out, instant leave requests, mobile payslip viewing, and offline data synchronization.',
      startDate: '2026-03-10',
      endDate: '2026-12-20',
      duration: '9.5 Months',
      status: 'Planning',
      priority: 'High',
      lead: {
        id: 'EMP-0164',
        name: 'Vikram Malhotra',
        role: 'Mobile Applications Developer',
        department: 'Mobile Engineering',
        avatarColor: '#6366f1',
      },
      teamMembers: [
        { id: 'EMP-0128', name: 'Alex Rivera', role: 'Mobile UI/UX', department: 'Design', avatarColor: '#8b5cf6' },
        { id: 'EMP-0135', name: 'Priya Patel', role: 'API Consultant', department: 'Frontend', avatarColor: '#10b981' },
      ],
      progressPercent: 25,
      budget: '$95,000',
      methodology: 'Agile Scrum',
      milestones: ['Figma UX design complete', 'Biometric auth PoC', 'Offline SQLite caching layer'],
      externalToolUrl: 'https://habit-tracker-lake-zeta.vercel.app/login',
    },
    {
      id: 4,
      code: 'PRJ-IT-104',
      title: 'Enterprise Single Sign-On (SSO) & Zero-Trust Gateway',
      department: 'Cybersecurity & IAM',
      category: 'Cybersecurity & IAM',
      description: 'Implementation of Azure AD and Google Workspace OAuth2/SAML identity federation with role-based access control (RBAC) and automated session invalidation.',
      startDate: '2025-10-01',
      endDate: '2026-04-15',
      duration: '6.5 Months',
      status: 'Completed',
      priority: 'Urgent',
      lead: {
        id: 'EMP-0171',
        name: 'Sneha Reddy',
        role: 'Cloud & SecOps Specialist',
        department: 'Cybersecurity & IAM',
        avatarColor: '#14b8a6',
      },
      teamMembers: [
        { id: 'EMP-0112', name: 'David Chen', role: 'Infra Lead', department: 'Data', avatarColor: '#0ea5e9' },
        { id: 'EMP-0135', name: 'Priya Patel', role: 'Security Frontend', department: 'Core', avatarColor: '#10b981' },
      ],
      progressPercent: 100,
      budget: '$65,000',
      methodology: 'Milestone',
      milestones: ['SAML 2.0 Identity Provider Bridge', 'SOC2 Cryptographic Review', 'Global Rollout & Invalidation'],
      externalToolUrl: 'https://habit-tracker-lake-zeta.vercel.app/login',
    },
    {
      id: 5,
      code: 'PRJ-IT-105',
      title: 'Payroll Automation Engine & Tax Computation Service',
      department: 'Finance & Payroll Ops',
      category: 'Enterprise Automation',
      description: 'High-throughput microservice for monthly salary disbursement, automated tax deductions, direct bank wire generation, and instant employee payslips.',
      startDate: '2026-02-15',
      endDate: '2026-09-30',
      duration: '7.5 Months',
      status: 'In Progress',
      priority: 'High',
      lead: {
        id: 'EMP-0142',
        name: 'Rohan Sharma',
        role: 'Full Stack Java Engineer',
        department: 'Platform Services',
        avatarColor: '#f59e0b',
      },
      teamMembers: [
        { id: 'EMP-0112', name: 'David Chen', role: 'DB Architect', department: 'Data', avatarColor: '#0ea5e9' },
        { id: 'EMP-0150', name: 'Neha Sharma', role: 'QA Lead', department: 'QA', avatarColor: '#ec4899' },
      ],
      progressPercent: 68,
      budget: '$75,000',
      methodology: 'Agile Scrum',
      milestones: ['Tax calculation matrix engine', 'Direct bank payout simulator', 'PDF payslip generator'],
      externalToolUrl: 'https://habit-tracker-lake-zeta.vercel.app/login',
    },
    {
      id: 6,
      code: 'PRJ-IT-106',
      title: 'AI Candidate Screening & Recruitment Pipeline',
      department: 'Human Resources Tech',
      category: 'Data Platform & AI',
      description: 'Intelligent resume parsing, automated interview scheduling bot, interviewer feedback aggregation, and candidate onboarding dashboard.',
      startDate: '2026-04-01',
      endDate: '2026-12-15',
      duration: '8.5 Months',
      status: 'Planning',
      priority: 'Medium',
      lead: {
        id: 'EMP-0128',
        name: 'Alex Rivera',
        role: 'Lead UI/UX Designer',
        department: 'Product Design',
        avatarColor: '#8b5cf6',
      },
      teamMembers: [
        { id: 'EMP-0150', name: 'Neha Sharma', role: 'QA Automation', department: 'QA', avatarColor: '#ec4899' },
        { id: 'EMP-0135', name: 'Priya Patel', role: 'Frontend Lead', department: 'Core', avatarColor: '#10b981' },
      ],
      progressPercent: 15,
      budget: '$50,000',
      methodology: 'Agile Scrum',
      milestones: ['Candidate journey map', 'Resume parser webhook PoC', 'Interviewer grading modal'],
      externalToolUrl: 'https://habit-tracker-lake-zeta.vercel.app/login',
    },
  ];

  private projects: ManagedProject[] = [];

  constructor() {
    this.loadProjects();
  }

  private loadProjects(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          this.projects = JSON.parse(stored);
          return;
        } catch {
          // fallback to defaults
        }
      }
    }
    this.projects = [...this.defaultProjects];
    this.saveProjects();
  }

  private saveProjects(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.projects));
      } catch (err) {
        console.error('Failed to save projects to localStorage', err);
      }
    }
  }

  getProjects(): ManagedProject[] {
    return [...this.projects];
  }

  addProject(data: {
    title: string;
    department: string;
    category: string;
    description: string;
    startDate: string;
    endDate: string;
    leadId: string;
    priority: 'Urgent' | 'High' | 'Medium' | 'Low';
    methodology: 'Agile Scrum' | 'Kanban' | 'Waterfall' | 'Milestone';
    budget?: string;
    teamMemberIds?: string[];
    milestones?: string[];
    externalToolUrl?: string;
  }): ManagedProject {
    const nextId = this.projects.length + 1;
    const nextCode = `PRJ-IT-${100 + nextId}`;

    const lead =
      this.teamMembersList.find((m) => m.id === data.leadId) ||
      this.teamMembersList[0];

    const team = (data.teamMemberIds || [])
      .map((id) => this.teamMembersList.find((m) => m.id === id))
      .filter((m): m is ProjectMember => !!m);

    // Calculate approximate duration
    let duration = '6.0 Months';
    if (data.startDate && data.endDate) {
      const s = new Date(data.startDate).getTime();
      const e = new Date(data.endDate).getTime();
      const diffMonths = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24 * 30)));
      duration = `${diffMonths} Months`;
    }

    const newProject: ManagedProject = {
      id: nextId,
      code: nextCode,
      title: data.title.trim(),
      department: data.department || 'Information Technology',
      category: data.category || 'General',
      description: data.description.trim(),
      startDate: data.startDate,
      endDate: data.endDate,
      duration: duration,
      status: 'In Progress',
      priority: data.priority || 'Medium',
      lead: lead,
      teamMembers: team.length > 0 ? team : [lead],
      progressPercent: 10,
      budget: data.budget ? `$${data.budget.replace(/[^0-9]/g, '')}` : '$50,000',
      methodology: data.methodology || 'Agile Scrum',
      milestones: data.milestones && data.milestones.length > 0 ? data.milestones : ['Project Kickoff & Architecture RFC'],
      externalToolUrl: data.externalToolUrl || 'https://habit-tracker-lake-zeta.vercel.app/login',
    };

    this.projects.unshift(newProject);
    this.saveProjects();
    return newProject;
  }

  updateProjectStatus(id: number, status: ManagedProject['status']): void {
    const prj = this.projects.find((p) => p.id === id);
    if (prj) {
      prj.status = status;
      if (status === 'Completed') prj.progressPercent = 100;
      else if (status === 'Planning') prj.progressPercent = 15;
      else if (status === 'In Progress' && prj.progressPercent === 0) prj.progressPercent = 35;
      this.saveProjects();
    }
  }

  deleteProject(id: number): void {
    this.projects = this.projects.filter((p) => p.id !== id);
    this.saveProjects();
  }

  resetToDefaults(): void {
    this.projects = [...this.defaultProjects];
    this.saveProjects();
  }
}
