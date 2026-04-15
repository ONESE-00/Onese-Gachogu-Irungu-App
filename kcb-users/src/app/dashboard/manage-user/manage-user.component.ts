import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { Branch, Subsidiary, Role } from '../../core/models/user.model';

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  standalone: false,
})
export class ManageUserComponent implements OnInit {
  userForm!: FormGroup;
  branches: Branch[] = [];
  subsidiaries: Subsidiary[] = [];
  roles: Role[] = [];
  filteredBranches: Branch[] = [];

  isLoading = false;
  isRefDataLoading = true;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?\d{9,15}$/)]],
      idNumber: ['', [Validators.required, Validators.minLength(5)]],
      subsidiaryId: ['', Validators.required],
      branchId: ['', Validators.required],
      roleId: ['', Validators.required],
    });

    // Filter branches when subsidiary changes
    this.userForm.get('subsidiaryId')!.valueChanges.subscribe((subId) => {
      this.filteredBranches = this.branches.filter(
        (b) => b.subsidiaryId === Number(subId)
      );
      this.userForm.get('branchId')!.setValue('');
    });

    // Load reference data in parallel
    forkJoin({
      branches: this.userService.getBranches(),
      subsidiaries: this.userService.getSubsidiaries(),
      roles: this.userService.getRoles(),
    }).subscribe({
      next: ({ branches, subsidiaries, roles }) => {
        this.branches = branches;
        this.subsidiaries = subsidiaries;
        this.roles = roles;
        this.isRefDataLoading = false;
      },
      error: () => (this.isRefDataLoading = false),
    });
  }

  get f() { return this.userForm.controls; }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const v = this.userForm.value;
    const selectedBranch = this.branches.find((b) => b.id === Number(v.branchId));
    const selectedSub = this.subsidiaries.find((s) => s.id === Number(v.subsidiaryId));
    const selectedRole = this.roles.find((r) => r.id === Number(v.roleId));

    const username = `${v.firstName.toLowerCase()}.${v.lastName.toLowerCase()}`.replace(/\s+/g, '');

    const payload = {
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      username,
      phoneNumber: v.phoneNumber,
      idNumber: v.idNumber,
      roleId: Number(v.roleId),
      role: selectedRole?.name ?? '',
      branchId: Number(v.branchId),
      branch: selectedBranch?.name ?? '',
      subsidiaryId: Number(v.subsidiaryId),
      subsidiary: selectedSub?.name ?? '',
      password: 'kcb123',
      isActive: true,
      isLocked: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    this.userService.createUser(payload).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.successMessage = `User ${created.firstName} ${created.lastName} has been onboarded successfully.`;
        this.userForm.reset();
        this.filteredBranches = [];
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to create user. Please try again.';
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/all-users']);
  }
}
