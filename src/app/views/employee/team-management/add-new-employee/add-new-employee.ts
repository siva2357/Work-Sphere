import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TeamService } from '../../../../core/services/team.service';

export interface DirectoryEmployeeOption {
  id: string;
  name: string;
  currentDepartment: string;
  defaultRole: string;
  designation: string;
  email: string;
  phone: string;
  location: string;
  avatarColor: string;
  experience: string;
  availability: 'Available' | 'Partial Bandwidth' | 'Allocated';
  skills: string[];
}

@Component({
  selector: 'app-add-new-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-new-employee.html',
  styleUrl: './add-new-employee.css',
})
export class AddNewEmployee implements OnInit {
  // Comprehensive Corporate Employee Directory Pool
  readonly directoryPool: DirectoryEmployeeOption[] = [
    {
      id: 'EMP-0172',
      name: 'Maya Lin',
      currentDepartment: 'Core Web Platform',
      defaultRole: 'Senior Angular Engineer',
      designation: 'Senior Software Engineer II',
      email: 'maya.lin@worksphere.io',
      phone: '+1 (555) 349-8120',
      location: 'San Francisco, CA (HQ)',
      avatarColor: '#10b981',
      experience: '5+ Years',
      availability: 'Available',
      skills: ['Angular 17', 'TypeScript', 'RxJS', 'NgRx', 'SCSS'],
    },
    {
      id: 'EMP-0173',
      name: 'Carlos Rivera',
      currentDepartment: 'Product Design',
      defaultRole: 'Senior Product Designer',
      designation: 'Staff UX/UI Designer',
      email: 'carlos.rivera@worksphere.io',
      phone: '+1 (555) 492-9011',
      location: 'New York, NY',
      avatarColor: '#8b5cf6',
      experience: '6 Years',
      availability: 'Available',
      skills: ['Figma', 'Design Tokens', 'User Research', 'Prototyping'],
    },
    {
      id: 'EMP-0174',
      name: 'Elena Rostova',
      currentDepartment: 'IT & Technology Platform',
      defaultRole: 'DevOps & SRE Specialist',
      designation: 'Lead Reliability Engineer',
      email: 'elena.rostova@worksphere.io',
      phone: '+1 (555) 812-7744',
      location: 'Seattle, WA',
      avatarColor: '#0ea5e9',
      experience: '7 Years',
      availability: 'Available',
      skills: ['Kubernetes', 'Docker', 'AWS EKS', 'Terraform', 'CI/CD'],
    },
    {
      id: 'EMP-0175',
      name: 'Samuel Kim',
      currentDepartment: 'Platform Services',
      defaultRole: 'Full Stack Java Engineer',
      designation: 'Senior Backend Engineer',
      email: 'samuel.kim@worksphere.io',
      phone: '+1 (555) 901-3829',
      location: 'Austin, TX',
      avatarColor: '#f59e0b',
      experience: '4+ Years',
      availability: 'Available',
      skills: ['Java 21', 'Spring Boot', 'PostgreSQL', 'Microservices', 'GraphQL'],
    },
    {
      id: 'EMP-0176',
      name: 'Aisha Bello',
      currentDepartment: 'Quality Assurance',
      defaultRole: 'Lead Automation QA Engineer',
      designation: 'Principal Quality Architect',
      email: 'aisha.bello@worksphere.io',
      phone: '+1 (555) 441-2918',
      location: 'San Francisco, CA (HQ)',
      avatarColor: '#ec4899',
      experience: '6+ Years',
      availability: 'Available',
      skills: ['Playwright', 'Cypress', 'Jest', 'CI/CD Regression', 'Jira'],
    },
    {
      id: 'EMP-0177',
      name: 'Kevin Zhao',
      currentDepartment: 'Mobile Engineering',
      defaultRole: 'Cross-Platform Mobile Developer',
      designation: 'Senior Flutter Specialist',
      email: 'kevin.zhao@worksphere.io',
      phone: '+1 (555) 723-9912',
      location: 'Chicago, IL',
      avatarColor: '#6366f1',
      experience: '4 Years',
      availability: 'Available',
      skills: ['Flutter', 'Dart', 'iOS Native', 'Offline SQLite', 'State Mgmt'],
    },
    {
      id: 'EMP-0178',
      name: 'Arjun Mehta',
      currentDepartment: 'IT & Technology Platform',
      defaultRole: 'AI & Machine Learning Engineer',
      designation: 'Staff AI Specialist',
      email: 'arjun.mehta@worksphere.io',
      phone: '+1 (555) 839-2041',
      location: 'Boston, MA',
      avatarColor: '#14b8a6',
      experience: '5 Years',
      availability: 'Available',
      skills: ['Python 3.12', 'PyTorch', 'FastAPI', 'LLM Fine-tuning', 'Vector DBs'],
    },
    {
      id: 'EMP-0179',
      name: 'Sarah O\'Connor',
      currentDepartment: 'Cybersecurity & IAM',
      defaultRole: 'Cloud Security Analyst',
      designation: 'Senior IAM Specialist',
      email: 'sarah.oconnor@worksphere.io',
      phone: '+1 (555) 619-3382',
      location: 'Denver, CO',
      avatarColor: '#f43f5e',
      experience: '5+ Years',
      availability: 'Available',
      skills: ['OAuth2/SAML', 'Zero-Trust', 'AWS KMS', 'Vault', 'SOC2'],
    },
    {
      id: 'EMP-0180',
      name: 'Daniel Vasquez',
      currentDepartment: 'Data Platform',
      defaultRole: 'Database Reliability Engineer',
      designation: 'Principal DB Admin',
      email: 'daniel.vasquez@worksphere.io',
      phone: '+1 (555) 302-8819',
      location: 'Atlanta, GA',
      avatarColor: '#10b981',
      experience: '8 Years',
      availability: 'Partial Bandwidth',
      skills: ['PostgreSQL', 'Redis', 'Kafka', 'CDC Pipelines', 'High Availability'],
    },
    {
      id: 'EMP-0181',
      name: 'Zoe Chen',
      currentDepartment: 'Core Web Platform',
      defaultRole: 'Frontend UI/UX Developer',
      designation: 'Software Engineer II',
      email: 'zoe.chen@worksphere.io',
      phone: '+1 (555) 771-4920',
      location: 'Los Angeles, CA',
      avatarColor: '#8b5cf6',
      experience: '3 Years',
      availability: 'Available',
      skills: ['Angular', 'TypeScript', 'CSS3 Animations', 'Bootstrap 5', 'Figma'],
    },
    {
      id: 'EMP-0182',
      name: 'Michael Thorne',
      currentDepartment: 'IT & Technology Platform',
      defaultRole: 'Microservices Go Engineer',
      designation: 'Senior Backend Developer',
      email: 'michael.thorne@worksphere.io',
      phone: '+1 (555) 489-1172',
      location: 'San Francisco, CA (HQ)',
      avatarColor: '#0ea5e9',
      experience: '5 Years',
      availability: 'Available',
      skills: ['Golang', 'gRPC', 'Docker', 'Kubernetes', 'Distributed Tracing'],
    },
    {
      id: 'EMP-0183',
      name: 'Fatima Al-Mansoor',
      currentDepartment: 'Quality Assurance',
      defaultRole: 'Performance & Load Test Specialist',
      designation: 'Senior QA Analyst',
      email: 'fatima.almansoor@worksphere.io',
      phone: '+1 (555) 923-4418',
      location: 'Austin, TX',
      avatarColor: '#f59e0b',
      experience: '4+ Years',
      availability: 'Available',
      skills: ['k6', 'JMeter', 'Chaos Engineering', 'Grafana', 'REST API Testing'],
    },
  ];

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
  selectedEmployee: DirectoryEmployeeOption = this.directoryPool[0];
  selectedEmployeeIds: Set<string> = new Set<string>([this.directoryPool[0].id]);

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

  readonly reportingLeadsList: string[] = [
    'Priya Patel (EMP-0135) - Lead Architect',
    'David Chen (EMP-0112) - Infrastructure Lead',
    'Alex Rivera (EMP-0128) - Lead UI/UX',
    'Rohan Sharma (EMP-0142) - Platform Services Lead',
    'Neha Sharma (EMP-0150) - QA Automation Lead',
    'Sarah Jenkins (EMP-0104) - IT Engineering Director',
  ];

  readonly projectsList: string[] = [
    'WorkSphere Enterprise Core v2.4',
    'Cloud Infrastructure & Kubernetes',
    'Employee Self-Service Mobile Application',
    'Payroll Automation Engine',
    'AI Candidate Screening Suite',
    'Zero-Trust Security Gateway',
  ];

  departments: string[] = [];

  // Track existing members on team roster
  currentTeamMemberIds: Set<string> = new Set<string>();

  // Feedback & Submission State
  isSubmitting: boolean = false;
  successToastMessage: string = '';
  private toastTimer: any;

  constructor(
    private teamService: TeamService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.departments = this.teamService.availableDepartments;
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
