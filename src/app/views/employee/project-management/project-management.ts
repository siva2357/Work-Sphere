import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService, ManagedProject } from '../../../core/services/project.service';
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

export interface ProjectMgmtFilterChip {
  key: 'search' | 'status' | 'department' | 'priority' | 'sort';
  label: string;
  icon: string;
}

@Component({
  selector: 'app-project-management',
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
  templateUrl: './project-management.html',
  styleUrl: './project-management.css',
})
export class ProjectManagement implements OnInit {
  private projectService = inject(ProjectService);
  private router = inject(Router);
  private toaster = inject(ToasterService);

  @ViewChild('sNoTpl', { static: true }) sNoTpl!: TemplateRef<any>;
  @ViewChild('codeTpl', { static: true }) codeTpl!: TemplateRef<any>;
  @ViewChild('titleTpl', { static: true }) titleTpl!: TemplateRef<any>;
  @ViewChild('departmentTpl', { static: true }) departmentTpl!: TemplateRef<any>;
  @ViewChild('categoryTpl', { static: true }) categoryTpl!: TemplateRef<any>;
  @ViewChild('leadProfileTpl', { static: true }) leadProfileTpl!: TemplateRef<any>;
  @ViewChild('leadNameTpl', { static: true }) leadNameTpl!: TemplateRef<any>;
  @ViewChild('teamTpl', { static: true }) teamTpl!: TemplateRef<any>;
  @ViewChild('timelineTpl', { static: true }) timelineTpl!: TemplateRef<any>;
  @ViewChild('progressTpl', { static: true }) progressTpl!: TemplateRef<any>;
  @ViewChild('priorityTpl', { static: true }) priorityTpl!: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;

  tableColumns: TableColumn[] = [];

  // Draft Filter Inputs (bound to <app-input-field>)
  draftSearchQuery = '';
  draftStatus = 'ALL';
  draftDepartment = 'ALL';
  draftPriority = 'ALL';
  draftSort: 'dueDateAsc' | 'dueDateDesc' | 'progressDesc' | 'priority' | 'titleAsc' = 'dueDateAsc';

  // Applied Filter State
  searchQuery = '';
  selectedStatus = 'ALL';
  selectedDepartment = 'ALL';
  selectedPriority = 'ALL';
  selectedSort: 'dueDateAsc' | 'dueDateDesc' | 'progressDesc' | 'priority' | 'titleAsc' = 'dueDateAsc';

  // Pagination State
  currentPage = 1;
  pageSize = 10;
  effectiveCurrentPage = 1;

  // Filter Dropdown Options
  readonly statusFilterOptions: InputDropdownOption[] = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Planning', value: 'Planning' },
    { label: 'Completed', value: 'Completed' },
    { label: 'On Hold', value: 'On Hold' },
  ];

  readonly priorityFilterOptions: InputDropdownOption[] = [
    { label: 'All Priorities', value: 'ALL' },
    { label: 'Urgent Priority', value: 'Urgent' },
    { label: 'High Priority', value: 'High' },
    { label: 'Medium Priority', value: 'Medium' },
    { label: 'Low Priority', value: 'Low' },
  ];

  departmentFilterOptions: InputDropdownOption[] = [
    { label: 'All Departments', value: 'ALL' },
  ];

  readonly sortFilterOptions: InputDropdownOption[] = [
    { label: 'Due Date: Earliest First', value: 'dueDateAsc' },
    { label: 'Due Date: Latest First', value: 'dueDateDesc' },
    { label: 'Progress: Highest First', value: 'progressDesc' },
    { label: 'Priority: Highest First', value: 'priority' },
    { label: 'Title: Alphabetical', value: 'titleAsc' },
  ];

  // Cached Arrays & Metrics
  projects: (ManagedProject & { sNo?: number })[] = [];
  filteredProjects: (ManagedProject & { sNo?: number })[] = [];
  paginatedProjects: (ManagedProject & { sNo?: number })[] = [];
  statCards: StatMetric[] = [];
  activeFilterChips: ProjectMgmtFilterChip[] = [];

  totalProjectsCount = 0;
  inProgressCount = 0;
  planningCount = 0;
  completedCount = 0;
  onHoldCount = 0;

  ngOnInit(): void {
    this.initTableColumns();
    this.updateProjectMgmtView();

    this.projectService.projects$.subscribe((list) => {
      this.projects = (list || []).map((p, idx) => ({
        ...p,
        sNo: idx + 1,
      }));
      this.extractDepartments();
      this.updateProjectMgmtView();
    });

    this.projectService.refreshProjects();
  }

  private initTableColumns(): void {
    this.tableColumns = [
      {
        field: 'sNo',
        headerName: 'S.No.',
        width: 75,
        minWidth: 70,
        maxWidth: 85,
        cellTemplate: this.sNoTpl,
      },
      {
        field: 'code',
        headerName: 'Project Code',
        width: 145,
        minWidth: 135,
        maxWidth: 165,
        cellTemplate: this.codeTpl,
      },
      {
        field: 'title',
        headerName: 'Project Title',
        width: 260,
        minWidth: 230,
        cellTemplate: this.titleTpl,
      },
      {
        field: 'department',
        headerName: 'Department',
        width: 240,
        minWidth: 210,
        cellTemplate: this.departmentTpl,
      },
      {
        field: 'category',
        headerName: 'Category',
        width: 210,
        minWidth: 190,
        cellTemplate: this.categoryTpl,
      },
      {
        field: 'leadAvatar',
        headerName: 'Profile Image',
        width: 110,
        minWidth: 100,
        maxWidth: 120,
        cellTemplate: this.leadProfileTpl,
      },
      {
        field: 'leadName',
        headerName: 'Project Lead',
        width: 190,
        minWidth: 170,
        cellTemplate: this.leadNameTpl,
      },
      {
        field: 'team',
        headerName: 'Team Size',
        width: 140,
        minWidth: 130,
        cellTemplate: this.teamTpl,
      },
      {
        field: 'timeline',
        headerName: 'Target Deadline',
        width: 230,
        minWidth: 210,
        cellTemplate: this.timelineTpl,
      },
      {
        field: 'progress',
        headerName: 'Progress & Budget',
        width: 200,
        minWidth: 180,
        cellTemplate: this.progressTpl,
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 130,
        minWidth: 120,
        cellTemplate: this.priorityTpl,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 140,
        minWidth: 130,
        cellTemplate: this.statusTpl,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 85,
        minWidth: 80,
        maxWidth: 95,
        cellTemplate: this.actionsTpl,
      },
    ];
  }

  private extractDepartments(): void {
    const set = new Set<string>();
    this.projects.forEach((p) => {
      if (p.department) set.add(p.department);
    });
    (this.projectService.availableDepartments || []).forEach((d) => set.add(d));

    const opts: InputDropdownOption[] = [{ label: 'All Departments', value: 'ALL' }];
    Array.from(set).sort().forEach((dep) => {
      opts.push({ label: dep, value: dep });
    });
    this.departmentFilterOptions = opts;
  }

  updateProjectMgmtView(): void {
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

    // 4. Search Filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.code.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.lead?.name.toLowerCase().includes(q) ||
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
      if (this.selectedSort === 'titleAsc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    this.filteredProjects = result;

    // Re-index S.No
    this.filteredProjects.forEach((p, idx) => {
      p.sNo = idx + 1;
    });

    // Metric Counts
    this.totalProjectsCount = this.projects.length;
    this.inProgressCount = this.projects.filter((p) => p.status === 'In Progress').length;
    this.planningCount = this.projects.filter((p) => p.status === 'Planning').length;
    this.completedCount = this.projects.filter((p) => p.status === 'Completed').length;
    this.onHoldCount = this.projects.filter((p) => p.status === 'On Hold').length;

    // Update Stat Cards
    this.statCards = [
      {
        title: 'Total Projects',
        value: this.totalProjectsCount,
        subtitle: 'Across all corporate divisions',
        icon: 'bi-folder-check',
        badgeText: 'TOTAL',
        badgeType: 'secondary',
      },
      {
        title: 'In Active Development',
        value: this.inProgressCount,
        subtitle: 'Active delivery track',
        icon: 'bi-rocket-takeoff',
        badgeText: 'SPRINTS',
        badgeType: 'primary',
      },
      {
        title: 'Planning & Inception',
        value: this.planningCount,
        subtitle: 'Architecture & RFC phase',
        icon: 'bi-compass',
        badgeText: 'ROADMAPS',
        badgeType: 'warning',
      },
      {
        title: 'Successfully Delivered',
        value: this.completedCount,
        subtitle: 'Production verified',
        icon: 'bi-trophy',
        badgeText: 'SHIPPED',
        badgeType: 'emerald',
      },
    ];

    // Build Active Filter Chips
    this.buildFilterChips();

    // Paginate
    const maxPage = Math.max(1, Math.ceil(this.filteredProjects.length / this.pageSize));
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }
    this.effectiveCurrentPage = this.currentPage;

    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedProjects = this.filteredProjects.slice(start, start + this.pageSize);
  }

  private buildFilterChips(): void {
    const chips: ProjectMgmtFilterChip[] = [];

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

    if (this.selectedDepartment !== 'ALL') {
      chips.push({
        key: 'department',
        label: `Dept: ${this.selectedDepartment}`,
        icon: 'bi-building',
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
    this.selectedDepartment = this.draftDepartment;
    this.selectedPriority = this.draftPriority;
    this.selectedSort = this.draftSort;
    this.currentPage = 1;
    this.updateProjectMgmtView();
    this.toaster.show({
      title: 'Filters Applied',
      message: `Showing ${this.filteredProjects.length} matching enterprise projects.`,
      variant: 'info',
      icon: 'bi-funnel-fill',
    });
  }

  resetFilters(): void {
    this.draftSearchQuery = '';
    this.draftStatus = 'ALL';
    this.draftDepartment = 'ALL';
    this.draftPriority = 'ALL';
    this.draftSort = 'dueDateAsc';

    this.searchQuery = '';
    this.selectedStatus = 'ALL';
    this.selectedDepartment = 'ALL';
    this.selectedPriority = 'ALL';
    this.selectedSort = 'dueDateAsc';

    this.currentPage = 1;
    this.updateProjectMgmtView();
    this.toaster.show({
      title: 'Filters Reset',
      message: 'All project portfolio filters restored to defaults.',
      variant: 'info',
      icon: 'bi-arrow-counterclockwise',
    });
  }

  removeFilter(key: ProjectMgmtFilterChip['key']): void {
    switch (key) {
      case 'search':
        this.draftSearchQuery = '';
        this.searchQuery = '';
        break;
      case 'status':
        this.draftStatus = 'ALL';
        this.selectedStatus = 'ALL';
        break;
      case 'department':
        this.draftDepartment = 'ALL';
        this.selectedDepartment = 'ALL';
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
    this.updateProjectMgmtView();
  }

  setStatusTab(status: string): void {
    this.draftStatus = status;
    this.selectedStatus = status;
    this.currentPage = 1;
    this.updateProjectMgmtView();
  }

  // Project Transitions
  changeProjectStatus(project: ManagedProject, newStatus: ManagedProject['status']): void {
    this.projectService.updateProjectStatus(project.id, newStatus);
    this.updateProjectMgmtView();
    this.toaster.show({
      title: 'Status Updated',
      message: `Project ${project.code} marked as "${newStatus}".`,
      variant: newStatus === 'Completed' ? 'emerald' : newStatus === 'In Progress' ? 'info' : 'warning',
      icon: newStatus === 'Completed' ? 'bi-check-circle-fill' : 'bi-arrow-repeat',
    });
  }

  deleteProject(project: ManagedProject): void {
    const confirmed = confirm(`Are you sure you want to delete project ${project.code}: "${project.title}"?`);
    if (confirmed) {
      this.projectService.deleteProject(project.id);
      this.updateProjectMgmtView();
      this.toaster.show({
        title: 'Project Removed',
        message: `Project ${project.code} removed from portfolio.`,
        variant: 'danger',
        icon: 'bi-trash',
      });
    }
  }

  navigateToCreateProject(): void {
    this.router.navigate(['/employee/create-project']);
  }

  openAgileTool(url?: string): void {
    const target = url || 'https://habit-tracker-lake-zeta.vercel.app/login';
    window.open(target, '_blank', 'noopener,noreferrer');
  }

  // Pagination Handlers
  onPageChange(page: number): void {
    this.currentPage = page;
    this.effectiveCurrentPage = page;
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedProjects = this.filteredProjects.slice(start, start + this.pageSize);
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.effectiveCurrentPage = 1;
    this.updateProjectMgmtView();
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
      case 'In Progress':
        return 'soft-primary';
      case 'Planning':
        return 'soft-warning';
      case 'Completed':
        return 'soft-emerald';
      case 'On Hold':
        return 'soft-secondary';
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
