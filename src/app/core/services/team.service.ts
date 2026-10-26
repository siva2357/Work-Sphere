import { Injectable } from '@angular/core';

export interface LeaveRecord {
  id: string;
  type: 'Casual Leave' | 'Sick Leave' | 'Annual Vacation' | 'Privilege Leave' | 'Work From Home';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedOn: string;
}

export interface EmployeeProjectAssignment {
  code: string;
  title: string;
  role: string;
  progressPercent: number;
}

export interface TeamMemberDetail {
  id: string; // EMP-0135
  name: string;
  role: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  avatarColor: string;
  joinedDate: string;
  status: 'Active' | 'On Leave' | 'Remote' | 'Offline';
  employmentType: 'Full-Time' | 'Contractor' | 'Intern';

  // Attendance Metrics
  attendancePercentage: number;
  totalWorkingDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;

  // Task Metrics
  taskCompletionRate: number;
  totalTasksAssigned: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;

  // Leave Balances & History
  totalLeavesTaken: number;
  remainingCasualLeaves: number;
  remainingSickLeaves: number;
  remainingAnnualLeaves: number;
  leaveHistory: LeaveRecord[];

  // Projects & Expertise
  projects: EmployeeProjectAssignment[];
  skills: string[];
  bio: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private readonly STORAGE_KEY = 'worksphere_team_members';
  private selectedMemberId: string = 'EMP-0135';

  readonly availableDepartments: string[] = [
    'IT & Technology Platform',
    'Core Web Platform',
    'Data Platform',
    'Product Design',
    'Platform Services',
    'Quality Assurance',
    'Mobile Engineering',
    'Cybersecurity & IAM',
  ];

  private readonly defaultTeamMembers: TeamMemberDetail[] = [
    {
      id: 'EMP-0135',
      name: 'Priya Patel',
      role: 'Frontend Engineering Lead',
      designation: 'Senior Lead Angular Architect',
      department: 'Core Web Platform',
      email: 'priya.patel@worksphere.io',
      phone: '+1 (555) 382-9401',
      location: 'San Francisco, CA (HQ)',
      avatarColor: '#10b981',
      joinedDate: '12 Jan 2024',
      status: 'Active',
      employmentType: 'Full-Time',
      attendancePercentage: 97.4,
      totalWorkingDays: 24,
      presentDays: 23,
      lateDays: 1,
      absentDays: 0,
      taskCompletionRate: 95.8,
      totalTasksAssigned: 24,
      completedTasks: 23,
      pendingTasks: 1,
      overdueTasks: 0,
      totalLeavesTaken: 3,
      remainingCasualLeaves: 9,
      remainingSickLeaves: 7,
      remainingAnnualLeaves: 14,
      leaveHistory: [
        {
          id: 'LV-401',
          type: 'Casual Leave',
          startDate: '2026-10-05',
          endDate: '2026-10-06',
          days: 2,
          reason: 'Personal family event & travel',
          status: 'Approved',
          appliedOn: '2026-10-01',
        },
        {
          id: 'LV-388',
          type: 'Sick Leave',
          startDate: '2026-08-14',
          endDate: '2026-08-14',
          days: 1,
          reason: 'Dental appointment & recovery',
          status: 'Approved',
          appliedOn: '2026-08-13',
        },
      ],
      projects: [
        { code: 'PRJ-IT-101', title: 'WorkSphere Enterprise Core v2.4', role: 'Frontend Lead', progressPercent: 72 },
        { code: 'PRJ-IT-103', title: 'Employee Self-Service Mobile App', role: 'UI Architect', progressPercent: 25 },
      ],
      skills: ['Angular 17', 'TypeScript', 'RxJS', 'NgRx State', 'HTML5/SCSS', 'REST API', 'Figma'],
      bio: 'Leading frontend architecture across WorkSphere enterprise modules, specializing in reactive micro-frontends and high-performance SPAs.',
      emergencyContact: {
        name: 'Aarav Patel',
        relationship: 'Spouse',
        phone: '+1 (555) 382-9499',
      },
    },
    {
      id: 'EMP-0112',
      name: 'David Chen',
      role: 'Database & Infrastructure Lead',
      designation: 'Principal Systems & DB Architect',
      department: 'Data Platform',
      email: 'david.chen@worksphere.io',
      phone: '+1 (555) 749-1102',
      location: 'Seattle, WA',
      avatarColor: '#0ea5e9',
      joinedDate: '15 Mar 2023',
      status: 'Active',
      employmentType: 'Full-Time',
      attendancePercentage: 95.8,
      totalWorkingDays: 24,
      presentDays: 23,
      lateDays: 0,
      absentDays: 1,
      taskCompletionRate: 90.5,
      totalTasksAssigned: 21,
      completedTasks: 19,
      pendingTasks: 2,
      overdueTasks: 0,
      totalLeavesTaken: 4,
      remainingCasualLeaves: 8,
      remainingSickLeaves: 6,
      remainingAnnualLeaves: 12,
      leaveHistory: [
        {
          id: 'LV-412',
          type: 'Annual Vacation',
          startDate: '2026-09-10',
          endDate: '2026-09-14',
          days: 4,
          reason: 'Annual family road trip',
          status: 'Approved',
          appliedOn: '2026-08-25',
        },
      ],
      projects: [
        { code: 'PRJ-IT-102', title: 'Cloud Infrastructure & Kubernetes', role: 'Infra Lead', progressPercent: 58 },
        { code: 'PRJ-IT-105', title: 'Payroll Automation Engine', role: 'DB Architect', progressPercent: 68 },
      ],
      skills: ['PostgreSQL', 'AWS EKS', 'Docker', 'Kubernetes', 'Redis', 'Kafka', 'Terraform'],
      bio: 'High-availability data engineer and Kubernetes cluster orchestrator ensuring 99.99% database uptime and real-time streaming.',
      emergencyContact: {
        name: 'Grace Chen',
        relationship: 'Sister',
        phone: '+1 (555) 749-9941',
      },
    },
    {
      id: 'EMP-0128',
      name: 'Alex Rivera',
      role: 'Lead UI/UX Designer',
      designation: 'Staff Product & Design System Lead',
      department: 'Product Design',
      email: 'alex.rivera@worksphere.io',
      phone: '+1 (555) 492-0199',
      location: 'New York, NY',
      avatarColor: '#8b5cf6',
      joinedDate: '01 Nov 2023',
      status: 'Active',
      employmentType: 'Full-Time',
      attendancePercentage: 98.2,
      totalWorkingDays: 24,
      presentDays: 24,
      lateDays: 0,
      absentDays: 0,
      taskCompletionRate: 96.0,
      totalTasksAssigned: 25,
      completedTasks: 24,
      pendingTasks: 1,
      overdueTasks: 0,
      totalLeavesTaken: 2,
      remainingCasualLeaves: 10,
      remainingSickLeaves: 8,
      remainingAnnualLeaves: 16,
      leaveHistory: [
        {
          id: 'LV-392',
          type: 'Casual Leave',
          startDate: '2026-07-20',
          endDate: '2026-07-21',
          days: 2,
          reason: 'Attending Figma Config Design Summit',
          status: 'Approved',
          appliedOn: '2026-07-05',
        },
      ],
      projects: [
        { code: 'PRJ-IT-101', title: 'WorkSphere Enterprise Core v2.4', role: 'Design Lead', progressPercent: 72 },
        { code: 'PRJ-IT-106', title: 'AI Candidate Screening Suite', role: 'Lead UX', progressPercent: 15 },
      ],
      skills: ['Figma', 'Design Systems', 'Micro-interactions', 'User Testing', 'Responsive Web', 'Design Tokens'],
      bio: 'Crafting pixel-perfect human-centered experiences and design token systems that delight enterprise software users globally.',
      emergencyContact: {
        name: 'Carlos Rivera',
        relationship: 'Brother',
        phone: '+1 (555) 492-9011',
      },
    },
    {
      id: 'EMP-0142',
      name: 'Rohan Sharma',
      role: 'Full Stack Java Engineer',
      designation: 'Senior Backend Platform Specialist',
      department: 'Platform Services',
      email: 'rohan.sharma@worksphere.io',
      phone: '+1 (555) 831-2940',
      location: 'Austin, TX',
      avatarColor: '#f59e0b',
      joinedDate: '10 Feb 2024',
      status: 'Remote',
      employmentType: 'Full-Time',
      attendancePercentage: 93.5,
      totalWorkingDays: 24,
      presentDays: 22,
      lateDays: 2,
      absentDays: 0,
      taskCompletionRate: 91.3,
      totalTasksAssigned: 23,
      completedTasks: 21,
      pendingTasks: 2,
      overdueTasks: 0,
      totalLeavesTaken: 5,
      remainingCasualLeaves: 7,
      remainingSickLeaves: 6,
      remainingAnnualLeaves: 11,
      leaveHistory: [
        {
          id: 'LV-425',
          type: 'Casual Leave',
          startDate: '2026-09-01',
          endDate: '2026-09-04',
          days: 4,
          reason: 'Relocation & home setup in Austin',
          status: 'Approved',
          appliedOn: '2026-08-20',
        },
      ],
      projects: [
        { code: 'PRJ-IT-105', title: 'Payroll Automation Engine', role: 'Lead Backend', progressPercent: 68 },
        { code: 'PRJ-IT-101', title: 'WorkSphere Enterprise Core v2.4', role: 'Java API Dev', progressPercent: 72 },
      ],
      skills: ['Java 21', 'Spring Boot 3', 'Microservices', 'GraphQL', 'PostgreSQL', 'RabbitMQ', 'Hibernate'],
      bio: 'Backend architect focused on ultra-reliable transactional payroll microservices and high-throughput enterprise event streams.',
      emergencyContact: {
        name: 'Sunita Sharma',
        relationship: 'Mother',
        phone: '+1 (555) 831-9988',
      },
    },
    {
      id: 'EMP-0150',
      name: 'Neha Sharma',
      role: 'QA Automation Lead',
      designation: 'Staff Quality Assurance Architect',
      department: 'Quality Assurance',
      email: 'neha.sharma@worksphere.io',
      phone: '+1 (555) 604-8291',
      location: 'San Francisco, CA (HQ)',
      avatarColor: '#ec4899',
      joinedDate: '18 Apr 2024',
      status: 'Active',
      employmentType: 'Full-Time',
      attendancePercentage: 96.0,
      totalWorkingDays: 24,
      presentDays: 23,
      lateDays: 1,
      absentDays: 0,
      taskCompletionRate: 94.7,
      totalTasksAssigned: 19,
      completedTasks: 18,
      pendingTasks: 1,
      overdueTasks: 0,
      totalLeavesTaken: 3,
      remainingCasualLeaves: 9,
      remainingSickLeaves: 8,
      remainingAnnualLeaves: 15,
      leaveHistory: [
        {
          id: 'LV-399',
          type: 'Sick Leave',
          startDate: '2026-09-22',
          endDate: '2026-09-23',
          days: 2,
          reason: 'Viral flu recovery',
          status: 'Approved',
          appliedOn: '2026-09-22',
        },
      ],
      projects: [
        { code: 'PRJ-IT-101', title: 'WorkSphere Enterprise Core v2.4', role: 'QA Lead', progressPercent: 72 },
        { code: 'PRJ-IT-106', title: 'AI Candidate Screening Suite', role: 'Automation Engineer', progressPercent: 15 },
      ],
      skills: ['Cypress', 'Playwright', 'Selenium', 'JUnit', 'CI/CD Pipelines', 'Performance Testing', 'Jira'],
      bio: 'Leading automated quality engineering, end-to-end regression testing, and security verification pipelines for core software.',
      emergencyContact: {
        name: 'Amit Sharma',
        relationship: 'Brother',
        phone: '+1 (555) 604-0012',
      },
    },
    {
      id: 'EMP-0164',
      name: 'Vikram Malhotra',
      role: 'Mobile Applications Developer',
      designation: 'Senior Cross-Platform Flutter Engineer',
      department: 'Mobile Engineering',
      email: 'vikram.malhotra@worksphere.io',
      phone: '+1 (555) 291-7402',
      location: 'Chicago, IL',
      avatarColor: '#6366f1',
      joinedDate: '22 May 2024',
      status: 'On Leave',
      employmentType: 'Full-Time',
      attendancePercentage: 91.5,
      totalWorkingDays: 24,
      presentDays: 20,
      lateDays: 0,
      absentDays: 0,
      taskCompletionRate: 85.0,
      totalTasksAssigned: 20,
      completedTasks: 17,
      pendingTasks: 3,
      overdueTasks: 0,
      totalLeavesTaken: 7,
      remainingCasualLeaves: 5,
      remainingSickLeaves: 5,
      remainingAnnualLeaves: 8,
      leaveHistory: [
        {
          id: 'LV-440',
          type: 'Annual Vacation',
          startDate: '2026-10-24',
          endDate: '2026-10-28',
          days: 5,
          reason: 'Family wedding celebrations',
          status: 'Approved',
          appliedOn: '2026-10-10',
        },
      ],
      projects: [
        { code: 'PRJ-IT-103', title: 'Employee Self-Service Mobile App', role: 'Lead Flutter Dev', progressPercent: 25 },
      ],
      skills: ['Flutter', 'Dart', 'iOS/Android Native', 'SQLite', 'Offline Sync', 'Biometric Auth'],
      bio: 'Mobile innovator dedicated to responsive touch experiences, zero-latency offline caching, and biometric hardware sync.',
      emergencyContact: {
        name: 'Kavita Malhotra',
        relationship: 'Wife',
        phone: '+1 (555) 291-8890',
      },
    },
    {
      id: 'EMP-0171',
      name: 'Sneha Reddy',
      role: 'Cloud & SecOps Specialist',
      designation: 'Senior Cloud Security & IAM Architect',
      department: 'Cybersecurity & IAM',
      email: 'sneha.reddy@worksphere.io',
      phone: '+1 (555) 918-3482',
      location: 'San Jose, CA',
      avatarColor: '#14b8a6',
      joinedDate: '05 Aug 2024',
      status: 'Active',
      employmentType: 'Full-Time',
      attendancePercentage: 99.0,
      totalWorkingDays: 24,
      presentDays: 24,
      lateDays: 0,
      absentDays: 0,
      taskCompletionRate: 97.5,
      totalTasksAssigned: 21,
      completedTasks: 20,
      pendingTasks: 1,
      overdueTasks: 0,
      totalLeavesTaken: 1,
      remainingCasualLeaves: 11,
      remainingSickLeaves: 9,
      remainingAnnualLeaves: 17,
      leaveHistory: [
        {
          id: 'LV-405',
          type: 'Casual Leave',
          startDate: '2026-09-15',
          endDate: '2026-09-15',
          days: 1,
          reason: 'Government documentation & passport renewal',
          status: 'Approved',
          appliedOn: '2026-09-10',
        },
      ],
      projects: [
        { code: 'PRJ-IT-104', title: 'Enterprise SSO & Zero-Trust Gateway', role: 'Security Lead', progressPercent: 100 },
        { code: 'PRJ-IT-102', title: 'Cloud Infrastructure & Kubernetes', role: 'SecOps Architect', progressPercent: 58 },
      ],
      skills: ['OAuth2/SAML', 'Zero-Trust IAM', 'AWS KMS', 'HashiCorp Vault', 'Prometheus', 'SOC2 Compliance'],
      bio: 'Security champion guarding enterprise systems against vulnerabilities with zero-trust RBAC and SOC2 compliance.',
      emergencyContact: {
        name: 'Venkatesh Reddy',
        relationship: 'Father',
        phone: '+1 (555) 918-9900',
      },
    },
  ];

  private members: TeamMemberDetail[] = [];

  constructor() {
    this.loadMembers();
  }

  private loadMembers(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          this.members = JSON.parse(stored);
          return;
        } catch {
          // fallback
        }
      }
    }
    this.members = [...this.defaultTeamMembers];
    this.saveMembers();
  }

  private saveMembers(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.members));
      } catch (err) {
        console.error('Failed to save team members', err);
      }
    }
  }

  getTeamMembers(): TeamMemberDetail[] {
    return [...this.members];
  }

  getMemberById(id: string): TeamMemberDetail | undefined {
    return this.members.find((m) => m.id === id) || this.members[0];
  }

  setSelectedMemberId(id: string): void {
    this.selectedMemberId = id;
  }

  getSelectedMemberId(): string {
    return this.selectedMemberId;
  }

  addEmployee(data: {
    id?: string;
    name: string;
    role: string;
    designation: string;
    department: string;
    email: string;
    phone: string;
    location: string;
    avatarColor?: string;
    employmentType: 'Full-Time' | 'Contractor' | 'Intern';
    skills?: string[];
    bio?: string;
    projects?: EmployeeProjectAssignment[];
  }): TeamMemberDetail {
    const nextNum = 172 + this.members.length;
    const assignedId = data.id?.trim() || `EMP-0${nextNum}`;

    const palette = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'];
    const assignedColor = data.avatarColor || palette[Math.floor(Math.random() * palette.length)];

    const newMember: TeamMemberDetail = {
      id: assignedId,
      name: data.name.trim(),
      role: data.role.trim() || 'Software Engineer',
      designation: data.designation.trim() || 'Software Engineer I',
      department: data.department || 'Core Web Platform',
      email: data.email.trim() || `${data.name.toLowerCase().replace(/\s+/g, '.')}@worksphere.io`,
      phone: data.phone.trim() || '+1 (555) 000-1234',
      location: data.location.trim() || 'San Francisco, CA (HQ)',
      avatarColor: assignedColor,
      joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Active',
      employmentType: data.employmentType || 'Full-Time',
      attendancePercentage: 100.0,
      totalWorkingDays: 20,
      presentDays: 20,
      lateDays: 0,
      absentDays: 0,
      taskCompletionRate: 100.0,
      totalTasksAssigned: 5,
      completedTasks: 5,
      pendingTasks: 0,
      overdueTasks: 0,
      totalLeavesTaken: 0,
      remainingCasualLeaves: 12,
      remainingSickLeaves: 10,
      remainingAnnualLeaves: 18,
      leaveHistory: [],
      projects: data.projects && data.projects.length > 0
        ? data.projects
        : [{ code: 'PRJ-IT-101', title: 'WorkSphere Enterprise Core v2.4', role: 'Engineer', progressPercent: 72 }],
      skills: data.skills && data.skills.length > 0 ? data.skills : ['TypeScript', 'Git', 'Clean Architecture'],
      bio: data.bio?.trim() || 'Newly onboarded enterprise team member contributing to strategic technical initiatives.',
      emergencyContact: {
        name: 'Family Contact',
        relationship: 'Emergency',
        phone: '+1 (555) 999-0000',
      },
    };

    this.members.unshift(newMember);
    this.saveMembers();
    return newMember;
  }

  updateEmployeeStatus(id: string, status: TeamMemberDetail['status']): void {
    const member = this.members.find((m) => m.id === id);
    if (member) {
      member.status = status;
      this.saveMembers();
    }
  }

  deleteEmployee(id: string): void {
    this.members = this.members.filter((m) => m.id !== id);
    this.saveMembers();
  }

  resetToDefaults(): void {
    this.members = [...this.defaultTeamMembers];
    this.saveMembers();
  }
}
