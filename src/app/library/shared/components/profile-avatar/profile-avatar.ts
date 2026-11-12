import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-profile-avatar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-avatar.html',
  styleUrl: './profile-avatar.css'
})
export class ProfileAvatar implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  role: string = 'HR Admin';
  fullName: string = '';
  email: string = '';
  companyName: string = '';
  profileImage: string = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150';

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.fullName = user.fullName;
        this.email = user.email;
        this.companyName = user.companyName || '';
        const levelCode = user.levelCode || user.organizationalLevel || '';
        this.role = user.isMainHr
          ? `Main HR (${user.companyCode || levelCode})`
          : `${user.designationTitle || user.portalType.toUpperCase()} (${levelCode})`;
        this.profileImage = user.portalType === 'hr'
          ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';
      }
    });
  }

  get profileLink(): string {
    return '/my-profile';
  }

  logout(): void {
    this.authService.logout();
  }
}
