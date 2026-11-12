import { TeamMemberLeaveRecord } from './leave.interface';

export interface TeamMember {
  id: string;
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

export interface DetailedSubtask {
  id: number;
  title: string;
  completed: boolean;
}

export interface DetailedAttachment {
  name: string;
  size: string;
  type: string;
  icon: string;
}

export interface SubmittedDocument {
  id: number;
  name: string;
  size: string;
  uploadedDate: string;
  uploadedBy: string;
  status: 'Submitted' | 'Under Review' | 'Accepted';
  note?: string;
}

export interface DetailedComment {
  id: number;
  author: string;
  role: string;
  date: string;
  message: string;
  isManager: boolean;
}

export interface TaskDetailModel {
  id: string;
  title: string;
  project: string;
  description: string;
  fullDescription: string;
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
  subtasks: DetailedSubtask[];
  attachments: DetailedAttachment[];
  submittedDocuments: SubmittedDocument[];
  comments: DetailedComment[];
}

export interface ProjectMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarColor: string;
}

export interface ManagedProject {
  id: number;
  code: string;
  title: string;
  department: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: 'In Progress' | 'Planning' | 'Completed' | 'On Hold';
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  lead: ProjectMember;
  teamMembers: ProjectMember[];
  progressPercent: number;
  budget: string;
  methodology: 'Agile Scrum' | 'Kanban' | 'Waterfall' | 'Milestone';
  milestones: string[];
  externalToolUrl: string;
}

export interface AssignedProject {
  id: number;
  code: string;
  title: string;
  department: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: 'In Progress' | 'Active' | 'Planning' | 'Completed' | 'On Hold';
  role: string;
  externalToolUrl: string;
}

export interface EmployeeProjectAssignment {
  code: string;
  title: string;
  role: string;
  progressPercent: number;
}

export interface TeamMemberDetail {
  id: string;
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

  attendancePercentage: number;
  totalWorkingDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;

  taskCompletionRate: number;
  totalTasksAssigned: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;

  totalLeavesTaken: number;
  remainingCasualLeaves: number;
  remainingSickLeaves: number;
  remainingAnnualLeaves: number;
  leaveHistory: TeamMemberLeaveRecord[];

  projects: EmployeeProjectAssignment[];
  skills: string[];
  bio: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

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

export interface TicketTypeOption {
  type: 'Task' | 'Bug' | 'Feature' | 'Improvement' | 'Support';
  label: string;
  icon: string;
  badgeClass: string;
  description: string;
}

export interface AttachmentItem {
  id: string;
  name: string;
  size: string;
  type: string;
  icon: string;
}

export interface MethodologyOption {
  type: 'Agile Scrum' | 'Kanban' | 'Waterfall' | 'Milestone';
  label: string;
  icon: string;
  description: string;
}
