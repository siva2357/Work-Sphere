import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileData, UserRole } from '../../../core/models/auth.interface';

export type { ProfileData, UserRole };

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.css',
})
export class MyProfile implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  currentRole: UserRole = 'employee';
  activeTab: 'overview' | 'employment' | 'compensation' | 'security' = 'overview';
  isEditing = false;
  saveSuccessMessage = '';

  profile: ProfileData = this.createEmptyProfile();

  ngOnInit(): void {
    this.detectRoleAndLoadFromBackend();
  }

  private createEmptyProfile(): ProfileData {
    return {
      id: '',
      fullName: '',
      preferredName: '',
      email: '',
      personalEmail: '',
      phone: '',
      roleTitle: '',
      department: '',
      division: '',
      reportingManager: '',
      joiningDate: '',
      location: 'Bangalore HQ',
      workMode: 'Hybrid',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&auto=format&fit=crop&q=80',
      bio: '',
      bloodGroup: 'O+ Positive',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
      hrMetrics: {
        workforceManaged: 0,
        pendingApprovals: 0,
        activeJobOpenings: 0,
        policiesAuthored: 0,
      },
      empMetrics: {
        leaveBalance: 0,
        attendanceRate: 0,
        tasksCompleted: 0,
        performanceScore: 0,
      },
      bankDetails: {
        bankName: '',
        accountMasked: '',
        taxId: '',
        pfNumber: '',
      },
      skills: [],
    };
  }

  detectRoleAndLoadFromBackend(): void {
    const isHrRoute = this.router.url.startsWith('/hr');
    const storedRole = localStorage.getItem('role')?.toLowerCase();
    this.currentRole = isHrRoute || storedRole === 'hr' ? 'hr' : 'employee';

    if (this.authService.currentUser) {
      this.applyAuthenticatedUser(this.authService.currentUser);
    }

    this.authService.fetchCurrentUser().subscribe((user) => {
      if (user) {
        this.applyAuthenticatedUser(user);
      }
    });
  }

  private applyAuthenticatedUser(user: any): void {
    this.currentRole = user.portalType === 'hr' ? 'hr' : 'employee';
    const levelLabel = user.organizationalLevel || user.levelCode || '';
    this.profile = {
      ...this.profile,
      id: user.employeeCode || user.id || '',
      fullName: user.fullName || '',
      preferredName: (user.fullName || '').split(' ')[0] || '',
      email: user.email || '',
      personalEmail: user.email || '',
      roleTitle: user.designationTitle || user.levelName || '',
      department: user.departmentName || '',
      division: user.companyName ? `${user.companyName} (${levelLabel})` : levelLabel,
      reportingManager: user.reportingManagerName || 'Department Head',
      avatar:
        user.portalType === 'hr'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
      skills: Array.isArray(user.roles) ? user.roles : [],
    };
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
  }
}
