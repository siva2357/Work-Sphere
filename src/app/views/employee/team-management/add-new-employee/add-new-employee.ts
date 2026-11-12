import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TeamService } from '../../../../core/services/team.service';
import { CompanyDirectoryService } from '../../../../core/services/company-directory.service';
import { DropdownService } from '../../../../core/services/dropdown.service';
import { ProjectService } from '../../../../core/services/project.service';
import { DirectoryEmployeeOption } from '../../../../core/models/task-project-team.interface';

export type { DirectoryEmployeeOption } from '../../../../core/models/task-project-team.interface';

@Component({
  selector: 'app-add-new-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-new-employee.html',
  styleUrl: './add-new-employee.css',
})
export class AddNewEmployee implements OnInit {
  // Real-time Corporate Employee Directory Pool from Backend Database
  directoryPool: DirectoryEmployeeOption[] = [];

  // Directory Search & Filters
  directorySearchQuery: string = '';
  directoryDepartmentFilter: string = 'ALL';
  directoryAvailabilityFilter: string = 'ALL';

  // ==========================================================================
  // REQUIRED TEAM ALLOCATION PARAMETERS
  // (Team ID, Team Lead Assigned, Start Date, End Date, Assigned Projects, Work Mode, Allocation)
  // ==========================================================================
  targetDepartment: string = 'IT & Technology Platform';
  targetTeamPod: string = 'Frontend Web Architecture Pod';
  teamId: string = 'TEAM-IT-101';
  teamLeadAssigned: string = 'Priya Patel (EMP-0135) - Lead Architect';
  startDate: string = '2026-10-26';
  endDate: string = '2027-04-30';
  assignedProjects: string = 'WorkSphere Enterprise Core v2.4';
  workMode: 'On-site HQ' | 'Hybrid' | 'Remote' = 'On-site HQ';
  allocationPercentage: number = 100;

  // Selected Employee(s)
  selectedEmployee: DirectoryEmployeeOption = {
    id: '',
    name: 'Select Employee',
    currentDepartment: '',
    defaultRole: '',
    designation: '',
    email: '',
    phone: '',
    location: '',
    avatarColor: '#4f46e5',
    experience: '3+ Years',
    availability: 'Available',
    skills: []
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

  // Department Pods (IT Department with 10 Pods)
  readonly teamPods: Record<string, string[]> = {
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

  reportingLeadsList: string[] = [];

  projectsList: string[] = [];

  departments: string[] = [];

  // Track existing members on team roster
  currentTeamMemberIds: Set<string> = new Set<string>();

  // Feedback & Submission State
  isSubmitting: boolean = false;
  successToastMessage: string = '';
  private toastTimer: any;

  constructor(
    private teamService: TeamService,
    private directoryService: CompanyDirectoryService,
    private dropdownService: DropdownService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dropdownService.dropdowns$.subscribe((dropdowns) => {
      if (dropdowns.departments?.length) {
        this.departments = dropdowns.departments.map((d) => d.name);
        if (!this.targetDepartment && this.departments.length > 0) {
          this.targetDepartment = this.departments[0];
        }
      }
    });
    this.projectService.projects$.subscribe((projects) => {
      this.projectsList = (projects || []).map((p) => p.title);
      if (this.projectsList.length > 0 && !this.assignedProjects) {
        this.assignedProjects = this.projectsList[0];
      }
    });
    this.directoryService.employees$.subscribe((list) => {
      const colors = ['#10b981', '#8b5cf6', '#0ea5e9', '#f59e0b', '#ec4899', '#6366f1'];
      this.directoryPool = (list || []).map((emp, idx) => ({
        id: emp.employeeCode || emp.id,
        name: emp.name || 'Employee',
        currentDepartment: emp.department || 'Engineering',
        defaultRole: emp.role || 'Engineer',
        designation: emp.role || 'Engineer',
        email: emp.email,
        phone: emp.phone || '+91 98765 00000',
        location: emp.location || 'Corporate HQ',
        avatarColor: colors[idx % colors.length],
        experience: '4+ Years',
        availability: 'Available',
        skills: ['TypeScript', 'Angular', 'Enterprise Architecture']
      }));
      this.reportingLeadsList = this.directoryPool.map(
        (e) => `${e.name} (${e.id}) - ${e.designation}`
      );
      if (this.reportingLeadsList.length > 0) {
        this.teamLeadAssigned = this.reportingLeadsList[0];
      }
      if (this.directoryPool.length > 0 && !this.selectedEmployee.id) {
        this.selectedEmployee = this.directoryPool[0];
        this.selectedEmployeeIds = new Set<string>([this.directoryPool[0].id]);
      }
    });
    this.directoryService.refreshDirectory();
    this.teamService.members$.subscribe((existing) => {
      this.currentTeamMemberIds = new Set((existing || []).map((m) => m.id));
    });
    this.refreshCurrentTeamMembers();
    this.updateTeamId();
  }

  refreshCurrentTeamMembers(): void {
    const existing = this.teamService.getTeamMembers();
    this.currentTeamMemberIds = new Set(existing.map((m) => m.id));
  }

  get availablePods(): string[] {
    return this.teamPods[this.targetDepartment] || ['General Engineering Pod', 'Special Projects Pod'];
  }

  // Filtered Corporate Employee Directory
  get filteredDirectory(): DirectoryEmployeeOption[] {
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

    return result;
  }

  isEmployeeInTeam(empId: string): boolean {
    return this.currentTeamMemberIds.has(empId);
  }

  // When target department changes, update the pods dropdown & team ID
  onDepartmentChange(): void {
    const pods = this.availablePods;
    if (pods.length > 0) {
      this.targetTeamPod = pods[0];
    }
    this.updateTeamId();
  }

  onPodChange(): void {
    this.updateTeamId();
  }

  updateTeamId(): void {
    this.teamId = this.podTeamIds[this.targetTeamPod] || `TEAM-${Math.floor(100 + Math.random() * 900)}`;
  }

  // Quick reset filters
  resetDirectoryFilters(): void {
    this.directorySearchQuery = '';
    this.directoryDepartmentFilter = 'ALL';
    this.directoryAvailabilityFilter = 'ALL';
  }

  // Select employee by row click
  selectEmployee(emp: DirectoryEmployeeOption): void {
    if (this.isEmployeeInTeam(emp.id)) return;
    this.selectedEmployee = emp;
    this.selectedEmployeeIds.clear();
    this.selectedEmployeeIds.add(emp.id);
  }

  // Toggle selection checkbox
  toggleSelectEmployee(emp: DirectoryEmployeeOption, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.isEmployeeInTeam(emp.id)) return;

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
    return 'Member';
  }

  // ==========================================================================
  // FINAL PRIMARY ACTION: "ADD MEMBER"
  // Allocates selected employee(s) into the configured Team & returns to Roster
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
      this.showToast(`✓ Added ${count > 1 ? count + ' members' : addedNames[0]} to ${this.targetTeamPod} [${this.teamId}]!`);

      // Auto redirect to team management roster
      setTimeout(() => {
        this.router.navigate(['/employee/team-management']);
      }, 900);
    }, 550);
  }

  getInitials(name?: string): string {
    if (!name) return 'EMP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }

  private showToast(msg: string): void {
    this.successToastMessage = msg;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.successToastMessage = '';
    }, 4500);
  }
}
