import { Injectable } from '@angular/core';

export interface ManagedEmployeeAttendance {
  id: string; // EMP-0135
  name: string;
  email: string;
  phone: string;
  role: string;
  designation: string;
  department: string;
  managerName: string;
  location: string;
  avatarColor: string;

  // Today's Status
  todayStatus: 'Present' | 'Absent' | 'On Leave' | 'Pending';
  checkInTime: string; // '09:04 AM' or '--:--'
  checkOutTime: string; // '06:15 PM' or 'In-Office'
  workMode: 'On-site HQ' | 'Hybrid' | 'Remote';

  // Monthly Counts
  totalWorkingDays: number; // e.g. 24
  presentDays: number; // e.g. 21
  absentDays: number; // e.g. 1
  onLeaveDays: number; // e.g. 2
  pendingDays: number; // e.g. 0 or 1
  overtimeHours: number; // e.g. 6.5 hrs
  attendanceRate: number; // e.g. 95.8%

  // Email Notification Tracking
  reminderSent: boolean;
  lastReminderTime?: string;
}

export interface DailyAttendanceRecord {
  date: string; // '2026-10-26'
  dayOfWeek: string; // 'Mon'
  status: 'Present' | 'Late' | 'Half Day' | 'Absent' | 'On Leave' | 'Weekend' | 'Holiday' | 'Pending';
  punchIn: string; // '09:05 AM' or '--:--'
  punchOut: string; // '06:15 PM' or '--:--'
  workHours: string; // '8h 10m' or '--'
  overtime: string; // '+10m' or '--'
  workMode: 'On-site HQ' | 'Remote' | '--';
  approvalStatus: 'Approved' | 'Auto-Approved' | 'Pending Regularization' | '--';
  remarks?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly STORAGE_KEY = 'worksphere_attendance_managed_employees';
  private selectedEmployeeId: string = 'EMP-0135';

  private readonly defaultEmployees: ManagedEmployeeAttendance[] = [
    {
      id: 'EMP-0135',
      name: 'Priya Patel',
      email: 'priya.patel@worksphere.io',
      phone: '+1 (555) 382-9401',
      role: 'Frontend Engineering Lead',
      designation: 'Senior Lead Angular Architect',
      department: 'Core Web Platform',
      managerName: 'Sarah Jenkins (Director of IT)',
      location: 'San Francisco, CA (HQ)',
      avatarColor: '#10b981',
      todayStatus: 'Present',
      checkInTime: '08:58 AM',
      checkOutTime: 'In-Office (Active)',
      workMode: 'On-site HQ',
      totalWorkingDays: 24,
      presentDays: 22,
      absentDays: 0,
      onLeaveDays: 2,
      pendingDays: 0,
      overtimeHours: 7.5,
      attendanceRate: 98.2,
      reminderSent: false,
    },
    {
      id: 'EMP-0112',
      name: 'David Chen',
      email: 'david.chen@worksphere.io',
      phone: '+1 (555) 749-1102',
      role: 'Database & Infrastructure Lead',
      designation: 'Principal Systems Architect',
      department: 'Data Platform',
      managerName: 'Sarah Jenkins (Director of IT)',
      location: 'Seattle, WA',
      avatarColor: '#0ea5e9',
      todayStatus: 'Present',
      checkInTime: '09:05 AM',
      checkOutTime: 'In-Office (Active)',
      workMode: 'On-site HQ',
      totalWorkingDays: 24,
      presentDays: 21,
      absentDays: 1,
      onLeaveDays: 2,
      pendingDays: 0,
      overtimeHours: 9.0,
      attendanceRate: 95.8,
      reminderSent: false,
    },
    {
      id: 'EMP-0128',
      name: 'Alex Rivera',
      email: 'alex.rivera@worksphere.io',
      phone: '+1 (555) 492-0199',
      role: 'Lead UI/UX Designer',
      designation: 'Staff Product & Design Lead',
      department: 'Product Design',
      managerName: 'Sarah Jenkins (Director of IT)',
      location: 'New York, NY',
      avatarColor: '#8b5cf6',
      todayStatus: 'Present',
      checkInTime: '09:12 AM',
      checkOutTime: 'In-Office (Active)',
      workMode: 'Hybrid',
      totalWorkingDays: 24,
      presentDays: 23,
      absentDays: 0,
      onLeaveDays: 1,
      pendingDays: 0,
      overtimeHours: 4.5,
      attendanceRate: 99.1,
      reminderSent: false,
    },
    {
      id: 'EMP-0142',
      name: 'Rohan Sharma',
      email: 'rohan.sharma@worksphere.io',
      phone: '+1 (555) 831-2940',
      role: 'Full Stack Java Engineer',
      designation: 'Senior Backend Specialist',
      department: 'Platform Services',
      managerName: 'Priya Patel (EMP-0135)',
      location: 'Austin, TX',
      avatarColor: '#f59e0b',
      todayStatus: 'Absent',
      checkInTime: '--:--',
      checkOutTime: '--:--',
      workMode: 'Remote',
      totalWorkingDays: 24,
      presentDays: 19,
      absentDays: 3,
      onLeaveDays: 2,
      pendingDays: 0,
      overtimeHours: 2.0,
      attendanceRate: 88.5,
      reminderSent: false,
    },
    {
      id: 'EMP-0150',
      name: 'Neha Sharma',
      email: 'neha.sharma@worksphere.io',
      phone: '+1 (555) 604-8291',
      role: 'QA Automation Lead',
      designation: 'Staff Quality Architect',
      department: 'Quality Assurance',
      managerName: 'Priya Patel (EMP-0135)',
      location: 'San Francisco, CA (HQ)',
      avatarColor: '#ec4899',
      todayStatus: 'Present',
      checkInTime: '09:01 AM',
      checkOutTime: 'In-Office (Active)',
      workMode: 'On-site HQ',
      totalWorkingDays: 24,
      presentDays: 22,
      absentDays: 0,
      onLeaveDays: 2,
      pendingDays: 0,
      overtimeHours: 5.0,
      attendanceRate: 96.0,
      reminderSent: false,
    },
    {
      id: 'EMP-0164',
      name: 'Vikram Malhotra',
      email: 'vikram.malhotra@worksphere.io',
      phone: '+1 (555) 291-7402',
      role: 'Mobile Applications Developer',
      designation: 'Senior Cross-Platform Flutter Dev',
      department: 'Mobile Engineering',
      managerName: 'David Chen (EMP-0112)',
      location: 'Chicago, IL',
      avatarColor: '#6366f1',
      todayStatus: 'On Leave',
      checkInTime: '--:--',
      checkOutTime: '--:--',
      workMode: 'Remote',
      totalWorkingDays: 24,
      presentDays: 17,
      absentDays: 0,
      onLeaveDays: 7,
      pendingDays: 0,
      overtimeHours: 0.0,
      attendanceRate: 91.5,
      reminderSent: false,
    },
    {
      id: 'EMP-0171',
      name: 'Sneha Reddy',
      email: 'sneha.reddy@worksphere.io',
      phone: '+1 (555) 918-3482',
      role: 'Cloud & SecOps Specialist',
      designation: 'Senior IAM & Security Lead',
      department: 'Cybersecurity & IAM',
      managerName: 'David Chen (EMP-0112)',
      location: 'San Jose, CA',
      avatarColor: '#14b8a6',
      todayStatus: 'Present',
      checkInTime: '08:45 AM',
      checkOutTime: 'In-Office (Active)',
      workMode: 'On-site HQ',
      totalWorkingDays: 24,
      presentDays: 23,
      absentDays: 0,
      onLeaveDays: 1,
      pendingDays: 0,
      overtimeHours: 8.5,
      attendanceRate: 99.0,
      reminderSent: false,
    },
    {
      id: 'EMP-0172',
      name: 'Maya Lin',
      email: 'maya.lin@worksphere.io',
      phone: '+1 (555) 349-8120',
      role: 'Senior Angular Engineer',
      designation: 'Senior Software Engineer II',
      department: 'Core Web Platform',
      managerName: 'Priya Patel (EMP-0135)',
      location: 'San Francisco, CA (HQ)',
      avatarColor: '#10b981',
      todayStatus: 'Pending',
      checkInTime: '--:--',
      checkOutTime: '--:--',
      workMode: 'On-site HQ',
      totalWorkingDays: 24,
      presentDays: 20,
      absentDays: 1,
      onLeaveDays: 2,
      pendingDays: 1,
      overtimeHours: 3.5,
      attendanceRate: 93.0,
      reminderSent: false,
    },
    {
      id: 'EMP-0175',
      name: 'Samuel Kim',
      email: 'samuel.kim@worksphere.io',
      phone: '+1 (555) 901-3829',
      role: 'Full Stack Java Engineer',
      designation: 'Senior Backend Specialist',
      department: 'Platform Services',
      managerName: 'Priya Patel (EMP-0135)',
      location: 'Austin, TX',
      avatarColor: '#f59e0b',
      todayStatus: 'Pending',
      checkInTime: '--:--',
      checkOutTime: '--:--',
      workMode: 'Hybrid',
      totalWorkingDays: 24,
      presentDays: 20,
      absentDays: 2,
      onLeaveDays: 1,
      pendingDays: 1,
      overtimeHours: 4.0,
      attendanceRate: 91.5,
      reminderSent: false,
    },
    {
      id: 'EMP-0177',
      name: 'Kevin Zhao',
      email: 'kevin.zhao@worksphere.io',
      phone: '+1 (555) 723-9912',
      role: 'Cross-Platform Mobile Developer',
      designation: 'Senior Flutter Specialist',
      department: 'Mobile Engineering',
      managerName: 'David Chen (EMP-0112)',
      location: 'Chicago, IL',
      avatarColor: '#6366f1',
      todayStatus: 'Present',
      checkInTime: '09:20 AM',
      checkOutTime: 'In-Office (Active)',
      workMode: 'Remote',
      totalWorkingDays: 24,
      presentDays: 21,
      absentDays: 1,
      onLeaveDays: 1,
      pendingDays: 0,
      overtimeHours: 6.0,
      attendanceRate: 94.0,
      reminderSent: false,
    },
  ];

  private employees: ManagedEmployeeAttendance[] = [];

  constructor() {
    this.loadEmployees();
  }

  private loadEmployees(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          this.employees = JSON.parse(stored);
          return;
        } catch {}
      }
    }
    this.employees = [...this.defaultEmployees];
    this.saveEmployees();
  }

  private saveEmployees(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.employees));
      } catch (err) {
        console.error('Failed to save attendance employees', err);
      }
    }
  }

  getManagedEmployees(): ManagedEmployeeAttendance[] {
    return [...this.employees];
  }

  getEmployeeById(id: string): ManagedEmployeeAttendance | undefined {
    return this.employees.find((e) => e.id === id) || this.employees[0];
  }

  setSelectedEmployeeId(id: string): void {
    this.selectedEmployeeId = id;
  }

  getSelectedEmployeeId(): string {
    return this.selectedEmployeeId;
  }

  // Trigger Notification to Employee to mark attendance
  sendReminder(id: string): boolean {
    const emp = this.employees.find((e) => e.id === id);
    if (emp) {
      emp.reminderSent = true;
      emp.lastReminderTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.saveEmployees();
      return true;
    }
    return false;
  }

  // Send batch reminders to all pending employees
  sendBatchReminders(): number {
    let count = 0;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.employees.forEach((emp) => {
      if (emp.todayStatus === 'Pending') {
        emp.reminderSent = true;
        emp.lastReminderTime = nowTime;
        count++;
      }
    });
    this.saveEmployees();
    return count;
  }

  // Generate 26-day calendar ledger for the attendance sheet
  generateMonthlyAttendanceLogs(empId: string, month: string = 'October 2026'): DailyAttendanceRecord[] {
    const days: DailyAttendanceRecord[] = [];
    const emp = this.getEmployeeById(empId);

    // Generate days for October 1st to October 26th, 2026
    const totalDays = 26;
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let day = totalDays; day >= 1; day--) {
      const dayNumStr = day < 10 ? `0${day}` : `${day}`;
      const dateStr = `2026-10-${dayNumStr}`;
      const dateObj = new Date(2026, 9, day); // Month is 0-indexed (9 = Oct)
      const dayOfWeek = dayNames[dateObj.getDay()];

      // Weekend handling
      if (dayOfWeek === 'Sat' || dayOfWeek === 'Sun') {
        days.push({
          date: dateStr,
          dayOfWeek: dayOfWeek,
          status: 'Weekend',
          punchIn: '--:--',
          punchOut: '--:--',
          workHours: '--',
          overtime: '--',
          workMode: '--',
          approvalStatus: '--',
          remarks: 'Weekly Off',
        });
        continue;
      }

      // Today (Day 26) handling
      if (day === 26) {
        if (emp?.todayStatus === 'Pending') {
          days.push({
            date: dateStr,
            dayOfWeek: dayOfWeek,
            status: 'Pending',
            punchIn: '--:--',
            punchOut: '--:--',
            workHours: '--',
            overtime: '--',
            workMode: 'On-site HQ',
            approvalStatus: 'Pending Regularization',
            remarks: 'Punch-in pending verification',
          });
          continue;
        }
        if (emp?.todayStatus === 'Absent') {
          days.push({
            date: dateStr,
            dayOfWeek: dayOfWeek,
            status: 'Absent',
            punchIn: '--:--',
            punchOut: '--:--',
            workHours: '0h 00m',
            overtime: '--',
            workMode: '--',
            approvalStatus: '--',
            remarks: 'Unscheduled absence',
          });
          continue;
        }
        if (emp?.todayStatus === 'On Leave') {
          days.push({
            date: dateStr,
            dayOfWeek: dayOfWeek,
            status: 'On Leave',
            punchIn: '--:--',
            punchOut: '--:--',
            workHours: '--',
            overtime: '--',
            workMode: '--',
            approvalStatus: 'Approved',
            remarks: 'Approved Annual Leave',
          });
          continue;
        }
      }

      // Past Leave Days
      if (day === 5 || day === 6) {
        days.push({
          date: dateStr,
          dayOfWeek: dayOfWeek,
          status: 'On Leave',
          punchIn: '--:--',
          punchOut: '--:--',
          workHours: '--',
          overtime: '--',
          workMode: '--',
          approvalStatus: 'Approved',
          remarks: 'Approved Casual Leave',
        });
        continue;
      }

      // Past Absent Day
      if (day === 14 && emp?.absentDays && emp.absentDays > 0) {
        days.push({
          date: dateStr,
          dayOfWeek: dayOfWeek,
          status: 'Absent',
          punchIn: '--:--',
          punchOut: '--:--',
          workHours: '0h 00m',
          overtime: '--',
          workMode: '--',
          approvalStatus: '--',
          remarks: 'Unnotified Absent',
        });
        continue;
      }

      // Regular Working Days
      const inMinute = 50 + (day % 15);
      const inHour = inMinute >= 60 ? 9 : 8;
      const formattedInMinute = (inMinute % 60) < 10 ? `0${inMinute % 60}` : `${inMinute % 60}`;
      const punchInStr = `0${inHour}:${formattedInMinute} AM`;

      const outHour = 18; // 6 PM
      const outMin = (day * 7) % 35;
      const formattedOutMin = outMin < 10 ? `0${outMin}` : `${outMin}`;
      const punchOutStr = `06:${formattedOutMin} PM`;

      const isLate = inHour === 9 && inMinute % 60 > 15;
      const overtimeMinutes = (day % 3 === 0) ? (20 + (day % 40)) : 0;
      const overtimeStr = overtimeMinutes > 0 ? `+${overtimeMinutes}m` : '--';

      days.push({
        date: dateStr,
        dayOfWeek: dayOfWeek,
        status: isLate ? 'Late' : 'Present',
        punchIn: punchInStr,
        punchOut: punchOutStr,
        workHours: `8h ${10 + (day % 20)}m`,
        overtime: overtimeStr,
        workMode: (day % 4 === 0) ? 'Remote' : 'On-site HQ',
        approvalStatus: 'Auto-Approved',
        remarks: isLate ? 'Grace period check-in' : 'Normal attendance verified',
      });
    }

    return days;
  }
}
