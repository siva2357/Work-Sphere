import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface AssignedTask {
  sNo: number;
  id: string;
  title: string;
  project: string;
  description: string;
  assignedBy: {
    name: string;
    employeeId: string;
    role: string;
    department: string;
    email: string;
  };
  assignedDate: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  estimatedHours: number;
  loggedHours: number;
  progressPercent: number;
  subtasksCount: number;
  completedSubtasksCount: number;
}

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './my-tasks.html',
  styleUrl: './my-tasks.css',
})
export class MyTasks {
  // Search & Filter State
  searchQuery: string = '';
  selectedStatus: string = 'ALL';
  selectedPriority: string = 'ALL';
  selectedSort: 'dueDateAsc' | 'dueDateDesc' | 'priority' | 'recentlyAssigned' = 'dueDateAsc';

  // Notification Toast
  actionToastMessage: string = '';
  private toastTimer: any;

  // Hardcoded Tasks Data (Assigned to employee by managers)
  tasksList: AssignedTask[] = [
    {
      sNo: 1,
      id: 'TSK-1041',
      title: 'Implement OAuth2 Social Authentication & Session Invalidation',
      project: 'WorkSphere Core v2.4',
      description: 'Integrate Google and Microsoft 365 OAuth2 single sign-on flows with secure session invalidation and token refresh mechanism.',
      assignedBy: {
        name: 'Sarah Jenkins',
        employeeId: 'EMP-0104',
        role: 'Engineering Lead & Project Manager',
        department: 'Core Architecture',
        email: 'sarah.jenkins@worksphere.io'
      },
      assignedDate: '18 Oct 2026',
      dueDate: '28 Oct 2026',
      status: 'In Progress',
      priority: 'High',
      estimatedHours: 28,
      loggedHours: 18.5,
      progressPercent: 65,
      subtasksCount: 5,
      completedSubtasksCount: 3
    },
    {
      sNo: 2,
      id: 'TSK-1042',
      title: 'Optimize Employee Leave Balance Aggregation Query',
      project: 'WorkSphere HR Suite',
      description: 'Refactor SQL database index strategy and query builder for employee attendance and monthly leave calculation.',
      assignedBy: {
        name: 'David Chen',
        employeeId: 'EMP-0112',
        role: 'Database & Infrastructure Lead',
        department: 'Data Platform',
        email: 'david.chen@worksphere.io'
      },
      assignedDate: '19 Oct 2026',
      dueDate: '25 Oct 2026',
      status: 'Pending',
      priority: 'Urgent',
      estimatedHours: 16,
      loggedHours: 0,
      progressPercent: 0,
      subtasksCount: 4,
      completedSubtasksCount: 0
    },
    {
      sNo: 3,
      id: 'TSK-1043',
      title: 'Design & Code Responsive Payslip PDF Generator',
      project: 'Payroll Automation Engine',
      description: 'Develop dynamic PDF rendering template with employee deductions, gross pay, tax deductions, and company seal.',
      assignedBy: {
        name: 'Sarah Jenkins',
        employeeId: 'EMP-0104',
        role: 'Engineering Lead & Project Manager',
        department: 'Core Architecture',
        email: 'sarah.jenkins@worksphere.io'
      },
      assignedDate: '15 Oct 2026',
      dueDate: '22 Oct 2026',
      status: 'Completed',
      priority: 'High',
      estimatedHours: 20,
      loggedHours: 19.5,
      progressPercent: 100,
      subtasksCount: 4,
      completedSubtasksCount: 4
    },
    {
      sNo: 4,
      id: 'TSK-1044',
      title: 'Update Mobile Viewport Breakpoints on Employee Attendance Table',
      project: 'WorkSphere Mobile Web',
      description: 'Refactor horizontal table scroll and stacked card display for screens under 768px width.',
      assignedBy: {
        name: 'Alex Rivera',
        employeeId: 'EMP-0128',
        role: 'Lead UI/UX Designer',
        department: 'Product Design',
        email: 'alex.rivera@worksphere.io'
      },
      assignedDate: '20 Oct 2026',
      dueDate: '27 Oct 2026',
      status: 'In Progress',
      priority: 'Medium',
      estimatedHours: 14,
      loggedHours: 8,
      progressPercent: 55,
      subtasksCount: 4,
      completedSubtasksCount: 2
    },
    {
      sNo: 5,
      id: 'TSK-1045',
      title: 'Implement Notification Webhook for Document Expiry Warnings',
      project: 'WorkSphere Compliance',
      description: 'Create scheduled worker to alert employees 30 days and 7 days prior to visa or passport expiry.',
      assignedBy: {
        name: 'Sarah Jenkins',
        employeeId: 'EMP-0104',
        role: 'Engineering Lead & Project Manager',
        department: 'Core Architecture',
        email: 'sarah.jenkins@worksphere.io'
      },
      assignedDate: '21 Oct 2026',
      dueDate: '30 Oct 2026',
      status: 'Pending',
      priority: 'Medium',
      estimatedHours: 18,
      loggedHours: 0,
      progressPercent: 0,
      subtasksCount: 4,
      completedSubtasksCount: 0
    },
    {
      sNo: 6,
      id: 'TSK-1046',
      title: 'Fix Safari Rendering Bug with Glassmorphism Backdrop Blur',
      project: 'WorkSphere Design System',
      description: 'Resolve CSS vendor prefixing issue where backdrop-filter blur causes flicker on iOS WebKit.',
      assignedBy: {
        name: 'Alex Rivera',
        employeeId: 'EMP-0128',
        role: 'Lead UI/UX Designer',
        department: 'Product Design',
        email: 'alex.rivera@worksphere.io'
      },
      assignedDate: '14 Oct 2026',
      dueDate: '19 Oct 2026',
      status: 'Completed',
      priority: 'Low',
      estimatedHours: 6,
      loggedHours: 5,
      progressPercent: 100,
      subtasksCount: 3,
      completedSubtasksCount: 3
    },
    {
      sNo: 7,
      id: 'TSK-1047',
      title: 'Audit & Patch Dependencies for Annual Security Compliance',
      project: 'WorkSphere SecOps',
      description: 'Run npm audit and update deprecated third-party packages to adhere to SOC2 Type II standards.',
      assignedBy: {
        name: 'David Chen',
        employeeId: 'EMP-0112',
        role: 'Database & Infrastructure Lead',
        department: 'Data Platform',
        email: 'david.chen@worksphere.io'
      },
      assignedDate: '17 Oct 2026',
      dueDate: '24 Oct 2026',
      status: 'In Progress',
      priority: 'High',
      estimatedHours: 12,
      loggedHours: 9,
      progressPercent: 75,
      subtasksCount: 4,
      completedSubtasksCount: 3
    },
    {
      sNo: 8,
      id: 'TSK-1048',
      title: 'Build Dark Mode Theme Toggle for Code Editor Snippet Viewer',
      project: 'Developer Portal',
      description: 'Add syntax highlighter theme switcher between GitHub Light and One Dark Pro for documentation.',
      assignedBy: {
        name: 'Sarah Jenkins',
        employeeId: 'EMP-0104',
        role: 'Engineering Lead & Project Manager',
        department: 'Core Architecture',
        email: 'sarah.jenkins@worksphere.io'
      },
      assignedDate: '10 Oct 2026',
      dueDate: '16 Oct 2026',
      status: 'Completed',
      priority: 'Low',
      estimatedHours: 10,
      loggedHours: 8.5,
      progressPercent: 100,
      subtasksCount: 3,
      completedSubtasksCount: 3
    }
  ];

  // --- Statistics Computed Properties ---
  get totalAssignedCount(): number {
    return this.tasksList.length;
  }

  get pendingCount(): number {
    return this.tasksList.filter((t) => t.status === 'Pending').length;
  }

  get inProgressCount(): number {
    return this.tasksList.filter((t) => t.status === 'In Progress').length;
  }

  get completedCount(): number {
    return this.tasksList.filter((t) => t.status === 'Completed').length;
  }

  // --- Filtered and Sorted Tasks ---
  get filteredTasks(): AssignedTask[] {
    let result = [...this.tasksList];

    // Status Filter
    if (this.selectedStatus !== 'ALL') {
      result = result.filter((t) => t.status === this.selectedStatus);
    }

    // Priority Filter
    if (this.selectedPriority !== 'ALL') {
      result = result.filter((t) => t.priority === this.selectedPriority);
    }

    // Search Query Filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.project.toLowerCase().includes(q) ||
          t.assignedBy.name.toLowerCase().includes(q) ||
          t.assignedBy.employeeId.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (this.selectedSort === 'priority') {
        const priorityOrder: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      } else if (this.selectedSort === 'recentlyAssigned') {
        return new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime();
      } else if (this.selectedSort === 'dueDateDesc') {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else {
        // dueDateAsc (Default)
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
    });

    return result;
  }

  // Quick Status Transition from Table
  changeTaskStatus(task: AssignedTask, newStatus: 'Pending' | 'In Progress' | 'Completed', event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    task.status = newStatus;
    if (newStatus === 'Completed') {
      task.progressPercent = 100;
      task.completedSubtasksCount = task.subtasksCount;
    } else if (newStatus === 'Pending') {
      task.progressPercent = 0;
      task.completedSubtasksCount = 0;
    } else if (newStatus === 'In Progress' && task.progressPercent === 0) {
      task.progressPercent = 25;
    }
    this.showToast(`Task ${task.id} updated to "${newStatus}"`);
  }

  setStatusFilter(status: string): void {
    this.selectedStatus = status;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedPriority = 'ALL';
    this.selectedSort = 'dueDateAsc';
  }

  showToast(msg: string): void {
    this.actionToastMessage = msg;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.actionToastMessage = '';
    }, 3500);
  }

  // Priority styling helper
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

  // Status styling helper
  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-subtle text-emerald border border-emerald-subtle';
      case 'In Progress':
        return 'bg-info-subtle text-info-emphasis border border-info-subtle';
      case 'Pending':
        return 'bg-warning-subtle text-warning border border-warning-subtle';
      default:
        return 'bg-light text-dark';
    }
  }

  // Subtask completion ratio text
  getSubtaskProgress(task: AssignedTask): string {
    return `${task.completedSubtasksCount}/${task.subtasksCount}`;
  }
}
