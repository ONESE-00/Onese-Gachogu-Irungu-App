import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: false,
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  showLogoTooltip = false;
  currentUser: User | null = null;
  showLogoutDialog = false;

  navItems: NavItem[] = [
    { label: 'All Users', icon: 'group', route: '/dashboard/all-users' },
    { label: 'Onboard User', icon: 'person_add', route: '/dashboard/manage-user' },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  get userInitials(): string {
    if (!this.currentUser) return 'U';
    return `${this.currentUser.firstName[0]}${this.currentUser.lastName[0]}`.toUpperCase();
  }

  get userFullName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.showLogoTooltip = false;
    }
  }

  expandSidebar(): void {
    if (this.isCollapsed) {
      this.isCollapsed = false;
    }
  }

  onLogoutClick(): void {
    this.showLogoutDialog = true;
  }

  onLogoutConfirm(): void {
    this.showLogoutDialog = false;
    this.authService.logout();
  }

  onLogoutCancel(): void {
    this.showLogoutDialog = false;
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
