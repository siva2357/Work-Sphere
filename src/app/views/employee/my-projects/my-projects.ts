import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { AssignedProject } from '../../../core/models/task-project-team.interface';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';

export type { AssignedProject } from '../../../core/models/task-project-team.interface';

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

  // Real-time Projects Assigned to Employee from Backend Database
  projectsList: AssignedProject[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.http.get<any[]>(API_ENDPOINTS.WORKSPACE.PROJECTS).subscribe({
      next: (rows) => {
        this.projectsList = (rows || []).map((r, idx) => ({
          id: idx + 1,
          code: r.code || `PRJ-${idx + 101}`,
          title: r.name || r.title || 'Project',
          department: r.department || 'Engineering',
          category: r.category || 'Enterprise Platform',
          description: r.description || '',
          startDate: r.startDate ? new Date(r.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Jan 2026',
          endDate: r.endDate ? new Date(r.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '30 Nov 2026',
          duration: r.duration || '6 Months',
          status: (r.status === 'Active' ? 'In Progress' : (r.status || 'In Progress')) as AssignedProject['status'],
          role: r.role || r.managerName || 'Project Contributor',
          externalToolUrl: r.externalToolUrl || this.AGILE_TOOL_URL
        }));
      },
      error: () => {
        this.projectsList = [];
      }
    });
  }

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
