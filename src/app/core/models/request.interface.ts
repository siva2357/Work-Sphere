export interface ApprovalLevel {
  levelNumber: number;
  levelTitle: string;
  role: string;
  approverName: string;
  approverId?: string;
  avatarColor: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  actionDate?: string;
  remarks?: string;
  isCurrent: boolean;
  isFinalHR: boolean;
}

export interface ManagedRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeeRole: string;
  department: string;
  location: string;
  avatarColor: string;

  category:
    | 'Leave Request'
    | 'Hardware / Asset'
    | 'IT & System Access'
    | 'Promotion Request'
    | 'Appraisal & Salary Review'
    | 'Department Transfer'
    | 'Resignation Request'
    | 'Work From Home'
    | 'Expense Reimbursement';

  subject: string;
  description: string;
  submittedDate: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  overallStatus: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';

  currentLevelNumber: number;
  totalLevels: number;
  approvalChain: ApprovalLevel[];
  attachments?: { name: string; size: string }[];
}

export interface EmployeeRequest {
  sNo: number;
  requestId: string;
  category:
    | 'Leave Request'
    | 'Hardware / Asset'
    | 'IT & System Access'
    | 'Promotion Request'
    | 'Appraisal & Salary Review'
    | 'Department Transfer'
    | 'Resignation Request'
    | 'Work From Home'
    | 'Expense Reimbursement';
  subject: string;
  description: string;
  submittedDate: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  assignedTo: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'In Progress';
}
