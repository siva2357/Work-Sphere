import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProjectService, ManagedProject } from '../../../core/services/project.service';

@Component({
  selector: 'app-project-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './project-management.html',
  styleUrl: './project-management.css',
})
export class ProjectManagement implements OnInit {
  projects: ManagedProject[] = [];

  // Filter & Search Controls
  searchQuery: string = '';
  selectedStatus: string = 'ALL';
  selectedDepartment: string = 'ALL';
  selectedPriority: string = 'ALL';
  selectedSort: string = 'dueDateAsc';

  // Available options
  departments: string[] = [];

  // Notification Toast
  actionToastMessage: string = '';
  private toastTimer: any;

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.departments = this.projectService.availableDepartments;
    this.loadProjects();
  }

  loadProjects(): void {
    this.projects = this.projectService.getProjects();
  }

  // Filtered Projects Getter
  get filteredProjects(): ManagedProject[] {
    let result = [...this.projects];

    // 1. Status Filter
    if (this.selectedStatus !== 'ALL') {
      result = result.filter((p) => p.status === this.selectedStatus);
    }

    // 2. Department Filter
    if (this.selectedDepartment !== 'ALL') {
      result = result.filter((p) => p.department === this.selectedDepartment);
    }

    // 3. Priority Filter
    if (this.selectedPriority !== 'ALL') {
      result = result.filter((p) => p.priority === this.selectedPriority);
    }

    // 4. Search Query (Code, Title, Description, Category, Lead name)
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.code.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.lead.name.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q)
      );
    }

    // 5. Sorting
    result.sort((a, b) => {
      if (this.selectedSort === 'dueDateAsc') {
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      }
      if (this.selectedSort === 'dueDateDesc') {
        return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
      }
      if (this.selectedSort === 'progressDesc') {
        return b.progressPercent - a.progressPercent;
      }
      if (this.selectedSort === 'priority') {
        const order: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return (order[b.priority] || 0) - (order[a.priority] || 0);
      }
      return 0;
    });

    return result;
  }

  // Metrics
  get totalProjectsCount(): number {
    return this.projects.length;
  }

  get inProgressCount(): number {
    return this.projects.filter((p) => p.status === 'In Progress').length;
  }

  get planningCount(): number {
    return this.projects.filter((p) => p.status === 'Planning').length;
  }

  get completedCount(): number {
    return this.projects.filter((p) => p.status === 'Completed').length;
  }

  // Filter actions
  setStatusFilter(status: string): void {
    this.selectedStatus = status;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedDepartment = 'ALL';
    this.selectedPriority = 'ALL';
    this.selectedSort = 'dueDateAsc';
    this.loadProjects();
    this.showToast('Project filters reset successfully.');
  }

  // Status Change
  changeProjectStatus(project: ManagedProject, newStatus: ManagedProject['status'], event?: Event): void {
    if (event) event.stopPropagation();
    this.projectService.updateProjectStatus(project.id, newStatus);
    this.loadProjects();
    this.showToast(`Project "${project.code}" marked as ${newStatus}.`);
  }

  // Delete Project
  deleteProject(project: ManagedProject, event?: Event): void {
    if (event) event.stopPropagation();
    const confirmed = confirm(`Are you sure you want to delete project ${project.code}: "${project.title}"?`);
    if (confirmed) {
      this.projectService.deleteProject(project.id);
      this.loadProjects();
      this.showToast(`Project ${project.code} removed.`);
    }
  }

  // Helper Badge Classes
  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Urgent':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'High':
        return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'Medium':
        return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'Low':
        return 'bg-light text-secondary border border-light-subtle';
      default:
        return 'bg-light text-dark';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'In Progress':
        return 'bg-emerald-subtle text-emerald border border-emerald-subtle';
      case 'Planning':
        return 'bg-info-subtle text-info-emphasis border border-info-subtle';
      case 'Completed':
        return 'bg-success-subtle text-success border border-success-subtle';
      case 'On Hold':
        return 'bg-secondary-subtle text-secondary border border-secondary-subtle';
      default:
        return 'bg-light text-dark';
    }
  }

  getProgressColorClass(percent: number): string {
    if (percent >= 80) return 'bg-emerald';
    if (percent >= 40) return 'bg-primary';
    return 'bg-warning';
  }

  getInitials(name?: string): string {
    if (!name) return 'WS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  private showToast(message: string): void {
    this.actionToastMessage = message;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.actionToastMessage = '';
    }, 3500);
  }
}
