export interface EmployeeDocument {
  id: string;
  title: string;
  category: 'Employment' | 'Compensation' | 'Policy' | 'Separation';
  categoryLabel: string;
  issueDate: string;
  fileSize: string;
  fileFormat: 'PDF';
  badge?: string;
  badgeType?: 'emerald' | 'primary' | 'warning' | 'secondary' | 'danger';
  description: string;
}

export interface MonthlyPayrollRecord {
  month: string;
  monthShort: string;
  financialYear: string;
  payDate: string;
  status: 'Paid' | 'Processing' | 'Upcoming';
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  conveyance: number;
  medicalAllowance: number;
  grossEarnings: number;
  epfDeduction: number;
  professionalTax: number;
  tdsDeduction: number;
  insuranceDeduction: number;
  totalDeductions: number;
  netSalary: number;
  salarySlipPdf: {
    fileName: string;
    fileSize: string;
    downloadUrl: string;
  };
  taxSlipPdf: {
    fileName: string;
    fileSize: string;
    downloadUrl: string;
  };
}

export interface StatMetric {
  title: string;
  value: string;
  subtitle: string;
  badgeText: string;
  badgeType: 'emerald' | 'success' | 'warning' | 'info';
  icon: string;
  route: string;
}

export interface DeptMetric {
  name: string;
  count: number;
  percentage: number;
  colorClass: string;
}

export interface ActivityItem {
  id: string;
  type: 'onboarding' | 'leave' | 'payroll' | 'recruitment' | 'announcement';
  title: string;
  description: string;
  time: string;
  icon: string;
  badgeClass: string;
}

export interface CelebrationItem {
  name: string;
  role: string;
  department: string;
  event: string;
  date: string;
  avatar: string;
  type: 'birthday' | 'anniversary';
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentMethod: string;
  status: 'Paid' | 'Processing' | 'Pending Approval';
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'Urgent' | 'High' | 'Normal';
  targetAudience: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  date: string;
  isPinned: boolean;
  viewsCount: number;
}

export interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  route: string;
  badgeText: string;
  badgeType: string;
}

export interface QuickAction {
  title: string;
  description: string;
  icon: string;
  route: string;
}

export interface RecentRequest {
  id: string;
  type: string;
  date: string;
  duration: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Under Review';
}

export interface DayAttendance {
  day: string;
  date: string;
  hours: number;
  percentage: number;
  status: 'completed' | 'in-progress' | 'upcoming';
}

export interface TaskItem {
  id: number;
  title: string;
  dueDate: string;
  completed: boolean;
  tag: string;
}
