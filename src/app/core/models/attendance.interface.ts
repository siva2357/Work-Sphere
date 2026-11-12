export interface ManagedEmployeeAttendance {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  designation: string;
  department: string;
  managerName: string;
  location: string;
  avatarColor: string;

  todayStatus: 'Present' | 'Absent' | 'On Leave' | 'Pending';
  checkInTime: string;
  checkOutTime: string;
  workMode: 'On-site HQ' | 'Hybrid' | 'Remote';

  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  onLeaveDays: number;
  pendingDays: number;
  overtimeHours: number;
  attendanceRate: number;

  reminderSent: boolean;
  lastReminderTime?: string;
}

export interface DailyAttendanceRecord {
  date: string;
  dayOfWeek: string;
  status: 'Present' | 'Late' | 'Half Day' | 'Absent' | 'On Leave' | 'Weekend' | 'Holiday' | 'Pending';
  punchIn: string;
  punchOut: string;
  workHours: string;
  overtime: string;
  workMode: 'On-site HQ' | 'Remote' | '--';
  approvalStatus: 'Approved' | 'Auto-Approved' | 'Pending Regularization' | '--';
  remarks?: string;
}

export interface AttendanceRecord {
  sNo: number;
  date: string;
  dayName: string;
  dayNumber: number;
  loginTime: string;
  loginLocation: string;
  logoutTime: string;
  logoutLocation: string;
  hoursPresent: string;
  status: 'Present' | 'Leave' | 'Weekend' | 'Holiday' | 'Absent';
  remarks: 'Present' | 'Absent' | 'Leave' | 'Weekend' | 'Holiday' | '--';
}

export interface CalendarDay {
  day: number;
  dateStr: string;
  status: 'present' | 'leave' | 'weekend' | 'holiday' | 'absent' | 'future';
  isToday: boolean;
  isSelected: boolean;
}

export interface BiometricPunchLog {
  id: string;
  type: 'PUNCH_IN' | 'PUNCH_OUT';
  time: string;
  date: string;
  confidence: number;
  location: string;
  coordinates: string;
  verificationMethod: 'Face Recognition' | 'Biometric AI';
  status: 'Verified' | 'Pending';
}
