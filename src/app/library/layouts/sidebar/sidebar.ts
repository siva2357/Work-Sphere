import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavLink, NavSection } from '../../../core/models/sidebar.interface';
import { NAV_LINKS } from '../../../core/constants/navlinks';
import { AuthService } from '../../../core/services/auth.service';
import { AuthenticatedUser } from '../../../core/models/auth.interface';

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

  currentUser: AuthenticatedUser | null = null;
  userLevelCode = 'L8';
  userRoleCode = 'EMP_EMPLOYEE';
  userEmployeeCode = '';
  userDepartment = '';

  navLinks: NavLink[] = [];
  navSections: NavSection[] = [];

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

  get userTooltipText(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.fullName} (${this.userEmployeeCode || 'No Code'}) • Level: ${this.userLevelCode} • ${this.userRoleCode}`;
  }

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
    this.currentUser = this.authService.getCurrentUser();
    const roleFromStorage = (
      localStorage.getItem('user_role') ||
      localStorage.getItem('role') ||
      ''
    ).toLowerCase();
    const isEmployeeRoute =
      this.router.url === '/employee' || this.router.url.startsWith('/employee/');
    const isHrRoute =
      this.router.url === '/hr' || this.router.url.startsWith('/hr/');

    // Determine active portal ('hr' vs 'employee')
    const activeRole =
      this.currentUser?.portalType ||
      (roleFromStorage === 'hr' || roleFromStorage === 'employee' ? roleFromStorage : '') ||
      (isEmployeeRoute ? 'employee' : isHrRoute ? 'hr' : 'hr');

    this.userLevelCode = (
      this.currentUser?.levelCode ||
      this.currentUser?.organizationalLevel ||
      (activeRole === 'hr' ? 'L2' : 'L8')
    ).toUpperCase();

    const primaryRole = this.currentUser?.roles?.[0];
    this.userRoleCode = (
      primaryRole ||
      (this.currentUser?.isMainHr
        ? 'EMP_HR_ADMIN'
        : activeRole === 'hr'
        ? 'EMP_HR_ADMIN'
        : 'EMP_EMPLOYEE')
    ).toUpperCase();

    this.userEmployeeCode = this.currentUser?.employeeCode || '';
    this.userDepartment = this.currentUser?.departmentName || '';

    // Extract numeric level (e.g. "L2" -> 2, "L8" -> 8)
    let numericLevel = 8;
    const match = this.userLevelCode.match(/\d+/);
    if (match) {
      numericLevel = parseInt(match[0], 10);
    }
    if (this.currentUser?.isMainHr) {
      numericLevel = 1;
    }

    const isLeadership = this.authService.isManagerOrLeadership();
    const userRoles = (this.currentUser?.roles || []).map((r) => r.toUpperCase());
    if (this.currentUser?.isMainHr && !userRoles.includes('EMP_HR_ADMIN')) {
      userRoles.push('EMP_HR_ADMIN');
    }

    const filtered = NAV_LINKS.filter((link) => {
      // 1. Portal filter ('hr' vs 'employee')
      if (!link.roles.includes(activeRole)) return false;

      // 2. Specific role code filter (e.g. only EMP_HR_ADMIN or EMP_PAYROLL_ADMIN)
      if (link.allowedRoleCodes && link.allowedRoleCodes.length > 0) {
        if (!this.currentUser?.isMainHr) {
          const hasRole = link.allowedRoleCodes.some((rc) =>
            userRoles.includes(rc.toUpperCase())
          );
          if (!hasRole) return false;
        }
      }

      // 3. Level hierarchy filter (e.g. maxLevel: 6 means L1..L6 only)
      if (link.maxLevel !== undefined && !this.currentUser?.isMainHr) {
        if (numericLevel > link.maxLevel) return false;
      }
      if (link.minLevel !== undefined && !this.currentUser?.isMainHr) {
        if (numericLevel < link.minLevel) return false;
      }

      // 4. Leadership flag filter
      if (this.currentUser && link.managementOnly && !isLeadership) {
        return false;
      }

      return true;
    });

    this.navLinks = filtered;

    // Group links by section
    const sectionMap = new Map<string, NavLink[]>();
    for (const link of filtered) {
      const secTitle = link.section || 'General';
      if (!sectionMap.has(secTitle)) {
        sectionMap.set(secTitle, []);
      }
      sectionMap.get(secTitle)!.push(link);
    }

    this.navSections = Array.from(sectionMap.entries()).map(([title, links]) => ({
      title,
      links,
    }));
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
