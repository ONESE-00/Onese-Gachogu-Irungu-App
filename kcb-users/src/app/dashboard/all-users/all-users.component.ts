import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserService } from '../../core/services/user.service';
import { User, Analytics } from '../../core/models/user.model';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  standalone: false,
})
export class AllUsersComponent implements OnInit {
  users: User[] = [];
  analytics: Analytics = { totalUsers: 0, activeUsers: 0, inactiveUsers: 0, lockedUsers: 0 };
  isLoading = true;
  searchControl = new FormControl('');

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadAnalytics();
    this.loadUsers();

    this.searchControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((term) => this.onSearch(term ?? ''));
  }

  loadAnalytics(): void {
    this.userService.getAnalytics().subscribe({
      next: (data) => (this.analytics = data),
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  onSearch(term: string): void {
    const trimmed = term.trim();
    if (!trimmed) {
      this.loadUsers();
      return;
    }
    this.isLoading = true;
    // JSON Server supports full-text search via `q` param, but we use firstName filter here
    // this.userService.searchUsers({ firstName: trimmed }).subscribe({
    //   next: (data) => {
    //     this.users = data;
    //     this.isLoading = false;
    //   },
    //   error: () => (this.isLoading = false),
    // });
    this.users = this.users.filter((u) => u.firstName.toLowerCase().includes(trimmed.toLowerCase()) || u.lastName.toLowerCase().includes(trimmed.toLowerCase()) || u.email.toLowerCase().includes(trimmed.toLowerCase()));
    this.isLoading = false;
  }

  viewUser(id: number): void {
    this.router.navigate(['/dashboard/user-profile', id]);
  }

  getStatusClass(user: User): string {
    if (user.isLocked) return 'badge-locked';
    if (user.isActive) return 'badge-active';
    return 'badge-inactive';
  }

  getStatusLabel(user: User): string {
    if (user.isLocked) return 'Locked';
    if (user.isActive) return 'Active';
    return 'Inactive';
  }

  analyticsCards: { key: keyof Analytics; label: string; icon: string; color: string }[] = [
    { key: 'totalUsers',   label: 'Total Users',    icon: 'group',         color: 'analytics-icon-blue' },
    { key: 'activeUsers',  label: 'Active Users',   icon: 'check_circle',  color: 'analytics-icon-green' },
    { key: 'inactiveUsers',label: 'Inactive Users', icon: 'pause_circle',  color: 'analytics-icon-gray' },
    { key: 'lockedUsers',  label: 'Locked Users',   icon: 'lock',          color: 'analytics-icon-red' },
  ];

  getAnalyticsValue(key: keyof Analytics): number {
    return this.analytics[key];
  }
}
