import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

export type UserRole = 'hr' | 'employee';

export interface ProfileData {
  id: string;
  fullName: string;
  preferredName: string;
  email: string;
  personalEmail: string;
  phone: string;
  roleTitle: string;
  department: string;
  division: string;
  reportingManager: string;
  joiningDate: string;
  location: string;
  workMode: string;
  avatar: string;
  bio: string;
  bloodGroup: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  // HR Specific Attributes
  hrMetrics?: {
    workforceManaged: number;
    pendingApprovals: number;
    activeJobOpenings: number;
    policiesAuthored: number;
  };
  // Employee Specific Attributes
  empMetrics?: {
    leaveBalance: number;
    attendanceRate: number;
    tasksCompleted: number;
    performanceScore: number;
  };
  bankDetails: {
    bankName: string;
    accountMasked: string;
    taxId: string;
    pfNumber: string;
  };
  skills: string[];
}

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.css',
})
export class MyProfile implements OnInit {
  private router = inject(Router);

  currentRole: UserRole = 'employee';
  activeTab: 'overview' | 'employment' | 'compensation' | 'security' = 'overview';
  isEditing = false;
  saveSuccessMessage = '';

  // HR Profile Data
  hrProfile: ProfileData = {
    id: 'WS-HR-001',
    fullName: 'Eleanor Vance',
    preferredName: 'Eleanor',
    email: 'eleanor.vance@worksphere.io',
    personalEmail: 'eleanor.vance.personal@gmail.com',
    phone: '+1 (555) 234-5678',
    roleTitle: 'Head of People & Culture',
    department: 'Human Resources',
    division: 'People Operations & Talent',
    reportingManager: 'Board of Directors / CEO',
    joiningDate: 'Jan 15, 2022',
    location: 'Bangalore HQ (Floor 4)',
    workMode: 'Hybrid (3 Days Office)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
    bio: 'Passionate people operations leader with 10+ years dedicated to building empathetic, high-growth engineering cultures, talent acquisition strategies, and transparent workplace policies.',
    bloodGroup: 'O+ Positive',
    emergencyContact: {
      name: 'Robert Vance',
      relationship: 'Spouse',
      phone: '+1 (555) 987-6543'
    },
    hrMetrics: {
      workforceManaged: 248,
      pendingApprovals: 11,
      activeJobOpenings: 8,
      policiesAuthored: 16
    },
    bankDetails: {
      bankName: 'JPMorgan Chase & Co.',
      accountMasked: '•••• •••• •••• 4821',
      taxId: 'US-TIN-8932478',
      pfNumber: 'PF-HR-2022-9901'
    },
    skills: [
      'Strategic HR Leadership',
      'Talent Acquisition',
      'Employee Relations',
      'Compensation & Benefits',
      'Conflict Resolution',
      'Performance Management'
    ]
  };

  // Employee Profile Data
  employeeProfile: ProfileData = {
    id: 'WS-EMP-106',
    fullName: 'David Miller',
    preferredName: 'Dave',
    email: 'david.miller@worksphere.io',
    personalEmail: 'david.miller.dev@gmail.com',
    phone: '+1 (555) 789-0123',
    roleTitle: 'Senior Frontend Engineer',
    department: 'Engineering',
    division: 'Web Platform & Experience',
    reportingManager: 'Maya Lin (Engineering Lead)',
    joiningDate: 'Oct 01, 2026',
    location: 'Bangalore HQ (Floor 2)',
    workMode: 'Hybrid (2 Days Office)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
    bio: 'Frontend specialist crafting responsive, scalable web applications with Angular, TypeScript, and modern CSS architecture. Focused on high-fidelity user experiences and design systems.',
    bloodGroup: 'A+ Positive',
    emergencyContact: {
      name: 'Claire Miller',
      relationship: 'Sibling',
      phone: '+1 (555) 876-5432'
    },
    empMetrics: {
      leaveBalance: 18,
      attendanceRate: 98.4,
      tasksCompleted: 42,
      performanceScore: 94
    },
    bankDetails: {
      bankName: 'HSBC International',
      accountMasked: '•••• •••• •••• 7761',
      taxId: 'IN-PAN-ABCDE1234F',
      pfNumber: 'PF-IN-2026-4412'
    },
    skills: [
      'Angular 18 / 19',
      'TypeScript',
      'CSS / SCSS Architecture',
      'Responsive UI / UX',
      'REST APIs & RxJS',
      'State Management'
    ]
  };

  // Active Profile Pointer
  profile!: ProfileData;

  ngOnInit(): void {
    this.detectRole();
  }

  detectRole(): void {
    const isHrRoute = this.router.url.startsWith('/hr');
    const storedRole = localStorage.getItem('role')?.toLowerCase();

    if (isHrRoute || storedRole === 'hr') {
      this.currentRole = 'hr';
      this.profile = { ...this.hrProfile };
    } else {
      this.currentRole = 'employee';
      this.profile = { ...this.employeeProfile };
    }
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
  }

  saveProfile(): void {
    this.isEditing = false;
    this.saveSuccessMessage = 'Profile updated successfully!';
    setTimeout(() => {
      this.saveSuccessMessage = '';
    }, 3500);
  }

  switchRole(role: UserRole): void {
    this.currentRole = role;
    if (role === 'hr') {
      this.profile = { ...this.hrProfile };
    } else {
      this.profile = { ...this.employeeProfile };
    }
  }
}
