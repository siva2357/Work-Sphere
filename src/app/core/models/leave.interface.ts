export interface EmployeeLeaveProposal {
  id: string;
  employeeId: string;
  employeeName: string;
  avatarColor: string;
  department: string;
  role: string;
  email: string;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Comp-Off' | 'Annual Vacation';
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  appliedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  managerComments?: string;
  approvedAt?: string;
}

export interface LeaveRecord {
  sNo: number;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Comp-Off' | 'Maternity/Paternity';
  fromDate: string;
  toDate: string;
  days: number;
  month: string;
  reason: string;
  appliedDate: string;
  approvedBy: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Cancelled';
}

export interface LeaveBalance {
  type: string;
  shortCode: string;
  used: number;
  total: number;
  available: number;
  colorClass: string;
}

export interface UpcomingHoliday {
  name: string;
  date: string;
  day: string;
  type: 'National' | 'Restricted' | 'Festival';
  isPast: boolean;
}

export interface TeamMemberLeaveRecord {
  id: string;
  type: 'Casual Leave' | 'Sick Leave' | 'Annual Vacation' | 'Privilege Leave' | 'Work From Home';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedOn: string;
}

export interface CalendarDayView {
  dayNumber: number;
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  isSelectedStart: boolean;
  isSelectedEnd: boolean;
  isInSelectedRange: boolean;
}
