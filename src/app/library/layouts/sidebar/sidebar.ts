import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavLink } from '../../../core/models/sidebar.interface';
import { NAV_LINKS } from '../../../core/constants/navlinks';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  isOpen = false;

  // Tooltip state
  tooltipText = '';
  tooltipTop = 0;

  showTooltip(event: MouseEvent, label: string) {
    if (this.isOpen) return;
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.tooltipTop = rect.top + rect.height / 2;
    this.tooltipText = label;
  }

  hideTooltip() {
    this.tooltipText = '';
  }

  navLinks: NavLink[] = [];

  ngOnInit() {
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState) {
      this.isOpen = savedState === 'true';
    }
    this.filterNavLinks();

    this.authService.currentUser$.subscribe(() => {
      this.filterNavLinks();
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.filterNavLinks();
      });
  }

  private filterNavLinks() {
    const currentUser = this.authService.getCurrentUser();
    const roleFromStorage = (
      localStorage.getItem('user_role') ||
      localStorage.getItem('role') ||
      ''
    ).toLowerCase();
    const isEmployeeRoute =
      this.router.url === '/employee' || this.router.url.startsWith('/employee/');
    const isHrRoute =
      this.router.url === '/hr' || this.router.url.startsWith('/hr/');

    // Determine active portal ('hr' vs 'employee') from authenticated user / token role first
    const activeRole =
      currentUser?.portalType ||
      (roleFromStorage === 'hr' || roleFromStorage === 'employee' ? roleFromStorage : '') ||
      (isEmployeeRoute ? 'employee' : isHrRoute ? 'hr' : 'hr');

    const isLeadership = this.authService.isManagerOrLeadership();

    this.navLinks = NAV_LINKS.filter((link) => {
      if (!link.roles.includes(activeRole)) return false;

      // If a user is logged in and this link is managementOnly (e.g. L7-L10 Developer), filter by leadership status
      if (currentUser && link.managementOnly && !isLeadership) {
        return false;
      }

      return true;
    });
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
    localStorage.setItem('sidebarOpen', String(this.isOpen));
  }

  closeOnMobile() {
    if (window.innerWidth <= 768) {
      this.isOpen = false;
      localStorage.setItem('sidebarOpen', 'false');
    }
  }
}
