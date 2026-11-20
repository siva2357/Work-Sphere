import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';

import { TaskService } from '../../../core/services/task.service';
import { AssignedTask } from '../../../core/models/task-project-team.interface';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { StatCards, StatMetric } from '../../../library/shared/components/stat-cards/stat-cards';
import {
  Badge,
  BadgeVariant,
  Button,
  Chip,
  InputDropdownOption,
  InputField,
  Pagination,
  Table,
  TableColumn,
  Toaster,
  ToasterService,
} from '../../../library/UI/components';

export type { AssignedTask } from '../../../core/models/task-project-team.interface';

export interface TaskFilterChip {
  key: 'search' | 'status' | 'priority' | 'sort';
  label: string;
  icon: string;
}

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    StatCards,
    Button,
    InputField,
    Badge,
    Chip,
    Table,
    Pagination,
    Toaster,
  ],
  templateUrl: './my-tasks.html',
  styleUrl: './my-tasks.css',
})
export class MyTasks implements OnInit {
  private http = inject(HttpClient);
  private taskService = inject(TaskService);
  private toaster = inject(ToasterService);

  @ViewChild('taskIdTpl', { static: true }) taskIdTpl!: TemplateRef<any>;
  @ViewChild('taskTitleTpl', { static: true }) taskTitleTpl!: TemplateRef<any>;
  @ViewChild('taskDescTpl', { static: true }) taskDescTpl!: TemplateRef<any>;
  @ViewChild('assignedByTpl', { static: true }) assignedByTpl!: TemplateRef<any>;
  @ViewChild('dueDateTpl', { static: true }) dueDateTpl!: TemplateRef<any>;
  @ViewChild('priorityTpl', { static: true }) priorityTpl!: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;

  tableColumns: TableColumn[] = [];
  isLoadingTasks = false;

  // Draft Filter Inputs (bound to <app-input-field>)
  draftSearchQuery = '';
  draftStatus = 'ALL';
  draftPriority = 'ALL';
  draftSort: 'dueDateAsc' | 'dueDateDesc' | 'priority' | 'recentlyAssigned' = 'dueDateAsc';

  // Applied Filter State
  searchQuery = '';
  selectedStatus = 'ALL';
  selectedPriority = 'ALL';
  selectedSort: 'dueDateAsc' | 'dueDateDesc' | 'priority' | 'recentlyAssigned' = 'dueDateAsc';

  // Pagination State
  currentPage = 1;
  pageSize = 10;
  effectiveCurrentPage = 1;

  readonly statusFilterOptions: InputDropdownOption[] = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Pending', value: 'Pending' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' },
  ];

  readonly priorityFilterOptions: InputDropdownOption[] = [
    { label: 'All Priorities', value: 'ALL' },
    { label: 'Urgent Priority', value: 'Urgent' },
    { label: 'High Priority', value: 'High' },
    { label: 'Medium Priority', value: 'Medium' },
    { label: 'Low Priority', value: 'Low' },
  ];

  readonly sortFilterOptions: InputDropdownOption[] = [
    { label: 'Due Date: Earliest First', value: 'dueDateAsc' },
    { label: 'Due Date: Latest First', value: 'dueDateDesc' },
    { label: 'Priority: Highest First', value: 'priority' },
    { label: 'Assigned: Most Recent', value: 'recentlyAssigned' },
  ];

  // Real-time Tasks Data & Cached View State
  tasksList: AssignedTask[] = [];
  filteredTasks: AssignedTask[] = [];
  paginatedTasks: AssignedTask[] = [];
  statCards: StatMetric[] = [];
  activeFilterChips: TaskFilterChip[] = [];

  totalAssignedCount = 0;
  pendingCount = 0;
  inProgressCount = 0;
  completedCount = 0;

  ngOnInit(): void {
    this.initTableColumns();
    this.updateTasksView();
    this.loadTasks();
  }

  private initTableColumns(): void {
    this.tableColumns = [
      {
        field: 'sNo',
        headerName: 'S.No.',
        width: 70,
      },
      {
        field: 'id',
        headerName: 'Task ID',
        cellTemplate: this.taskIdTpl,
        width: 115,
      },
      {
        field: 'title',
        headerName: 'Task Title',
        cellTemplate: this.taskTitleTpl,
        width: 240,
      },
      {
        field: 'description',
        headerName: 'Description',
        cellTemplate: this.taskDescTpl,
        width: 260,
      },
      {
        field: 'assignedBy',
        headerName: 'Assigned By',
        cellTemplate: this.assignedByTpl,
        width: 185,
      },
      {
        field: 'dueDate',
        headerName: 'Due Date',
        cellTemplate: this.dueDateTpl,
        width: 135,
      },
      {
        field: 'priority',
        headerName: 'Priority',
        cellTemplate: this.priorityTpl,
        width: 115,
      },
      {
        field: 'status',
        headerName: 'Status',
        cellTemplate: this.statusTpl,
        width: 135,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        cellTemplate: this.actionsTpl,
        width: 90,
      },
    ];
  }

  loadTasks(): void {
    this.isLoadingTasks = true;
    this.http
      .get<any[]>(API_ENDPOINTS.TASKS.BASE)
      .pipe(finalize(() => (this.isLoadingTasks = false)))
      .subscribe({
        next: (rows) => {
          this.tasksList = (rows || []).map((t, idx) => ({
            sNo: idx + 1,
            id: t.id || `TSK-${1040 + idx + 1}`,
            title: t.title || 'Task',
            project: t.project || 'WorkSphere Enterprise',
            description: t.description || '',
            assignedBy: {
              name: t.assignedByName || t.assignedBy?.name || 'Department Lead',
              employeeId: t.assignedById || t.assignedBy?.employeeId || 'EMP-100',
              role: t.assignedByRole || t.assignedBy?.role || 'Manager',
              department: t.department || t.assignedBy?.department || 'Engineering',
              email: t.assignedByEmail || t.assignedBy?.email || '',
            },
            assignedDate:
              t.assignedDate ||
              new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }),
            dueDate:
              t.dueDate ||
              new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }),
            status: (t.status || 'Pending') as AssignedTask['status'],
            priority: (t.priority || 'Medium') as AssignedTask['priority'],
            estimatedHours: Number(t.estimatedHours ?? 8),
            loggedHours: Number(t.loggedHours ?? 0),
            progressPercent: Number(
              t.progressPercent ??
                (t.status === 'Completed' ? 100 : t.status === 'In Progress' ? 50 : 0)
            ),
            subtasksCount: Number(t.subtasksCount ?? 4),
            completedSubtasksCount: Number(
              t.completedSubtasksCount ??
                (t.status === 'Completed' ? 4 : t.status === 'In Progress' ? 2 : 0)
            ),
          }));
          this.updateTasksView();
        },
        error: () => {
          this.tasksList = [];
          this.updateTasksView();
        },
      });
  }

  private updateTasksView(): void {
    this.totalAssignedCount = this.tasksList.length;
    this.pendingCount = this.tasksList.filter((t) => t.status === 'Pending').length;
    this.inProgressCount = this.tasksList.filter((t) => t.status === 'In Progress').length;
    this.completedCount = this.tasksList.filter((t) => t.status === 'Completed').length;

    this.statCards = [
      {
        title: 'Tasks Assigned',
        value: `${this.totalAssignedCount} Total`,
        subtitle: 'Across all active projects',
        badgeText: 'Assigned',
        badgeType: 'emerald',
        icon: 'bi-clipboard-data',
      },
      {
        title: 'Tasks Pending',
        value: `${this.pendingCount} Pending`,
        subtitle: 'Awaiting start / action',
        badgeText: 'Queue',
        badgeType: 'warning',
        icon: 'bi-hourglass-split',
      },
      {
        title: 'Tasks In Progress',
        value: `${this.inProgressCount} Active`,
        subtitle: 'Currently in development',
        badgeText: 'In Progress',
        badgeType: 'info',
        icon: 'bi-arrow-repeat',
      },
      {
        title: 'Tasks Completed',
        value: `${this.completedCount} Done`,
        subtitle: 'Successfully verified',
        badgeText: 'Completed',
        badgeType: 'success',
        icon: 'bi-check2-circle',
      },
    ];

    let result = [...this.tasksList];

    if (this.selectedStatus !== 'ALL') {
      result = result.filter((t) => t.status === this.selectedStatus);
    }

    if (this.selectedPriority !== 'ALL') {
      result = result.filter((t) => t.priority === this.selectedPriority);
    }

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

    result.sort((a, b) => {
      if (this.selectedSort === 'priority') {
        const priorityOrder: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      } else if (this.selectedSort === 'recentlyAssigned') {
        return new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime();
      } else if (this.selectedSort === 'dueDateDesc') {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
    });

    this.filteredTasks = result;

    const totalPages = Math.max(1, Math.ceil(this.filteredTasks.length / this.pageSize));
    this.effectiveCurrentPage = Math.min(Math.max(1, this.currentPage), totalPages);
    const start = (this.effectiveCurrentPage - 1) * this.pageSize;
    this.paginatedTasks = this.filteredTasks
      .slice(start, start + this.pageSize)
      .map((task, idx) => ({
        ...task,
        sNo: start + idx + 1,
      }));

    const chips: TaskFilterChip[] = [];
    if (this.searchQuery.trim()) {
      chips.push({
        key: 'search',
        label: `Search: "${this.searchQuery.trim()}"`,
        icon: 'bi-search',
      });
    }
    if (this.selectedStatus !== 'ALL') {
      chips.push({
        key: 'status',
        label: `Status: ${this.selectedStatus}`,
        icon: 'bi-check2-circle',
      });
    }
    if (this.selectedPriority !== 'ALL') {
      chips.push({
        key: 'priority',
        label: `Priority: ${this.selectedPriority}`,
        icon: 'bi-flag',
      });
    }
    if (this.selectedSort !== 'dueDateAsc') {
      const sortOpt = this.sortFilterOptions.find((o) => o.value === this.selectedSort);
      chips.push({
        key: 'sort',
        label: `Sort: ${sortOpt?.label || this.selectedSort}`,
        icon: 'bi-sort-down',
      });
    }
    this.activeFilterChips = chips;
  }

  applyFilters(): void {
    this.searchQuery = this.draftSearchQuery.trim();
    this.selectedStatus = this.draftStatus || 'ALL';
    this.selectedPriority = this.draftPriority || 'ALL';
    this.selectedSort = this.draftSort || 'dueDateAsc';
    this.currentPage = 1;
    this.updateTasksView();
  }

  resetFilters(): void {
    this.draftSearchQuery = '';
    this.draftStatus = 'ALL';
    this.draftPriority = 'ALL';
    this.draftSort = 'dueDateAsc';
    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedPriority = 'ALL';
    this.selectedSort = 'dueDateAsc';
    this.currentPage = 1;
    this.updateTasksView();
  }

  removeFilterChip(key: TaskFilterChip['key']): void {
    if (key === 'search') {
      this.draftSearchQuery = '';
      this.searchQuery = '';
    } else if (key === 'status') {
      this.draftStatus = 'ALL';
      this.selectedStatus = 'ALL';
    } else if (key === 'priority') {
      this.draftPriority = 'ALL';
      this.selectedPriority = 'ALL';
    } else if (key === 'sort') {
      this.draftSort = 'dueDateAsc';
      this.selectedSort = 'dueDateAsc';
    }
    this.currentPage = 1;
    this.updateTasksView();
  }

  setStatusFilter(status: string): void {
    this.draftStatus = status;
    this.selectedStatus = status;
    this.currentPage = 1;
    this.updateTasksView();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateTasksView();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updateTasksView();
  }

  changeTaskStatus(
    task: AssignedTask,
    newStatus: 'Pending' | 'In Progress' | 'Completed',
    event?: Event
  ): void {
    if (event) {
      event.stopPropagation();
    }
    const target = this.tasksList.find((t) => t.id === task.id) || task;
    target.status = newStatus;
    if (newStatus === 'Completed') {
      target.progressPercent = 100;
      target.completedSubtasksCount = target.subtasksCount;
    } else if (newStatus === 'Pending') {
      target.progressPercent = 0;
      target.completedSubtasksCount = 0;
    } else if (newStatus === 'In Progress' && target.progressPercent === 0) {
      target.progressPercent = 25;
    }
    this.taskService.updateTaskStatus(target.id, newStatus);
    this.updateTasksView();
    this.toaster.success(`Task ${target.id} status updated to "${newStatus}".`, 'Status Updated');
  }

  getPriorityBadgeVariant(priority?: string): BadgeVariant {
    switch (priority) {
      case 'Urgent':
        return 'soft-danger';
      case 'High':
        return 'soft-warning';
      case 'Medium':
        return 'soft-primary';
      case 'Low':
        return 'light';
      default:
        return 'light';
    }
  }

  getStatusBadgeVariant(status?: string): BadgeVariant {
    switch (status) {
      case 'Completed':
        return 'soft-emerald';
      case 'In Progress':
        return 'soft-info';
      case 'Pending':
        return 'soft-warning';
      default:
        return 'light';
    }
  }

  getSubtaskProgress(task: AssignedTask): string {
    return `${task.completedSubtasksCount}/${task.subtasksCount}`;
  }
}
