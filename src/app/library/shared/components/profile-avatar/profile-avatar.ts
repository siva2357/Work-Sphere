import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-avatar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-avatar.html',
  styleUrl: './profile-avatar.css'
})
export class ProfileAvatar implements OnInit {
  private router = inject(Router);

  role: string = 'HR Admin';
  fullName: string = 'Alex Morgan';
  email: string = 'alex.morgan@worksphere.com';
  profileImage: string = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150';

  ngOnInit(): void {
    const isEmployee = this.router.url.startsWith('/employee');
    const storedRole = localStorage.getItem('role');

    if (storedRole) {
      this.role = storedRole.toUpperCase();
    } else {
      this.role = isEmployee ? 'Employee' : 'HR Admin';
    }

    if (this.role.toLowerCase().includes('employee')) {
      this.fullName = 'John Doe';
      this.email = 'john.doe@worksphere.com';
      this.profileImage = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';
    }
  }

  get profileLink(): string {
    return this.router.url.startsWith('/employee') ? '/employee/my-profile' : '/hr/my-profile';
  }

  logout(): void {
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }
}
