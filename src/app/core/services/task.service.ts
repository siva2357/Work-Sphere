import { Injectable } from '@angular/core';

export interface TeamMember {
  id: string; // e.g. EMP-0128
  name: string;
  role: string;
  department: string;
  email: string;
  avatarColor: string;
}

export interface ManagedTask {
  sNo: number;
  id: string;
  title: string;
  project: string;
  description: string;
  assignee: TeamMember;
  assignedBy: {
    name: string;
    employeeId: string;
    role: string;
  };
  assignedDate: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  estimatedHours: number;
  loggedHours: number;
  progressPercent: number;
  category: string;
  subtasks: string[];
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly STORAGE_KEY = 'worksphere_managed_tasks';

  // Available Team Members for assignment
  readonly teamMembers: TeamMember[] = [
    {
      id: 'EMP-0128',
      name: 'Alex Rivera',
      role: 'Lead UI/UX Designer',
      department: 'Product Design',
      email: 'alex.rivera@worksphere.io',
      avatarColor: '#8b5cf6', // purple
    },
    {
      id: 'EMP-0112',
      name: 'David Chen',
      role: 'Database & Infrastructure Lead',
      department: 'Data Platform',
      email: 'david.chen@worksphere.io',
      avatarColor: '#0ea5e9', // sky blue
    },
    {
      id: 'EMP-0135',
      name: 'Priya Patel',
      role: 'Senior Angular Frontend Engineer',
      department: 'Core Web Platform',
      email: 'priya.patel@worksphere.io',
      avatarColor: '#10b981', // emerald
    },
    {
      id: 'EMP-0142',
      name: 'Rohan Sharma',
      role: 'Full Stack Java Engineer',
      department: 'Platform Services',
      email: 'rohan.sharma@worksphere.io',
      avatarColor: '#f59e0b', // amber
    },
    {
      id: 'EMP-0150',
      name: 'Neha Sharma',
      role: 'QA Automation Lead',
      department: 'Quality Assurance',
      email: 'neha.sharma@worksphere.io',
      avatarColor: '#ec4899', // pink
    },
    {
      id: 'EMP-0164',
      name: 'Vikram Malhotra',
      role: 'Mobile Applications Developer',
      department: 'Mobile Engineering',
      email: 'vikram.malhotra@worksphere.io',
      avatarColor: '#6366f1', // indigo
    },
    {
      id: 'EMP-0171',
      name: 'Sneha Reddy',
      role: 'Cloud & SecOps Specialist',
      department: 'Cybersecurity & IAM',
      email: 'sneha.reddy@worksphere.io',
      avatarColor: '#14b8a6', // teal
    },
  ];

  // Available Project Options
  readonly availableProjects: string[] = [
    'WorkSphere Enterprise Core v2.4',
    'WorkSphere HR Suite',
    'Payroll Automation Engine',
    'Employee Self-Service Mobile Application',
    'Cloud Infrastructure & Kubernetes',
    'Enterprise Single Sign-On (SSO) Gateway',
    'WorkSphere Compliance & Audit Engine',
  ];

  // Default tasks seeded for initial experience
  private readonly defaultTasks: ManagedTask[] = [
    {
      sNo: 1,
      id: 'TSK-2001',
      title: 'Implement OAuth2 Social Authentication & Session Invalidation',
      project: 'WorkSphere Enterprise Core v2.4',
      description: 'Integrate Google and Microsoft 365 OAuth2 single sign-on flows with secure session invalidation and token refresh mechanism.',
      assignee: {
        id: 'EMP-0135',
        name: 'Priya Patel',
        role: 'Senior Angular Frontend Engineer',
        department: 'Core Web Platform',
        email: 'priya.patel@worksphere.io',
        avatarColor: '#10b981',
      },
      assignedBy: {
        name: 'Sarah Jenkins',
        employeeId: 'EMP-0104',
        role: 'Engineering Lead & Project Manager',
      },
      assignedDate: '2026-10-18',
      dueDate: '2026-10-28',
      status: 'In Progress',
      priority: 'High',
      estimatedHours: 28,
      loggedHours: 18.5,
      progressPercent: 65,
      category: 'Frontend Engineering',
      subtasks: ['Implement SSO Callback handler', 'Token refresh interceptor', 'Session timeout modal'],
    },
    {
      sNo: 2,
      id: 'TSK-2002',
      title: 'Optimize Employee Leave Balance Aggregation Query',
      project: 'WorkSphere HR Suite',
      description: 'Refactor SQL database index strategy and query builder for employee attendance and monthly leave calculation.',
      assignee: {
        id: 'EMP-0112',
        name: 'David Chen',
        role: 'Database & Infrastructure Lead',
        department: 'Data Platform',
        email: 'david.chen@worksphere.io',
        avatarColor: '#0ea5e9',
      },
      assignedBy: {
        name: 'Sarah Jenkins',
        employeeId: 'EMP-0104',
        role: 'Engineering Lead & Project Manager',
      },
      assignedDate: '2026-10-19',
      dueDate: '2026-10-25',
      status: 'Pending',
      priority: 'Urgent',
      estimatedHours: 16,
      loggedHours: 0,
      progressPercent: 0,
      category: 'Database / Backend',
      subtasks: ['Analyze slow query log', 'Create compound index on leave_records', 'Benchmark query latency'],
    },
    {
      sNo: 3,
      id: 'TSK-2003',
      title: 'Design & Code Responsive Payslip PDF Generator',
      project: 'Payroll Automation Engine',
      description: 'Develop dynamic PDF rendering template with employee deductions, gross pay, tax deductions, and company seal.',
      assignee: {
        id: 'EMP-0142',
        name: 'Rohan Sharma',
        role: 'Full Stack Java Engineer',
        department: 'Platform Services',
        email: 'rohan.sharma@worksphere.io',
        avatarColor: '#f59e0b',
      },
      assignedBy: {
        name: 'David Chen',
        employeeId: 'EMP-0112',
        role: 'Infrastructure Lead',
      },
      assignedDate: '2026-10-15',
      dueDate: '2026-10-22',
      status: 'Completed',
      priority: 'High',
      estimatedHours: 20,
      loggedHours: 19.5,
      progressPercent: 100,
      category: 'Backend Services',
      subtasks: ['Design PDF layout in iText', 'Attach company digital signature', 'Verify tax computation table'],
    },
    {
      sNo: 4,
      id: 'TSK-2004',
      title: 'Update Mobile Viewport Breakpoints on Employee Attendance Table',
      project: 'Employee Self-Service Mobile Application',
      description: 'Refactor horizontal table scroll and stacked card display for screens under 768px width.',
      assignee: {
        id: 'EMP-0128',
        name: 'Alex Rivera',
        role: 'Lead UI/UX Designer',
        department: 'Product Design',
        email: 'alex.rivera@worksphere.io',
        avatarColor: '#8b5cf6',
      },
      assignedBy: {
        name: 'Sarah Jenkins',
        employeeId: 'EMP-0104',
        role: 'Engineering Lead & Project Manager',
      },
      assignedDate: '2026-10-20',
      dueDate: '2026-10-27',
      status: 'In Progress',
      priority: 'Medium',
      estimatedHours: 14,
      loggedHours: 8,
      progressPercent: 55,
      category: 'UI/UX Design',
      subtasks: ['Figma mobile card specs', 'CSS media query breakpoints', 'Cross-browser testing'],
    },
    {
      sNo: 5,
      id: 'TSK-2005',
      title: 'Automated Regression Suite for Recruitment Pipeline',
      project: 'WorkSphere Enterprise Core v2.4',
      description: 'Create Cypress end-to-end tests for job requisition creation, candidate screening, and interview scheduling workflows.',
      assignee: {
        id: 'EMP-0150',
        name: 'Neha Sharma',
        role: 'QA Automation Lead',
        department: 'Quality Assurance',
        email: 'neha.sharma@worksphere.io',
        avatarColor: '#ec4899',
      },
      assignedBy: {
        name: 'Sarah Jenkins',
        employeeId: 'EMP-0104',
        role: 'Engineering Lead & Project Manager',
      },
      assignedDate: '2026-10-21',
      dueDate: '2026-10-31',
      status: 'Pending',
      priority: 'Medium',
      estimatedHours: 24,
      loggedHours: 4,
      progressPercent: 15,
      category: 'Quality Assurance',
      subtasks: ['Screening test scenarios', 'Interview scheduling mocks', 'CI/CD pipeline test trigger'],
    },
    {
      sNo: 6,
      id: 'TSK-2006',
      title: 'Configure AWS EKS Autoscaling & Prometheus Alert Rules',
      project: 'Cloud Infrastructure & Kubernetes',
      description: 'Implement Horizontal Pod Autoscaler (HPA) policies and Slack notification alerts for 5xx error spikes.',
      assignee: {
        id: 'EMP-0171',
        name: 'Sneha Reddy',
        role: 'Cloud & SecOps Specialist',
        department: 'Cybersecurity & IAM',
        email: 'sneha.reddy@worksphere.io',
        avatarColor: '#14b8a6',
      },
      assignedBy: {
        name: 'David Chen',
        employeeId: 'EMP-0112',
        role: 'Infrastructure Lead',
      },
      assignedDate: '2026-10-14',
      dueDate: '2026-10-24',
      status: 'Completed',
      priority: 'Urgent',
      estimatedHours: 18,
      loggedHours: 18,
      progressPercent: 100,
      category: 'Cloud & DevOps',
      subtasks: ['Cluster Autoscaler setup', 'Prometheus metrics exporter', 'Alertmanager webhook testing'],
    },
    {
      sNo: 7,
      id: 'TSK-2007',
      title: 'Build Biometric Check-in Sync for Mobile App',
      project: 'Employee Self-Service Mobile Application',
      description: 'Integrate Flutter local_auth plugin with facial & fingerprint authentication to sync punch logs offline.',
      assignee: {
        id: 'EMP-0164',
        name: 'Vikram Malhotra',
        role: 'Mobile Applications Developer',
        department: 'Mobile Engineering',
        email: 'vikram.malhotra@worksphere.io',
        avatarColor: '#6366f1',
      },
      assignedBy: {
        name: 'Sarah Jenkins',
        employeeId: 'EMP-0104',
        role: 'Engineering Lead & Project Manager',
      },
      assignedDate: '2026-10-17',
      dueDate: '2026-10-29',
      status: 'In Progress',
      priority: 'High',
      estimatedHours: 22,
      loggedHours: 14,
      progressPercent: 60,
      category: 'Mobile Engineering',
      subtasks: ['Local auth plugin integration', 'Offline SQLite storage', 'Sync conflict resolver'],
    },
    {
      sNo: 8,
      id: 'TSK-2008',
      title: 'Audit & Patch Dependencies for Annual SOC2 Security Compliance',
      project: 'WorkSphere Enterprise Core v2.4',
      description: 'Run npm audit, replace vulnerable transitive packages, and verify cryptographic signing on all internal build artifacts.',
      assignee: {
        id: 'EMP-0171',
        name: 'Sneha Reddy',
        role: 'Cloud & SecOps Specialist',
        department: 'Cybersecurity & IAM',
        email: 'sneha.reddy@worksphere.io',
        avatarColor: '#14b8a6',
      },
      assignedBy: {
        name: 'David Chen',
        employeeId: 'EMP-0112',
        role: 'Infrastructure Lead',
      },
      assignedDate: '2026-10-12',
      dueDate: '2026-10-19',
      status: 'Completed',
      priority: 'Low',
      estimatedHours: 10,
      loggedHours: 9.5,
      progressPercent: 100,
      category: 'Security & Compliance',
      subtasks: ['Run vulnerability scanner', 'Update lodash and moment.js', 'Generate audit report'],
    },
  ];

  private tasks: ManagedTask[] = [];

  constructor() {
    this.loadTasks();
  }

  private loadTasks(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          this.tasks = JSON.parse(stored);
          return;
        } catch {
          // Fall back to defaults
        }
      }
    }
    this.tasks = [...this.defaultTasks];
    this.saveTasks();
  }

  private saveTasks(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
      } catch (err) {
        console.error('Failed to save tasks to localStorage', err);
      }
    }
  }

  getTasks(): ManagedTask[] {
    return [...this.tasks];
  }

  addTask(taskData: {
    title: string;
    project: string;
    description: string;
    assigneeId: string;
    dueDate: string;
    priority: 'Urgent' | 'High' | 'Medium' | 'Low';
    estimatedHours: number;
    category?: string;
    subtasks?: string[];
  }): ManagedTask {
    const assignee = this.teamMembers.find((m) => m.id === taskData.assigneeId) || this.teamMembers[0];
    const nextIdNum = 2000 + this.tasks.length + 1;
    const newTask: ManagedTask = {
      sNo: this.tasks.length + 1,
      id: `TSK-${nextIdNum}`,
      title: taskData.title.trim(),
      project: taskData.project,
      description: taskData.description.trim(),
      assignee: assignee,
      assignedBy: {
        name: 'Sarah Jenkins',
        employeeId: 'EMP-0104',
        role: 'Project Manager & Lead',
      },
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: taskData.dueDate,
      status: 'Pending',
      priority: taskData.priority,
      estimatedHours: Number(taskData.estimatedHours) || 8,
      loggedHours: 0,
      progressPercent: 0,
      category: taskData.category || 'General',
      subtasks: taskData.subtasks && taskData.subtasks.length > 0 ? taskData.subtasks : ['Initial requirement analysis'],
    };

    // Add at beginning of list so it immediately appears first
    this.tasks.unshift(newTask);
    this.reIndex();
    this.saveTasks();
    return newTask;
  }

  updateTaskStatus(id: string, newStatus: 'Pending' | 'In Progress' | 'Completed'): void {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.status = newStatus;
      if (newStatus === 'Completed') {
        task.progressPercent = 100;
      } else if (newStatus === 'Pending') {
        task.progressPercent = 0;
      } else if (newStatus === 'In Progress' && task.progressPercent === 0) {
        task.progressPercent = 25;
      }
      this.saveTasks();
    }
  }

  deleteTask(id: string): void {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.reIndex();
    this.saveTasks();
  }

  resetToDefaults(): void {
    this.tasks = [...this.defaultTasks];
    this.saveTasks();
  }

  private reIndex(): void {
    this.tasks.forEach((task, idx) => {
      task.sNo = idx + 1;
    });
  }
}
