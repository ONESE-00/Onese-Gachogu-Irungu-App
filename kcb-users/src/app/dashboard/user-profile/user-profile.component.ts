import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { User, Branch, Subsidiary, Role } from '../../core/models/user.model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  standalone: false,
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  editForm!: FormGroup;

  branches: Branch[] = [];
  subsidiaries: Subsidiary[] = [];
  roles: Role[] = [];
  filteredBranches: Branch[] = [];

  isPageLoading = true;
  isEditLoading = false;
  isLockLoading = false;
  isEditing = false;

  showLockDialog = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.editForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?\d{9,15}$/)]],
      idNumber: ['', [Validators.required, Validators.minLength(5)]],
      subsidiaryId: ['', Validators.required],
      branchId: ['', Validators.required],
      roleId: ['', Validators.required],
    });

    this.editForm.get('subsidiaryId')!.valueChanges.subscribe((subId) => {
      this.filteredBranches = this.branches.filter((b) => b.subsidiaryId === Number(subId));
    });

    forkJoin({
      user: this.userService.getUserById(id),
      branches: this.userService.getBranches(),
      subsidiaries: this.userService.getSubsidiaries(),
      roles: this.userService.getRoles(),
    }).subscribe({
      next: ({ user, branches, subsidiaries, roles }) => {
        this.user = user;
        this.branches = branches;
        this.subsidiaries = subsidiaries;
        this.roles = roles;
        this.filteredBranches = branches.filter((b) => b.subsidiaryId === user.subsidiaryId);
        this.patchForm(user);
        this.isPageLoading = false;
      },
      error: () => {
        this.isPageLoading = false;
        this.errorMessage = 'User not found.';
      },
    });
  }

  get f() { return this.editForm.controls; }

  get userInitials(): string {
    if (!this.user) return '';
    return `${this.user.firstName[0]}${this.user.lastName[0]}`.toUpperCase();
  }

  patchForm(user: User): void {
    this.editForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      idNumber: user.idNumber,
      subsidiaryId: user.subsidiaryId,
      branchId: user.branchId,
      roleId: user.roleId,
    });
  }

  startEditing(): void {
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEditing(): void {
    this.isEditing = false;
    if (this.user) this.patchForm(this.user);
  }

  onSave(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isEditLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const v = this.editForm.value;
    const selectedBranch = this.branches.find((b) => b.id === Number(v.branchId));
    const selectedSub = this.subsidiaries.find((s) => s.id === Number(v.subsidiaryId));
    const selectedRole = this.roles.find((r) => r.id === Number(v.roleId));

    const payload = {
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      phoneNumber: v.phoneNumber,
      idNumber: v.idNumber,
      subsidiaryId: Number(v.subsidiaryId),
      subsidiary: selectedSub?.name ?? '',
      branchId: Number(v.branchId),
      branch: selectedBranch?.name ?? '',
      roleId: Number(v.roleId),
      role: selectedRole?.name ?? '',
    };

    this.userService.editUser(this.user!.id, payload).subscribe({
      next: (updated) => {
        this.user = { ...this.user!, ...updated };
        this.isEditing = false;
        this.isEditLoading = false;
        this.successMessage = 'User profile updated successfully.';
      },
      error: () => {
        this.isEditLoading = false;
        this.errorMessage = 'Failed to update user. Please try again.';
      },
    });
  }

  openLockDialog(): void {
    this.showLockDialog = true;
  }

  onLockConfirm(): void {
    this.showLockDialog = false;
    this.isLockLoading = true;
    const action$ = this.user?.isLocked
      ? this.userService.unlockUser(this.user!.id)
      : this.userService.lockUser(this.user!.id);

    action$.subscribe({
      next: (updated) => {
        this.user = { ...this.user!, ...updated };
        this.isLockLoading = false;
        this.successMessage = this.user.isLocked
          ? 'User has been locked.'
          : 'User has been unlocked.';
      },
      error: () => {
        this.isLockLoading = false;
        this.errorMessage = 'Action failed. Please try again.';
      },
    });
  }

  onLockCancel(): void {
    this.showLockDialog = false;
  }

  goBack(): void {
    this.router.navigate(['/dashboard/all-users']);
  }
}
