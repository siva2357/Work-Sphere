import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService, ManagedTask } from '../../../core/services/task.service';
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

export interface TaskMgmtFilterChip {
  key: 'search' | 'status' | 'project' | 'priority' | 'sort';
  label: string;
  icon: string;
}

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [
    CommonModule,
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
  templateUrl: './task-management.html',
  styleUrl: './task-management.css',
})
export class TaskManagement implements OnInit {
  private taskService = inject(TaskService);
  private router = inject(Router);
  private toaster = inject(ToasterService);

  @ViewChild('sNoTpl', { static: true }) sNoTpl!: TemplateRef<any>;
  @ViewChild('taskIdTpl', { static: true }) taskIdTpl!: TemplateRef<any>;
  @ViewChild('titleTpl', { static: true }) titleTpl!: TemplateRef<any>;
  @ViewChild('projectTpl', { static: true }) projectTpl!: TemplateRef<any>;
  @ViewChild('descTpl', { static: true }) descTpl!: TemplateRef<any>;
  @ViewChild('profileTpl', { static: true }) profileTpl!: TemplateRef<any>;
  @ViewChild('assigneeNameTpl', { static: true }) assigneeNameTpl!: TemplateRef<any>;
  @ViewChild('assigneeRoleTpl', { static: true }) assigneeRoleTpl!: TemplateRef<any>;
  @ViewChild('assignedByTpl', { static: true }) assignedByTpl!: TemplateRef<any>;
  @ViewChild('dueDateTpl', { static: true }) dueDateTpl!: TemplateRef<any>;
  @ViewChild('priorityTpl', { static: true }) priorityTpl!: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;

  tableColumns: TableColumn[] = [];

  // Draft Filter Inputs (bound to <app-input-field>)
  draftSearchQuery = '';
  draftStatus = 'ALL';
  draftProject = 'ALL';
  draftPriority = 'ALL';
  draftSort: 'dueDateAsc' | 'dueDateDesc' | 'priority' | 'recentlyAssigned' | 'titleAsc' = 'dueDateAsc';

  // Applied Filter State
  searchQuery = '';
  selectedStatus = 'ALL';
  selectedProject = 'ALL';
  selectedPriority = 'ALL';
  selectedSort: 'dueDateAsc' | 'dueDateDesc' | 'priority' | 'recentlyAssigned' | 'titleAsc' = 'dueDateAsc';

  // Pagination State
  currentPage = 1;
  pageSize = 10;
  effectiveCurrentPage = 1;

  // Filter Dropdown Options
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

  projectFilterOptions: InputDropdownOption[] = [
    { label: 'All Projects', value: 'ALL' },
  ];

  readonly sortFilterOptions: InputDropdownOption[] = [
    { label: 'Due Date: Earliest First', value: 'dueDateAsc' },
    { label: 'Due Date: Latest First', value: 'dueDateDesc' },
    { label: 'Priority: Highest First', value: 'priority' },
    { label: 'Assigned: Most Recent', value: 'recentlyAssigned' },
    { label: 'Title: Alphabetical', value: 'titleAsc' },
  ];

  // Cached Arrays & Metrics
  tasksList: ManagedTask[] = [];
  filteredTasks: ManagedTask[] = [];
  paginatedTasks: ManagedTask[] = [];
  statCards: StatMetric[] = [];
  activeFilterChips: TaskMgmtFilterChip[] = [];

  totalTasksCount = 0;
  pendingCount = 0;
  inProgressCount = 0;
  completedCount = 0;

  ngOnInit(): void {
    this.initTableColumns();
    this.updateTaskMgmtView();

    this.taskService.tasks$.subscribe((tasks) => {
      this.tasksList = tasks || [];
      this.extractProjects();
      this.updateTaskMgmtView();
    });

    this.taskService.refreshTasks();
  }

  private initTableColumns(): void {
    this.tableColumns = [
      {
        field: 'sNo',
        headerName: 'S.No.',
        width: 75,
        cellTemplate: this.sNoTpl,
      },
      {
        field: 'id',
        headerName: 'Task ID',
        width: 120,
        cellTemplate: this.taskIdTpl,
      },
      {
        field: 'title',
        headerName: 'Task Title',
        width: 220,
        cellTemplate: this.titleTpl,
      },
      {
        field: 'project',
        headerName: 'Project',
        width: 180,
        cellTemplate: this.projectTpl,
      },
      {
        field: 'description',
        headerName: 'Description',
        width: 250,
        cellTemplate: this.descTpl,
      },
      {
        field: 'avatar',
        headerName: 'Profile Image',
        width: 120,
        cellTemplate: this.profileTpl,
      },
      {
        field: 'assigneeName',
        headerName: 'Assignee',
        width: 180,
        cellTemplate: this.assigneeNameTpl,
      },
      {
        field: 'assigneeRole',
        headerName: 'Designation',
        width: 180,
        cellTemplate: this.assigneeRoleTpl,
      },
      {
        field: 'assignedBy',
        headerName: 'Assigned By',
        width: 150,
        cellTemplate: this.assignedByTpl,
      },
      {
        field: 'dueDate',
        headerName: 'Due Date',
        width: 125,
        cellTemplate: this.dueDateTpl,
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 115,
        cellTemplate: this.priorityTpl,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 125,
        cellTemplate: this.statusTpl,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 90,
        cellTemplate: this.actionsTpl,
      },
    ];
  }

  private extractProjects(): void {
    const set = new Set<string>();
    this.tasksList.forEach((t) => {
      if (t.project) set.add(t.project);
    });
    (this.taskService.availableProjects || []).forEach((p) => set.add(p));

    const opts: InputDropdownOption[] = [{ label: 'All Projects', value: 'ALL' }];
    Array.from(set).sort().forEach((proj) => {
      opts.push({ label: proj, value: proj });
    });
    this.projectFilterOptions = opts;
  }

  updateTaskMgmtView(): void {
    let result = [...this.tasksList];

    // 1. Status Filter
    if (this.selectedStatus !== 'ALL') {
      result = result.filter((t) => t.status === this.selectedStatus);
    }

    // 2. Project Filter
    if (this.selectedProject !== 'ALL') {
      result = result.filter((t) => t.project === this.selectedProject);
    }

    // 3. Priority Filter
    if (this.selectedPriority !== 'ALL') {
      result = result.filter((t) => t.priority === this.selectedPriority);
    }

    // 4. Search Filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.project.toLowerCase().includes(q) ||
          t.assignee?.name.toLowerCase().includes(q) ||
          t.assignee?.id.toLowerCase().includes(q) ||
          t.assignee?.role.toLowerCase().includes(q) ||
          t.assignedBy?.name.toLowerCase().includes(q)
      );
    }

    // 5. Sorting
    result.sort((a, b) => {
      if (this.selectedSort === 'priority') {
        const priorityOrder: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      } else if (this.selectedSort === 'recentlyAssigned') {
        return new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime();
      } else if (this.selectedSort === 'dueDateDesc') {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else if (this.selectedSort === 'titleAsc') {
        return a.title.localeCompare(b.title);
      } else {
        // dueDateAsc (Default)
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
    });

    this.filteredTasks = result;

    // Re-index S.No
    this.filteredTasks.forEach((t, idx) => {
      t.sNo = idx + 1;
    });

    // Metric Counts
    this.totalTasksCount = this.tasksList.length;
    this.pendingCount = this.tasksList.filter((t) => t.status === 'Pending').length;
    this.inProgressCount = this.tasksList.filter((t) => t.status === 'In Progress').length;
    this.completedCount = this.tasksList.filter((t) => t.status === 'Completed').length;

    // Update Stat Cards
    this.statCards = [
      {
        title: 'Total Tasks',
        value: this.totalTasksCount,
        subtitle: 'Across all team projects',
        icon: 'bi-kanban',
        badgeText: 'TOTAL',
        badgeType: 'secondary',
      },
      {
        title: 'Tasks Pending',
        value: this.pendingCount,
        subtitle: 'Awaiting start / action',
        icon: 'bi-hourglass-split',
        badgeText: 'PENDING',
        badgeType: 'warning',
      },
      {
        title: 'Tasks In Progress',
        value: this.inProgressCount,
        subtitle: 'Currently in development',
        icon: 'bi-arrow-repeat',
        badgeText: 'ACTIVE',
        badgeType: 'primary',
      },
      {
        title: 'Tasks Completed',
        value: this.completedCount,
        subtitle: 'Verified & delivered',
        icon: 'bi-check2-circle',
        badgeText: 'DELIVERED',
        badgeType: 'emerald',
      },
    ];

    // Build Active Filter Chips
    this.buildFilterChips();

    // Paginate
    const maxPage = Math.max(1, Math.ceil(this.filteredTasks.length / this.pageSize));
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }
    this.effectiveCurrentPage = this.currentPage;

    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedTasks = this.filteredTasks.slice(start, start + this.pageSize);
  }

  private buildFilterChips(): void {
    const chips: TaskMgmtFilterChip[] = [];

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

    if (this.selectedProject !== 'ALL') {
      chips.push({
        key: 'project',
        label: `Project: ${this.selectedProject}`,
        icon: 'bi-folder2',
      });
    }

    if (this.selectedPriority !== 'ALL') {
      chips.push({
        key: 'priority',
        label: `Priority: ${this.selectedPriority}`,
        icon: 'bi-flag-fill',
      });
    }

    if (this.selectedSort !== 'dueDateAsc') {
      const match = this.sortFilterOptions.find((o) => o.value === this.selectedSort);
      if (match) {
        chips.push({
          key: 'sort',
          label: `Sort: ${match.label}`,
          icon: 'bi-sort-down',
        });
      }
    }

    this.activeFilterChips = chips;
  }

  applyFilters(): void {
    this.searchQuery = this.draftSearchQuery;
    this.selectedStatus = this.draftStatus;
    this.selectedProject = this.draftProject;
    this.selectedPriority = this.draftPriority;
    this.selectedSort = this.draftSort;
    this.currentPage = 1;
    this.updateTaskMgmtView();
    this.toaster.show({
      title: 'Filters Applied',
      message: `Showing ${this.filteredTasks.length} matching team tasks.`,
      variant: 'info',
      icon: 'bi-funnel-fill',
    });
  }

  resetFilters(): void {
    this.draftSearchQuery = '';
    this.draftStatus = 'ALL';
    this.draftProject = 'ALL';
    this.draftPriority = 'ALL';
    this.draftSort = 'dueDateAsc';

    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedProject = 'ALL';
    this.selectedPriority = 'ALL';
    this.selectedSort = 'dueDateAsc';

    this.currentPage = 1;
    this.updateTaskMgmtView();
    this.toaster.show({
      title: 'Filters Reset',
      message: 'All task directory filters restored to defaults.',
      variant: 'info',
      icon: 'bi-arrow-counterclockwise',
    });
  }

  removeFilter(key: TaskMgmtFilterChip['key']): void {
    switch (key) {
      case 'search':
        this.draftSearchQuery = '';
        this.searchQuery = '';
        break;
      case 'status':
        this.draftStatus = 'ALL';
        this.selectedStatus = 'ALL';
        break;
      case 'project':
        this.draftProject = 'ALL';
        this.selectedProject = 'ALL';
        break;
      case 'priority':
        this.draftPriority = 'ALL';
        this.selectedPriority = 'ALL';
        break;
      case 'sort':
        this.draftSort = 'dueDateAsc';
        this.selectedSort = 'dueDateAsc';
        break;
    }
    this.currentPage = 1;
    this.updateTaskMgmtView();
  }

  setStatusTab(status: string): void {
    this.draftStatus = status;
    this.selectedStatus = status;
    this.currentPage = 1;
    this.updateTaskMgmtView();
  }

  // Task Transitions
  changeTaskStatus(task: ManagedTask, newStatus: 'Pending' | 'In Progress' | 'Completed'): void {
    this.taskService.updateTaskStatus(task.id, newStatus);
    this.updateTaskMgmtView();
    this.toaster.show({
      title: 'Status Updated',
      message: `Task ${task.id} updated to "${newStatus}"`,
      variant: newStatus === 'Completed' ? 'emerald' : newStatus === 'In Progress' ? 'info' : 'warning',
      icon: newStatus === 'Completed' ? 'bi-check-circle-fill' : 'bi-arrow-repeat',
    });
  }

  deleteTask(task: ManagedTask): void {
    const confirmDelete = window.confirm(`Are you sure you want to remove task "${task.title}" (${task.id})?`);
    if (confirmDelete) {
      this.taskService.deleteTask(task.id);
      this.updateTaskMgmtView();
      this.toaster.show({
        title: 'Task Removed',
        message: `Task ${task.id} removed from roster.`,
        variant: 'danger',
        icon: 'bi-trash',
      });
    }
  }

  viewTaskDetails(task: ManagedTask): void {
    this.router.navigate(['/employee/task-details', task.id]);
  }

  navigateToCreateTask(): void {
    this.router.navigate(['/employee/create-task']);
  }

  // Pagination Handlers
  onPageChange(page: number): void {
    this.currentPage = page;
    this.effectiveCurrentPage = page;
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedTasks = this.filteredTasks.slice(start, start + this.pageSize);
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.effectiveCurrentPage = 1;
    this.updateTaskMgmtView();
  }

  // Styling Helpers
  getPriorityBadgeVariant(priority: string): BadgeVariant {
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

  getStatusBadgeVariant(status: string): BadgeVariant {
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

  getInitials(name?: string): string {
    if (!name) return 'WS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
}
