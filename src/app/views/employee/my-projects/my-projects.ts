import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';

import { AssignedProject } from '../../../core/models/task-project-team.interface';
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

export type { AssignedProject } from '../../../core/models/task-project-team.interface';

export interface ProjectFilterChip {
  key: 'search' | 'status' | 'category';
  label: string;
  icon: string;
}

@Component({
  selector: 'app-my-projects',
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
  templateUrl: './my-projects.html',
  styleUrl: './my-projects.css',
})
export class MyProjects implements OnInit {
  private http = inject(HttpClient);
  private toaster = inject(ToasterService);

  // External Agile Tool URL
  readonly AGILE_TOOL_URL = 'https://habit-tracker-lake-zeta.vercel.app/login';

  @ViewChild('projectCodeTpl', { static: true }) projectCodeTpl!: TemplateRef<any>;
  @ViewChild('projectTitleTpl', { static: true }) projectTitleTpl!: TemplateRef<any>;
  @ViewChild('projectDescTpl', { static: true }) projectDescTpl!: TemplateRef<any>;
  @ViewChild('projectRoleTpl', { static: true }) projectRoleTpl!: TemplateRef<any>;
  @ViewChild('startDateTpl', { static: true }) startDateTpl!: TemplateRef<any>;
  @ViewChild('endDateTpl', { static: true }) endDateTpl!: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;

  tableColumns: TableColumn[] = [];
  isLoadingProjects = false;

  // Draft Filter Inputs (bound to <app-input-field>)
  draftSearchQuery = '';
  draftStatus = 'All';
  draftCategory = 'All';

  // Applied Filter State
  searchQuery = '';
  selectedStatus = 'All';
  selectedCategory = 'All';

  // Pagination State
  currentPage = 1;
  pageSize = 10;
  effectiveCurrentPage = 1;

  readonly statusFilterOptions: InputDropdownOption[] = [
    { label: 'All Statuses', value: 'All' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Planning', value: 'Planning' },
    { label: 'Completed', value: 'Completed' },
  ];

  categoryFilterOptions: InputDropdownOption[] = [
    { label: 'All Categories', value: 'All' },
  ];

  // Real-time Projects Data & Cached View State
  projectsList: (AssignedProject & { sNo?: number })[] = [];
  filteredProjects: (AssignedProject & { sNo?: number })[] = [];
  paginatedProjects: (AssignedProject & { sNo?: number })[] = [];
  statCards: StatMetric[] = [];
  activeFilterChips: ProjectFilterChip[] = [];

  totalProjectsCount = 0;
  inProgressCount = 0;
  activeCount = 0;
  planningCount = 0;
  completedCount = 0;

  ngOnInit(): void {
    this.initTableColumns();
    this.updateProjectsView();
    this.loadProjects();
  }

  private initTableColumns(): void {
    this.tableColumns = [
      {
        field: 'sNo',
        headerName: 'S.No.',
        width: 70,
      },
      {
        field: 'code',
        headerName: 'Project ID',
        cellTemplate: this.projectCodeTpl,
        width: 120,
      },
      {
        field: 'title',
        headerName: 'Project Title',
        cellTemplate: this.projectTitleTpl,
        width: 240,
      },
      {
        field: 'description',
        headerName: 'Project Description',
        cellTemplate: this.projectDescTpl,
        width: 280,
      },
      {
        field: 'role',
        headerName: 'My Role',
        cellTemplate: this.projectRoleTpl,
        width: 155,
      },
      {
        field: 'startDate',
        headerName: 'Start Date',
        cellTemplate: this.startDateTpl,
        width: 135,
      },
      {
        field: 'endDate',
        headerName: 'End Date',
        cellTemplate: this.endDateTpl,
        width: 135,
      },
      {
        field: 'status',
        headerName: 'Status',
        cellTemplate: this.statusTpl,
        width: 130,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        cellTemplate: this.actionsTpl,
        width: 90,
      },
    ];
  }

  loadProjects(): void {
    this.isLoadingProjects = true;
    this.http
      .get<any[]>(API_ENDPOINTS.WORKSPACE.PROJECTS)
      .pipe(finalize(() => (this.isLoadingProjects = false)))
      .subscribe({
        next: (rows) => {
          this.projectsList = (rows || []).map((r, idx) => ({
            sNo: idx + 1,
            id: idx + 1,
            code: r.code || `PRJ-${idx + 101}`,
            title: r.name || r.title || 'Project',
            department: r.department || 'Engineering',
            category: r.category || 'Enterprise Platform',
            description: r.description || '',
            startDate: r.startDate
              ? new Date(r.startDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : '15 Jan 2026',
            endDate: r.endDate
              ? new Date(r.endDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : '30 Nov 2026',
            duration: r.duration || '6 Months',
            status: (r.status === 'Active'
              ? 'In Progress'
              : r.status || 'In Progress') as AssignedProject['status'],
            role: r.role || r.managerName || 'Project Contributor',
            externalToolUrl: r.externalToolUrl || this.AGILE_TOOL_URL,
          }));
          this.rebuildCategoryOptions();
          this.updateProjectsView();
        },
        error: () => {
          this.projectsList = [];
          this.rebuildCategoryOptions();
          this.updateProjectsView();
        },
      });
  }

  private rebuildCategoryOptions(): void {
    const categories = Array.from(
      new Set(this.projectsList.map((p) => p.category).filter(Boolean))
    );
    this.categoryFilterOptions = [
      { label: 'All Categories', value: 'All' },
      ...categories.map((cat) => ({ label: cat, value: cat })),
    ];
  }

  private updateProjectsView(): void {
    this.totalProjectsCount = this.projectsList.length;
    this.inProgressCount = this.projectsList.filter((p) => p.status === 'In Progress').length;
    this.activeCount = this.projectsList.filter((p) => p.status === 'Active').length;
    this.planningCount = this.projectsList.filter((p) => p.status === 'Planning').length;
    this.completedCount = this.projectsList.filter((p) => p.status === 'Completed').length;

    this.statCards = [
      {
        title: 'Total Assigned',
        value: `${this.totalProjectsCount} Projects`,
        subtitle: 'IT Department scope',
        badgeText: 'Assigned',
        badgeType: 'emerald',
        icon: 'bi-folder-check',
      },
      {
        title: 'In Progress',
        value: `${this.inProgressCount} Active Sprints`,
        subtitle: 'Under active development',
        badgeText: 'Active',
        badgeType: 'info',
        icon: 'bi-arrow-repeat',
      },
      {
        title: 'In Planning',
        value: `${this.planningCount} Upcoming`,
        subtitle: 'Architecture & design',
        badgeText: 'Planning',
        badgeType: 'warning',
        icon: 'bi-diagram-3',
      },
      {
        title: 'Delivered',
        value: `${this.completedCount} Completed`,
        subtitle: 'Production deployed',
        badgeText: 'Delivered',
        badgeType: 'success',
        icon: 'bi-check2-circle',
      },
    ];

    const q = this.searchQuery.toLowerCase().trim();
    this.filteredProjects = this.projectsList.filter((project) => {
      const matchesSearch =
        !q ||
        project.title.toLowerCase().includes(q) ||
        project.code.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        project.category.toLowerCase().includes(q) ||
        project.department.toLowerCase().includes(q) ||
        project.role.toLowerCase().includes(q);

      const matchesStatus =
        this.selectedStatus === 'All' || project.status === this.selectedStatus;

      const matchesCategory =
        this.selectedCategory === 'All' || project.category === this.selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    const totalPages = Math.max(1, Math.ceil(this.filteredProjects.length / this.pageSize));
    this.effectiveCurrentPage = Math.min(Math.max(1, this.currentPage), totalPages);
    const start = (this.effectiveCurrentPage - 1) * this.pageSize;
    this.paginatedProjects = this.filteredProjects
      .slice(start, start + this.pageSize)
      .map((project, idx) => ({
        ...project,
        sNo: start + idx + 1,
      }));

    const chips: ProjectFilterChip[] = [];
    if (this.searchQuery.trim()) {
      chips.push({
        key: 'search',
        label: `Search: "${this.searchQuery.trim()}"`,
        icon: 'bi-search',
      });
    }
    if (this.selectedStatus !== 'All') {
      chips.push({
        key: 'status',
        label: `Status: ${this.selectedStatus}`,
        icon: 'bi-check2-circle',
      });
    }
    if (this.selectedCategory !== 'All') {
      chips.push({
        key: 'category',
        label: `Category: ${this.selectedCategory}`,
        icon: 'bi-layers',
      });
    }
    this.activeFilterChips = chips;
  }

  applyFilters(): void {
    this.searchQuery = this.draftSearchQuery.trim();
    this.selectedStatus = this.draftStatus || 'All';
    this.selectedCategory = this.draftCategory || 'All';
    this.currentPage = 1;
    this.updateProjectsView();
  }

  resetFilters(): void {
    this.draftSearchQuery = '';
    this.draftStatus = 'All';
    this.draftCategory = 'All';
    this.searchQuery = '';
    this.selectedStatus = 'All';
    this.selectedCategory = 'All';
    this.currentPage = 1;
    this.updateProjectsView();
  }

  removeFilterChip(key: ProjectFilterChip['key']): void {
    if (key === 'search') {
      this.draftSearchQuery = '';
      this.searchQuery = '';
    } else if (key === 'status') {
      this.draftStatus = 'All';
      this.selectedStatus = 'All';
    } else if (key === 'category') {
      this.draftCategory = 'All';
      this.selectedCategory = 'All';
    }
    this.currentPage = 1;
    this.updateProjectsView();
  }

  setStatusFilter(status: string): void {
    this.draftStatus = status;
    this.selectedStatus = status;
    this.currentPage = 1;
    this.updateProjectsView();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateProjectsView();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updateProjectsView();
  }

  openAgileTool(project?: AssignedProject): void {
    const url = project?.externalToolUrl || this.AGILE_TOOL_URL;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  copyProjectCode(project: AssignedProject): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(project.code).catch(() => {});
    }
    this.toaster.success(`Project ID "${project.code}" copied to clipboard.`, 'Copied');
  }

  getStatusBadgeVariant(status?: string): BadgeVariant {
    switch (status) {
      case 'In Progress':
        return 'soft-info';
      case 'Active':
        return 'soft-emerald';
      case 'Planning':
        return 'soft-warning';
      case 'Completed':
        return 'soft-success';
      default:
        return 'light';
    }
  }
}
