import { Component, HostListener, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TeamService } from '../../../../core/services/team.service';
import { CompanyDirectoryService } from '../../../../core/services/company-directory.service';
import { DropdownService } from '../../../../core/services/dropdown.service';
import { ProjectService } from '../../../../core/services/project.service';
import { DirectoryEmployeeOption } from '../../../../core/models/task-project-team.interface';
import {
  Badge,
  Button,
  Chip,
  InputField,
  InputDropdownOption,
  Modal,
  Pagination,
  Table,
  TableColumn,
  Toaster,
  ToasterService,
} from '../../../../library/UI/components';

export interface ActiveFilterChip {
  key: 'search' | 'department' | 'availability';
  label: string;
  icon: string;
}

export interface ExtendedDirectoryEmployee extends Omit<DirectoryEmployeeOption, 'availability'> {
  availability: 'Available' | 'Partial Bandwidth' | 'Allocated' | 'Bench';
  allocationStatus?: 'Available' | 'In Team' | 'Bench';
  currentTeam?: string;
}

export type { DirectoryEmployeeOption } from '../../../../core/models/task-project-team.interface';

@Component({
  selector: 'app-add-new-employee',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Badge,
    Button,
    Chip,
    InputField,
    Modal,
    Table,
    Pagination,
    Toaster,
  ],
  templateUrl: './add-new-employee.html',
  styleUrl: './add-new-employee.css',
})
export class AddNewEmployee implements OnInit {
  private teamService = inject(TeamService);
  private directoryService = inject(CompanyDirectoryService);
  private dropdownService = inject(DropdownService);
  private projectService = inject(ProjectService);
  private router = inject(Router);
  private toaster = inject(ToasterService);

  // Table Cell Templates
  @ViewChild('selectTpl', { static: true }) selectTpl!: TemplateRef<any>;
  @ViewChild('idTpl', { static: true }) idTpl!: TemplateRef<any>;
  @ViewChild('employeeTpl', { static: true }) employeeTpl!: TemplateRef<any>;
  @ViewChild('locationTpl', { static: true }) locationTpl!: TemplateRef<any>;
  @ViewChild('emailTpl', { static: true }) emailTpl!: TemplateRef<any>;
  @ViewChild('deptTpl', { static: true }) deptTpl!: TemplateRef<any>;
  @ViewChild('designationTpl', { static: true }) designationTpl!: TemplateRef<any>;
  @ViewChild('roleTpl', { static: true }) roleTpl!: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;

  tableColumns: TableColumn[] = [];

  // Actions Dropdown Menu State
  activeActionsRowId: string | null = null;

  // Transfer Modal State
  isTransferModalOpen: boolean = false;
  transferringEmployee: ExtendedDirectoryEmployee | null = null;
  transferTargetDepartment: string = '';
  transferTargetPod: string = '';
  transferReason: string = '';
  transferPodOptions: InputDropdownOption[] = [];

  // Dedicated Set tracking members allocated specifically to THIS active team
  teamAllocatedMemberIds: Set<string> = new Set<string>();

  // Default Candidate Pool for fallback when backend directory is empty
  readonly defaultDepartments: string[] = [
    'IT & Technology Platform',
    'Core Web Platform',
    'Platform Services',
    'Data Platform',
    'Product Design',
    'Quality Assurance',
    'Mobile Engineering',
    'Cybersecurity & IAM',
  ];

  readonly defaultProjects: string[] = [
    'WorkSphere Enterprise Core v2.4',
    'Employee Self-Service Mobile Application',
    'WorkSphere Compliance & Audit Engine',
    'Real-time Analytics & BI Dashboard',
    'Global Payroll & Tax Engine 2026',
  ];

  private readonly defaultCandidates: DirectoryEmployeeOption[] = [
    {
      id: 'EMP-0142',
      name: 'Rohan Sharma',
      currentDepartment: 'Platform Services',
      defaultRole: 'Full Stack Java Engineer',
      designation: 'Senior Backend Engineer',
      email: 'rohan.sharma@worksphere.io',
      phone: '+91 98450 11223',
      location: 'Bangalore, India (HQ)',
      avatarColor: '#10b981',
      experience: '5+ Years',
      availability: 'Available',
      skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Kafka', 'Docker'],
    },
    {
      id: 'EMP-0172',
      name: 'Maya Lin',
      currentDepartment: 'Core Web Platform',
      defaultRole: 'Senior Angular Engineer',
      designation: 'UI Platform Specialist',
      email: 'maya.lin@worksphere.io',
      phone: '+91 98450 33445',
      location: 'Bangalore, India (HQ)',
      avatarColor: '#0ea5e9',
      experience: '6+ Years',
      availability: 'Available',
      skills: ['Angular', 'TypeScript', 'RxJS', 'Bootstrap', 'Design Systems'],
    },
    {
      id: 'EMP-0173',
      name: 'Carlos Rivera',
      currentDepartment: 'Product Design',
      defaultRole: 'Senior Product Designer',
      designation: 'Design Systems Lead',
      email: 'carlos.rivera@worksphere.io',
      phone: '+44 20 7946 0912',
      location: 'London, UK Branch',
      avatarColor: '#8b5cf6',
      experience: '7+ Years',
      availability: 'Available',
      skills: ['Figma', 'UI/UX Research', 'Design Tokens', 'Prototyping'],
    },
    {
      id: 'EMP-0174',
      name: 'Aisha Patel',
      currentDepartment: 'Core Web Platform',
      defaultRole: 'Staff Frontend Architect',
      designation: 'Staff Engineer (L6)',
      email: 'aisha.patel@worksphere.io',
      phone: '+91 98450 77889',
      location: 'Bangalore, India (HQ)',
      avatarColor: '#ec4899',
      experience: '8+ Years',
      availability: 'Partial Bandwidth',
      skills: ['Micro-frontends', 'Architecture', 'Web Performance', 'CI/CD'],
    },
    {
      id: 'EMP-0175',
      name: 'Samuel Kim',
      currentDepartment: 'Platform Services',
      defaultRole: 'Full Stack Java Engineer',
      designation: 'Cloud Security Specialist',
      email: 'samuel.kim@worksphere.io',
      phone: '+65 6789 0123',
      location: 'Singapore Regional Hub',
      avatarColor: '#f59e0b',
      experience: '4+ Years',
      availability: 'Available',
      skills: ['Java', 'IAM Security', 'Kubernetes', 'OAuth2/SAML'],
    },
    {
      id: 'EMP-0176',
      name: 'Zoe Zhang',
      currentDepartment: 'Data Platform',
      defaultRole: 'Staff Cloud Infrastructure Engineer',
      designation: 'Principal SRE',
      email: 'zoe.zhang@worksphere.io',
      phone: '+1 415 555 0184',
      location: 'San Francisco, USA Hub',
      avatarColor: '#6366f1',
      experience: '9+ Years',
      availability: 'Available',
      skills: ['AWS', 'Terraform', 'Kubernetes', 'Prometheus', 'Chaos Engineering'],
    },
    {
      id: 'EMP-0177',
      name: 'Liam O’Connor',
      currentDepartment: 'Quality Assurance',
      defaultRole: 'Lead SDET & Automation Engineer',
      designation: 'Lead QA Architect',
      email: 'liam.oconnor@worksphere.io',
      phone: '+353 1 496 0192',
      location: 'Dublin, Ireland',
      avatarColor: '#14b8a6',
      experience: '6+ Years',
      availability: 'Available',
      skills: ['Cypress', 'Playwright', 'Jest', 'Load Testing', 'GitHub Actions'],
    },
    {
      id: 'EMP-0178',
      name: 'Arjun Mehta',
      currentDepartment: 'IT & Technology Platform',
      defaultRole: 'AI & Machine Learning Engineer',
      designation: 'MLOps Specialist',
      email: 'arjun.mehta@worksphere.io',
      phone: '+91 98450 99001',
      location: 'Bangalore, India (HQ)',
      avatarColor: '#f43f5e',
      experience: '4+ Years',
      availability: 'Available',
      skills: ['Python', 'PyTorch', 'FastAPI', 'LLM Fine-tuning', 'Vector DBs'],
    },
    {
      id: 'EMP-0179',
      name: 'Sneha Reddy',
      currentDepartment: 'Cybersecurity & IAM',
      defaultRole: 'Cloud & SecOps Specialist',
      designation: 'Security Analyst',
      email: 'sneha.reddy@worksphere.io',
      phone: '+91 98450 44556',
      location: 'Hyderabad, India',
      avatarColor: '#10b981',
      experience: '5+ Years',
      availability: 'Available',
      skills: ['SOC2', 'Penetration Testing', 'Vault', 'Zero Trust', 'SIEM'],
    },
    {
      id: 'EMP-0180',
      name: 'Vikram Malhotra',
      currentDepartment: 'Mobile Engineering',
      defaultRole: 'Mobile Applications Developer',
      designation: 'Senior Mobile Engineer',
      email: 'vikram.malhotra@worksphere.io',
      phone: '+91 98450 88776',
      location: 'Bangalore, India (HQ)',
      avatarColor: '#0ea5e9',
      experience: '5+ Years',
      availability: 'Partial Bandwidth',
      skills: ['Flutter', 'Dart', 'iOS/Android', 'SQLite', 'Offline Sync'],
    },
  ];

  // Real-time Corporate Employee Directory Pool
  directoryPool: ExtendedDirectoryEmployee[] = [];
  filteredDirectory: ExtendedDirectoryEmployee[] = [];
  paginatedDirectory: ExtendedDirectoryEmployee[] = [];

  // Pagination State
  currentPage: number = 1;
  pageSize: number = 10;

  // Directory Search & Filters
  directorySearchQuery: string = '';
  directoryDepartmentFilter: string = 'ALL';
  directoryAvailabilityFilter: string = 'ALL';

  // Draft filter models for explicit Apply / Reset action
  draftSearchQuery: string = '';
  draftDepartmentFilter: string = 'ALL';
  draftAvailabilityFilter: string = 'ALL';
  activeFilterChips: ActiveFilterChip[] = [];

  // Synchronously populated Dropdown Options for Reusable Input Fields
  departmentOptions: InputDropdownOption[] = [
    { label: 'Engineering & Software Development', value: 'Engineering & Software Development' },
    { label: 'Quality Assurance & Testing', value: 'Quality Assurance & Testing' },
    { label: 'UI/UX & Product Design', value: 'UI/UX & Product Design' },
    { label: 'Product Management', value: 'Product Management' },
    { label: 'DevOps & Cloud Infrastructure', value: 'DevOps & Cloud Infrastructure' },
    { label: 'IT Support & Administration', value: 'IT Support & Administration' },
    { label: 'Cybersecurity & Information Security', value: 'Cybersecurity & Information Security' },
    { label: 'Data Engineering & Analytics', value: 'Data Engineering & Analytics' },
    { label: 'Artificial Intelligence & Machine Learning', value: 'Artificial Intelligence & Machine Learning' },
    { label: 'IT & Technology Platform', value: 'IT & Technology Platform' },
    { label: 'Core Web Platform', value: 'Core Web Platform' },
    { label: 'Platform Services', value: 'Platform Services' },
  ];
  podOptions: InputDropdownOption[] = [];
  leadOptions: InputDropdownOption[] = [
    { label: 'Rohan Sharma (EMP-0142) - Senior Backend Engineer', value: 'Rohan Sharma (EMP-0142) - Senior Backend Engineer' },
    { label: 'Maya Lin (EMP-0172) - UI Platform Specialist', value: 'Maya Lin (EMP-0172) - UI Platform Specialist' },
    { label: 'Carlos Rivera (EMP-0173) - Design Systems Lead', value: 'Carlos Rivera (EMP-0173) - Design Systems Lead' },
    { label: 'Aisha Patel (EMP-0174) - Staff Engineer (L6)', value: 'Aisha Patel (EMP-0174) - Staff Engineer (L6)' },
    { label: 'Samuel Kim (EMP-0175) - Cloud Security Specialist', value: 'Samuel Kim (EMP-0175) - Cloud Security Specialist' },
    { label: 'Zoe Zhang (EMP-0176) - Principal SRE', value: 'Zoe Zhang (EMP-0176) - Principal SRE' },
  ];
  projectOptions: InputDropdownOption[] = [
    { label: 'WorkSphere Enterprise Core v2.4', value: 'WorkSphere Enterprise Core v2.4' },
    { label: 'Employee Self-Service Mobile Application', value: 'Employee Self-Service Mobile Application' },
    { label: 'WorkSphere Compliance & Audit Engine', value: 'WorkSphere Compliance & Audit Engine' },
    { label: 'Real-time Analytics & BI Dashboard', value: 'Real-time Analytics & BI Dashboard' },
    { label: 'Global Payroll & Tax Engine 2026', value: 'Global Payroll & Tax Engine 2026' },
  ];
  readonly workModeOptions: InputDropdownOption[] = [
    { label: 'On-site (HQ Office)', value: 'On-site HQ' },
    { label: 'Hybrid (3 Days Office / 2 Days Remote)', value: 'Hybrid' },
    { label: 'Full Remote', value: 'Remote' },
  ];
  directoryDepartmentOptions: InputDropdownOption[] = [
    { label: 'All Departments', value: 'ALL' },
    { label: 'Engineering & Software Development', value: 'Engineering & Software Development' },
    { label: 'Quality Assurance & Testing', value: 'Quality Assurance & Testing' },
    { label: 'UI/UX & Product Design', value: 'UI/UX & Product Design' },
    { label: 'Product Management', value: 'Product Management' },
    { label: 'DevOps & Cloud Infrastructure', value: 'DevOps & Cloud Infrastructure' },
    { label: 'IT Support & Administration', value: 'IT Support & Administration' },
    { label: 'Cybersecurity & Information Security', value: 'Cybersecurity & Information Security' },
    { label: 'Data Engineering & Analytics', value: 'Data Engineering & Analytics' },
    { label: 'Artificial Intelligence & Machine Learning', value: 'Artificial Intelligence & Machine Learning' },
    { label: 'IT & Technology Platform', value: 'IT & Technology Platform' },
    { label: 'Core Web Platform', value: 'Core Web Platform' },
    { label: 'Platform Services', value: 'Platform Services' },
  ];
  readonly directoryAvailabilityOptions: InputDropdownOption[] = [
    { label: 'All Bandwidths', value: 'ALL' },
    { label: 'Available (100%)', value: 'Available' },
    { label: 'Partial Bandwidth (50%)', value: 'Partial Bandwidth' },
    { label: 'On Bench', value: 'Bench' },
  ];

  // ==========================================================================
  // REQUIRED TEAM ALLOCATION PARAMETERS
  // ==========================================================================
  targetDepartment: string = 'Engineering & Software Development';
  targetTeamPod: string = 'Frontend Web Architecture Pod';
  teamId: string = 'TEAM-IT-101';
  teamLeadAssigned: string = 'Rohan Sharma (EMP-0142) - Senior Backend Engineer';
  startDate: string = '2026-10-26';
  endDate: string = '2027-04-30';
  assignedProjects: string = 'WorkSphere Enterprise Core v2.4';
  workMode: 'On-site HQ' | 'Hybrid' | 'Remote' = 'On-site HQ';
  allocationPercentage: number = 100;

  // Selected Employee(s)
  selectedEmployee: ExtendedDirectoryEmployee = {
    id: '',
    name: 'Select Employee',
    currentDepartment: '',
    defaultRole: '',
    designation: '',
    email: '',
    phone: '',
    location: '',
    avatarColor: '#10b981',
    experience: '3+ Years',
    availability: 'Available',
    skills: [],
    allocationStatus: 'Available',
  };
  selectedEmployeeIds: Set<string> = new Set<string>();

  // Pod to Default Team ID Mapping
  readonly podTeamIds: Record<string, string> = {
    'Frontend Web Architecture Pod': 'TEAM-IT-101',
    'Backend Microservices Pod': 'TEAM-IT-102',
    'Cloud Infrastructure & DevOps (SRE) Pod': 'TEAM-IT-103',
    'Quality Assurance & Test Automation Pod': 'TEAM-IT-104',
    'Mobile Applications Engineering Pod': 'TEAM-IT-105',
    'Cybersecurity & IAM Pod': 'TEAM-IT-106',
    'Data Platform & Analytics Pod': 'TEAM-IT-107',
    'AI & Machine Learning Engineering Pod': 'TEAM-IT-108',
    'API Gateway & Platform Services Pod': 'TEAM-IT-109',
    'IT Operations & Enterprise Support Pod': 'TEAM-IT-110',
    'UI Components & Design System Pod': 'TEAM-WEB-102',
    'Client SDK & Performance Pod': 'TEAM-WEB-103',
    'Database Reliability Pod': 'TEAM-DATA-101',
    'Kafka Stream Ingestion Pod': 'TEAM-DATA-102',
    'Data Warehouse & ETL Pod': 'TEAM-DATA-103',
    'Design Systems & Tokens Pod': 'TEAM-DSGN-101',
    'UX Discovery & Research Pod': 'TEAM-DSGN-102',
    'Interactive Prototyping Squad': 'TEAM-DSGN-103',
    'Core Auth & RBAC Pod': 'TEAM-PLAT-101',
    'Payroll Automation Engine Pod': 'TEAM-PLAT-102',
    'API Gateway & Event Streaming Pod': 'TEAM-PLAT-103',
    'Regression Automation Pod': 'TEAM-QA-101',
    'Performance & Load Testing Pod': 'TEAM-QA-102',
    'Security & Penetration Verification Pod': 'TEAM-QA-103',
    'Flutter Core Experience Pod': 'TEAM-MOB-101',
    'Offline Sync & SQLite Pod': 'TEAM-MOB-102',
    'Biometrics & Hardware Sync Pod': 'TEAM-MOB-103',
    'Zero-Trust Policy Pod': 'TEAM-SEC-101',
    'OAuth2/SAML Federation Pod': 'TEAM-SEC-102',
    'Annual SOC2 Audit Operations Pod': 'TEAM-SEC-103',
  };

  // Department Pods
  readonly teamPods: Record<string, string[]> = {
    'Engineering & Software Development': [
      'Frontend Web Architecture Pod',
      'Backend Microservices Pod',
      'Core Architecture Pod',
      'Client SDK & Performance Pod',
    ],
    'Quality Assurance & Testing': [
      'Regression Automation Pod',
      'Performance & Load Testing Pod',
      'Security & Penetration Verification Pod',
    ],
    'UI/UX & Product Design': [
      'Design Systems & Tokens Pod',
      'UX Discovery & Research Pod',
      'Interactive Prototyping Squad',
    ],
    'Product Management': [
      'Product Strategy Pod',
      'Feature Discovery Squad',
      'Customer Journey Pod',
    ],
    'DevOps & Cloud Infrastructure': [
      'Cloud Infrastructure & DevOps (SRE) Pod',
      'CI/CD Platform Pod',
      'Site Reliability Pod',
    ],
    'IT Support & Administration': [
      'IT Operations & Enterprise Support Pod',
      'Hardware & Helpdesk Pod',
      'Network Engineering Pod',
    ],
    'Cybersecurity & Information Security': [
      'Zero-Trust Policy Pod',
      'OAuth2/SAML Federation Pod',
      'Annual SOC2 Audit Operations Pod',
    ],
    'Data Engineering & Analytics': [
      'Database Reliability Pod',
      'Kafka Stream Ingestion Pod',
      'Data Warehouse & ETL Pod',
    ],
    'Artificial Intelligence & Machine Learning': [
      'AI & Machine Learning Engineering Pod',
      'LLM Platform Squad',
      'MLOps Pipeline Pod',
    ],
    'IT & Technology Platform': [
      'Frontend Web Architecture Pod',
      'Backend Microservices Pod',
      'Cloud Infrastructure & DevOps (SRE) Pod',
      'Quality Assurance & Test Automation Pod',
      'Mobile Applications Engineering Pod',
      'Cybersecurity & IAM Pod',
      'Data Platform & Analytics Pod',
      'AI & Machine Learning Engineering Pod',
      'API Gateway & Platform Services Pod',
      'IT Operations & Enterprise Support Pod',
    ],
    'Core Web Platform': [
      'Frontend Web Architecture Pod',
      'UI Components & Design System Pod',
      'Client SDK & Performance Pod',
    ],
    'Data Platform': [
      'Database Reliability Pod',
      'Kafka Stream Ingestion Pod',
      'Data Warehouse & ETL Pod',
    ],
    'Product Design': [
      'Design Systems & Tokens Pod',
      'UX Discovery & Research Pod',
      'Interactive Prototyping Squad',
    ],
    'Platform Services': [
      'Core Auth & RBAC Pod',
      'Payroll Automation Engine Pod',
      'API Gateway & Event Streaming Pod',
    ],
    'Quality Assurance': [
      'Regression Automation Pod',
      'Performance & Load Testing Pod',
      'Security & Penetration Verification Pod',
    ],
    'Mobile Engineering': [
      'Flutter Core Experience Pod',
      'Offline Sync & SQLite Pod',
      'Biometrics & Hardware Sync Pod',
    ],
    'Cybersecurity & IAM': [
      'Zero-Trust Policy Pod',
      'OAuth2/SAML Federation Pod',
      'Annual SOC2 Audit Operations Pod',
    ],
  };

  departments: string[] = [];
  reportingLeadsList: string[] = [];
  projectsList: string[] = [];
  currentTeamMemberIds: Set<string> = new Set<string>();
  isSubmitting: boolean = false;

  ngOnInit(): void {
    this.initTableColumns();
    this.directoryPool = [...this.defaultCandidates];

    // Load Departments
    this.dropdownService.dropdowns$.subscribe((dropdowns) => {
      if (dropdowns.departments?.length) {
        this.departments = dropdowns.departments.map((d) => d.name);
        this.departmentOptions = this.departments.map((d) => ({ label: d, value: d }));
        this.directoryDepartmentOptions = [
          { label: 'All Departments', value: 'ALL' },
          ...this.departments.map((d) => ({ label: d, value: d })),
        ];
        const deptExists = this.departmentOptions.some((opt) => opt.value === this.targetDepartment);
        if (!deptExists && this.departmentOptions.length > 0) {
          this.targetDepartment = String(this.departmentOptions[0].value);
        }
        this.updatePodOptions();
      }
    });

    // Load Projects
    this.projectService.projects$.subscribe((projects) => {
      if (projects && projects.length > 0) {
        this.projectsList = projects.map((p) => p.title);
        this.projectOptions = this.projectsList.map((p) => ({ label: p, value: p }));
        const projectExists = this.projectOptions.some((opt) => opt.value === this.assignedProjects);
        if (!projectExists && this.projectOptions.length > 0) {
          this.assignedProjects = String(this.projectOptions[0].value);
        }
      }
    });

    // Load Directory
    this.directoryService.employees$.subscribe((list) => {
      if (list && list.length > 0) {
        const colors = ['#10b981', '#8b5cf6', '#0ea5e9', '#f59e0b', '#ec4899', '#6366f1'];
        this.directoryPool = list.map((emp, idx) => ({
          id: emp.employeeCode || emp.id,
          name: emp.name || 'Employee',
          currentDepartment: emp.department || 'Engineering & Software Development',
          defaultRole: emp.role || 'Senior Software Engineer',
          designation: emp.role || 'Senior Software Engineer',
          email: emp.email,
          phone: emp.phone || '+91 98765 00000',
          location: emp.location || 'Corporate HQ',
          avatarColor: colors[idx % colors.length],
          experience: '4+ Years',
          availability: 'Available',
          skills: ['TypeScript', 'Angular', 'Enterprise Architecture'],
          allocationStatus: this.teamAllocatedMemberIds.has(emp.employeeCode || emp.id) ? 'In Team' : 'Available',
          currentTeam: this.teamAllocatedMemberIds.has(emp.employeeCode || emp.id) ? this.targetTeamPod : undefined,
        }));
      } else {
        this.directoryPool = [...this.defaultCandidates];
      }

      this.reportingLeadsList = this.directoryPool.map(
        (e) => `${e.name} (${e.id}) - ${e.designation}`
      );
      this.leadOptions = this.reportingLeadsList.map((l) => ({ label: l, value: l }));

      const leadExists = this.leadOptions.some((opt) => opt.value === this.teamLeadAssigned);
      if (!leadExists && this.leadOptions.length > 0) {
        this.teamLeadAssigned = String(this.leadOptions[0].value);
      }

      if (this.directoryPool.length > 0 && !this.selectedEmployee.id) {
        this.selectedEmployee = this.directoryPool[0];
        this.selectedEmployeeIds = new Set<string>([this.directoryPool[0].id]);
      }

      this.applyDirectoryFilter();
    });

    this.directoryService.refreshDirectory();

    // Track existing team members
    this.teamService.members$.subscribe((existing) => {
      this.currentTeamMemberIds = new Set((existing || []).map((m) => m.id));
    });
    this.refreshCurrentTeamMembers();
    this.updateTeamId();
    this.updatePodOptions();
    this.applyDirectoryFilter();
  }

  private initTableColumns(): void {
    this.tableColumns = [
      {
        field: 'select',
        headerName: 'Select',
        width: 75,
        minWidth: 70,
        maxWidth: 80,
        cellTemplate: this.selectTpl,
      },
      {
        field: 'id',
        headerName: 'Employee ID',
        width: 140,
        minWidth: 130,
        maxWidth: 160,
        cellTemplate: this.idTpl,
      },
      {
        field: 'name',
        headerName: 'Employee Name',
        width: 210,
        minWidth: 180,
        cellTemplate: this.employeeTpl,
      },
      {
        field: 'location',
        headerName: 'Location',
        width: 180,
        minWidth: 160,
        cellTemplate: this.locationTpl,
      },
      {
        field: 'email',
        headerName: 'Email',
        width: 260,
        minWidth: 230,
        cellTemplate: this.emailTpl,
      },
      {
        field: 'currentDepartment',
        headerName: 'Department',
        width: 280,
        minWidth: 250,
        cellTemplate: this.deptTpl,
      },
      {
        field: 'designation',
        headerName: 'Designation',
        width: 220,
        minWidth: 190,
        cellTemplate: this.designationTpl,
      },
      {
        field: 'defaultRole',
        headerName: 'Role',
        width: 200,
        minWidth: 170,
        cellTemplate: this.roleTpl,
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
        width: 80,
        minWidth: 80,
        maxWidth: 90,
        cellTemplate: this.actionsTpl,
      },
    ];
  }

  refreshCurrentTeamMembers(): void {
    const existing = this.teamService.getTeamMembers();
    this.currentTeamMemberIds = new Set(existing.map((m) => m.id));
  }

  get availablePods(): string[] {
    return (
      this.teamPods[this.targetDepartment] || [
        'Frontend Web Architecture Pod',
        'Backend Microservices Pod',
        'Cloud Infrastructure & DevOps (SRE) Pod',
      ]
    );
  }

  updatePodOptions(): void {
    const pods = this.availablePods;
    this.podOptions = pods.map((p) => ({ label: p, value: p }));
    if (pods.length > 0 && !pods.includes(this.targetTeamPod)) {
      this.targetTeamPod = pods[0];
    }
    this.updateTeamId();
  }

  applyDirectoryFilter(): void {
    let result = [...this.directoryPool];

    // 1. Department Filter
    if (this.directoryDepartmentFilter !== 'ALL') {
      result = result.filter((e) => e.currentDepartment === this.directoryDepartmentFilter);
    }

    // 2. Availability Filter
    if (this.directoryAvailabilityFilter !== 'ALL') {
      result = result.filter((e) => e.availability === this.directoryAvailabilityFilter);
    }

    // 3. Search Query
    if (this.directorySearchQuery.trim()) {
      const q = this.directorySearchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.defaultRole.toLowerCase().includes(q) ||
          e.currentDepartment.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    this.filteredDirectory = result;
    this.currentPage = 1;
    this.updatePaginatedData();
  }

  updatePaginatedData(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedDirectory = this.filteredDirectory.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedData();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updatePaginatedData();
  }

  isEmployeeInTeam(empId: string): boolean {
    return this.teamAllocatedMemberIds.has(empId);
  }

  onDepartmentChange(): void {
    this.updatePodOptions();
  }

  onPodChange(): void {
    this.updateTeamId();
  }

  updateTeamId(): void {
    this.teamId =
      this.podTeamIds[this.targetTeamPod] || `TEAM-${Math.floor(100 + Math.random() * 900)}`;
  }

  applyFilters(): void {
    this.directorySearchQuery = this.draftSearchQuery;
    this.directoryDepartmentFilter = this.draftDepartmentFilter;
    this.directoryAvailabilityFilter = this.draftAvailabilityFilter;
    this.updateActiveFilterChips();
    this.applyDirectoryFilter();
  }

  resetFilters(): void {
    this.draftSearchQuery = '';
    this.draftDepartmentFilter = 'ALL';
    this.draftAvailabilityFilter = 'ALL';
    this.directorySearchQuery = '';
    this.directoryDepartmentFilter = 'ALL';
    this.directoryAvailabilityFilter = 'ALL';
    this.activeFilterChips = [];
    this.applyDirectoryFilter();
  }

  removeFilterChip(key: 'search' | 'department' | 'availability'): void {
    if (key === 'search') {
      this.draftSearchQuery = '';
      this.directorySearchQuery = '';
    } else if (key === 'department') {
      this.draftDepartmentFilter = 'ALL';
      this.directoryDepartmentFilter = 'ALL';
    } else if (key === 'availability') {
      this.draftAvailabilityFilter = 'ALL';
      this.directoryAvailabilityFilter = 'ALL';
    }
    this.updateActiveFilterChips();
    this.applyDirectoryFilter();
  }

  updateActiveFilterChips(): void {
    const chips: ActiveFilterChip[] = [];
    if (this.directorySearchQuery.trim()) {
      chips.push({
        key: 'search',
        label: `Search: "${this.directorySearchQuery.trim()}"`,
        icon: 'bi-search',
      });
    }
    if (this.directoryDepartmentFilter !== 'ALL') {
      chips.push({
        key: 'department',
        label: `Dept: ${this.directoryDepartmentFilter}`,
        icon: 'bi-building',
      });
    }
    if (this.directoryAvailabilityFilter !== 'ALL') {
      chips.push({
        key: 'availability',
        label: `Bandwidth: ${this.directoryAvailabilityFilter}`,
        icon: 'bi-speedometer',
      });
    }
    this.activeFilterChips = chips;
  }

  resetDirectoryFilters(): void {
    this.resetFilters();
  }

  selectEmployee(emp: ExtendedDirectoryEmployee): void {
    this.selectedEmployee = emp;
    this.selectedEmployeeIds.clear();
    this.selectedEmployeeIds.add(emp.id);
  }

  toggleSelectEmployee(emp: ExtendedDirectoryEmployee, event?: Event): void {
    if (event) event.stopPropagation();

    if (this.selectedEmployeeIds.has(emp.id)) {
      this.selectedEmployeeIds.delete(emp.id);
      if (this.selectedEmployee.id === emp.id) {
        const nextId = Array.from(this.selectedEmployeeIds)[0];
        const nextEmp = this.directoryPool.find((e) => e.id === nextId);
        if (nextEmp) this.selectedEmployee = nextEmp;
      }
    } else {
      this.selectedEmployeeIds.add(emp.id);
      this.selectedEmployee = emp;
    }
  }

  get isAllSelected(): boolean {
    return (
      this.filteredDirectory.length > 0 &&
      this.filteredDirectory.every((emp) => this.selectedEmployeeIds.has(emp.id))
    );
  }

  toggleSelectAll(): void {
    if (this.isAllSelected) {
      this.filteredDirectory.forEach((emp) => this.selectedEmployeeIds.delete(emp.id));
    } else {
      this.filteredDirectory.forEach((emp) => this.selectedEmployeeIds.add(emp.id));
    }
  }

  clearAllSelections(): void {
    this.selectedEmployeeIds.clear();
  }

  // ==========================================================================
  // ROW ACTIONS (DROPDOWN MENU)
  // ==========================================================================
  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeActionMenu();
  }

  toggleActionMenu(empId: string, event: Event): void {
    event.stopPropagation();
    this.activeActionsRowId = this.activeActionsRowId === empId ? null : empId;
  }

  closeActionMenu(): void {
    this.activeActionsRowId = null;
  }

  // 1. Allocate directly to current team
  allocateEmployeeDirectly(emp: ExtendedDirectoryEmployee): void {
    this.closeActionMenu();
    this.teamAllocatedMemberIds.add(emp.id);
    emp.allocationStatus = 'In Team';
    emp.currentTeam = this.targetTeamPod;
    emp.availability = 'Allocated';
    this.toaster.show({
      variant: 'success',
      title: 'Member Allocated',
      message: `${emp.name} (${emp.id}) has been allocated to ${this.targetTeamPod}.`,
      durationMs: 3500,
    });
    this.applyDirectoryFilter();
  }

  // 2. Move to Bench
  moveToBench(emp: ExtendedDirectoryEmployee): void {
    this.closeActionMenu();
    this.teamAllocatedMemberIds.delete(emp.id);
    this.selectedEmployeeIds.delete(emp.id);
    emp.allocationStatus = 'Bench';
    emp.availability = 'Bench';
    emp.currentTeam = 'Bench / Talent Pool';
    this.toaster.show({
      variant: 'warning',
      title: 'Moved to Bench',
      message: `${emp.name} (${emp.id}) has been placed on the Bench pool.`,
      durationMs: 3500,
    });
    this.applyDirectoryFilter();
  }

  // 3. Remove from Team
  removeFromTeam(emp: ExtendedDirectoryEmployee): void {
    this.closeActionMenu();
    this.teamAllocatedMemberIds.delete(emp.id);
    emp.allocationStatus = 'Available';
    emp.availability = 'Available';
    emp.currentTeam = undefined;
    this.toaster.show({
      variant: 'info',
      title: 'Released from Team',
      message: `${emp.name} (${emp.id}) has been released and is now available in directory.`,
      durationMs: 3500,
    });
    this.applyDirectoryFilter();
  }

  // 4. Move to Other Team (Modal Flow)
  openTransferModal(emp: ExtendedDirectoryEmployee): void {
    this.closeActionMenu();
    this.transferringEmployee = emp;
    this.transferTargetDepartment = emp.currentDepartment || this.targetDepartment;
    this.updateTransferPodOptions();
    this.transferReason = 'Cross-functional workload rebalancing';
    this.isTransferModalOpen = true;
  }

  updateTransferPodOptions(): void {
    const pods = this.teamPods[this.transferTargetDepartment] || [
      'Frontend Web Architecture Pod',
      'Backend Microservices Pod',
      'Cloud Infrastructure & DevOps (SRE) Pod',
    ];
    this.transferPodOptions = pods.map((p) => ({ label: p, value: p }));
    this.transferTargetPod = pods[0] || 'Core Architecture Pod';
  }

  confirmTransfer(): void {
    if (!this.transferringEmployee) return;
    const emp = this.transferringEmployee;
    this.teamAllocatedMemberIds.delete(emp.id);
    emp.allocationStatus = 'In Team';
    emp.currentDepartment = this.transferTargetDepartment;
    emp.currentTeam = this.transferTargetPod;
    emp.availability = 'Allocated';

    this.toaster.show({
      variant: 'info',
      title: 'Transfer Completed',
      message: `${emp.name} (${emp.id}) successfully transferred to ${this.transferTargetPod}.`,
      durationMs: 3500,
    });

    this.isTransferModalOpen = false;
    this.transferringEmployee = null;
    this.applyDirectoryFilter();
  }

  // 5. Bulk Actions
  allocateSelectedEmployees(): void {
    if (this.selectedEmployeeIds.size === 0) return;
    const count = this.selectedEmployeeIds.size;
    this.directoryPool.forEach((emp) => {
      if (this.selectedEmployeeIds.has(emp.id)) {
        this.teamAllocatedMemberIds.add(emp.id);
        emp.allocationStatus = 'In Team';
        emp.currentTeam = this.targetTeamPod;
        emp.availability = 'Allocated';
      }
    });
    this.selectedEmployeeIds.clear();
    this.toaster.show({
      variant: 'success',
      title: 'Batch Allocation Complete',
      message: `${count} employees allocated to ${this.targetTeamPod} successfully!`,
      durationMs: 3500,
    });
    this.applyDirectoryFilter();
  }

  bulkMoveToBench(): void {
    if (this.selectedEmployeeIds.size === 0) return;
    const count = this.selectedEmployeeIds.size;
    this.directoryPool.forEach((emp) => {
      if (this.selectedEmployeeIds.has(emp.id)) {
        this.teamAllocatedMemberIds.delete(emp.id);
        emp.allocationStatus = 'Bench';
        emp.availability = 'Bench';
        emp.currentTeam = 'Bench / Talent Pool';
      }
    });
    this.selectedEmployeeIds.clear();
    this.toaster.show({
      variant: 'warning',
      title: 'Batch Moved to Bench',
      message: `${count} employees moved to the Bench talent pool.`,
      durationMs: 3500,
    });
    this.applyDirectoryFilter();
  }

  getSelectedCount(): number {
    return this.selectedEmployeeIds.size;
  }

  getSelectedTargetLabel(): string {
    if (this.selectedEmployeeIds.size === 1) {
      return `${this.selectedEmployee.name} (${this.selectedEmployee.id})`;
    }
    if (this.selectedEmployeeIds.size > 1) {
      return `${this.selectedEmployeeIds.size} Members`;
    }
    return '0 Members';
  }

  // ==========================================================================
  // FINAL PRIMARY ACTION: "ADD MEMBER"
  // ==========================================================================
  onFinalAddMember(): void {
    if (this.selectedEmployeeIds.size === 0) return;

    this.isSubmitting = true;

    setTimeout(() => {
      let addedNames: string[] = [];

      this.directoryPool.forEach((emp) => {
        if (this.selectedEmployeeIds.has(emp.id) && !this.isEmployeeInTeam(emp.id)) {
          this.teamService.addEmployee({
            id: emp.id,
            name: emp.name,
            role: emp.defaultRole,
            designation: emp.designation,
            department: this.targetDepartment,
            email: emp.email,
            phone: emp.phone,
            location: emp.location,
            avatarColor: emp.avatarColor,
            employmentType: 'Full-Time',
            skills: [...emp.skills],
            projects: [
              {
                code: this.teamId,
                title: this.assignedProjects,
                role: emp.defaultRole,
                progressPercent: 20,
              },
            ],
            bio: `Allocated to ${this.targetTeamPod} (${this.teamId}) under ${this.targetDepartment} by ${this.teamLeadAssigned}. Duration: ${this.startDate} to ${this.endDate} (${this.workMode}, ${this.allocationPercentage}% allocation). Active on ${this.assignedProjects}.`,
          });
          this.currentTeamMemberIds.add(emp.id);
          addedNames.push(emp.name);
        }
      });

      this.isSubmitting = false;
      const count = addedNames.length;
      const label = count > 1 ? `${count} members` : addedNames[0];

      this.toaster.show({
        title: 'Team Allocation Confirmed',
        message: `Successfully allocated ${label} into ${this.targetTeamPod} [${this.teamId}].`,
        variant: 'success',
        icon: 'bi-person-check-fill',
      });

      // Auto redirect to team management roster
      setTimeout(() => {
        this.router.navigate(['/employee/team-management']);
      }, 1000);
    }, 550);
  }

  getInitials(name?: string): string {
    if (!name) return 'EMP';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
}
