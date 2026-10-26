import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

export interface AssignedProject {
  id: number;
  code: string;
  title: string;
  department: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: 'In Progress' | 'Active' | 'Planning' | 'Completed' | 'On Hold';
  role: string;
  externalToolUrl: string;
}

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-projects.html',
  styleUrl: './my-projects.css',
})
export class MyProjects implements OnInit {
  // External Agile Tool URL
  readonly AGILE_TOOL_URL = 'https://habit-tracker-lake-zeta.vercel.app/login';

  // Search & Filter State
  searchQuery: string = '';
  selectedStatus: string = 'All';

  // Toast Notification
  toastMessage: string = '';
  private toastTimer: any;

  // Hardcoded IT Department Projects Assigned to Employee
  projectsList: AssignedProject[] = [
    {
      id: 1,
      code: 'PRJ-IT-101',
      title: 'WorkSphere Enterprise Core v2.4',
      department: 'Information Technology',
      category: 'Core Web Platform',
      description: 'Revamping enterprise HRM core architecture with Angular 17 standalone components, OAuth2 social SSO authentication, real-time activity sync, and microservices gateway integration.',
      startDate: '15 Jan 2026',
      endDate: '30 Nov 2026',
      duration: '10.5 Months',
      status: 'In Progress',
      role: 'Lead Full Stack Engineer',
      externalToolUrl: 'https://habit-tracker-lake-zeta.vercel.app/login'
    },
    {
      id: 2,
      code: 'PRJ-IT-102',
      title: 'Cloud Infrastructure Migration & Kubernetes Orchestration',
      department: 'Information Technology',
      category: 'Cloud & DevOps',
      description: 'Migrating legacy on-premise application clusters to AWS EKS with Terraform infrastructure-as-code, automated blue-green CI/CD pipelines, and Prometheus observability.',
      startDate: '01 Feb 2026',
      endDate: '15 Aug 2026',
      duration: '6.5 Months',
      status: 'In Progress',
      role: 'DevOps & Cloud Engineer',
      externalToolUrl: 'https://habit-tracker-lake-zeta.vercel.app/login'
    },
    {
      id: 3,
      code: 'PRJ-IT-103',
      title: 'Employee Self-Service Mobile Application',
      department: 'Information Technology',
      category: 'Mobile Engineering',
      description: 'Cross-platform mobile application built using Flutter for biometric check-in/out, instant leave requests, mobile payslip viewing, and offline data synchronization.',
      startDate: '10 Mar 2026',
      endDate: '20 Dec 2026',
      duration: '9.5 Months',
      status: 'Planning',
      role: 'Mobile UI/UX Developer',
      externalToolUrl: 'https://habit-tracker-lake-zeta.vercel.app/login'
    },
    {
      id: 4,
      code: 'PRJ-IT-104',
      title: 'Enterprise Single Sign-On (SSO) & Zero-Trust Gateway',
      department: 'Information Technology',
      category: 'Cybersecurity & IAM',
      description: 'Implementation of Azure AD and Google Workspace OAuth2/SAML identity federation with role-based access control (RBAC) and automated session invalidation.',
      startDate: '01 Oct 2025',
      endDate: '15 Apr 2026',
      duration: '6.5 Months',
      status: 'Completed',
      role: 'Security & Auth Specialist',
      externalToolUrl: 'https://habit-tracker-lake-zeta.vercel.app/login'
    }
  ];

  ngOnInit(): void { }

  // Filtered Projects Getter
  get filteredProjects(): AssignedProject[] {
    return this.projectsList.filter((project) => {
      const matchesSearch =
        !this.searchQuery.trim() ||
        project.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        project.code.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        project.category.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus =
        this.selectedStatus === 'All' || project.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  // Stat Counters
  get totalProjectsCount(): number {
    return this.projectsList.length;
  }

  get inProgressCount(): number {
    return this.projectsList.filter((p) => p.status === 'In Progress').length;
  }

  get activeCount(): number {
    return this.projectsList.filter((p) => p.status === 'Active').length;
  }

  get planningCount(): number {
    return this.projectsList.filter((p) => p.status === 'Planning').length;
  }

  get completedCount(): number {
    return this.projectsList.filter((p) => p.status === 'Completed').length;
  }

  // Status Filter Setter
  setStatusFilter(status: string): void {
    this.selectedStatus = status;
  }

  // Reset Filters
  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'All';
    this.showToast('Projects view refreshed.');
  }

  // Open External Agile Management Tool
  openAgileTool(project?: AssignedProject): void {
    const url = project?.externalToolUrl || this.AGILE_TOOL_URL;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // Status Badge Helper
  getStatusClass(status: string): string {
    switch (status) {
      case 'In Progress':
        return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'Active':
        return 'bg-emerald-subtle text-emerald border border-emerald-subtle';
      case 'Planning':
        return 'bg-warning-subtle text-warning border border-warning-subtle';
      case 'Completed':
        return 'bg-success-subtle text-success border border-success-subtle';
      default:
        return 'bg-secondary-subtle text-secondary border border-secondary-subtle';
    }
  }

  // Status Dot Color Helper
  getStatusDotClass(status: string): string {
    switch (status) {
      case 'In Progress':
        return 'text-primary';
      case 'Active':
        return 'text-emerald';
      case 'Planning':
        return 'text-warning';
      case 'Completed':
        return 'text-success';
      default:
        return 'text-secondary';
    }
  }

  // Toast Helper
  showToast(message: string): void {
    this.toastMessage = message;
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
    }, 3500);
  }
}
