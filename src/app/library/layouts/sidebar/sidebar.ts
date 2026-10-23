import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavLink } from '../../../core/models/sidebar.interface';
import { NAV_LINKS } from '../../../core/constants/navlinks';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  private router = inject(Router);
  isOpen = false;

  // Tooltip state
  tooltipText = '';
  tooltipTop = 0;

  showTooltip(event: MouseEvent, label: string) {
    if (this.isOpen) return;
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.tooltipTop = rect.top + (rect.height / 2);
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

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.filterNavLinks();
      });
  }

  private filterNavLinks() {
    const roleFromStorage = localStorage.getItem('role')?.toLowerCase();
    const isEmployeeRoute = this.router.url.startsWith('/employee');
    const activeRole = roleFromStorage || (isEmployeeRoute ? 'employee' : 'hr');
    this.navLinks = NAV_LINKS.filter(link => link.roles.includes(activeRole));
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
