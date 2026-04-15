import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { AllUsersComponent } from './all-users/all-users.component';
import { ManageUserComponent } from './manage-user/manage-user.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'all-users', pathMatch: 'full' },
      { path: 'all-users', component: AllUsersComponent },
      { path: 'manage-user', component: ManageUserComponent },
      { path: 'user-profile/:id', component: UserProfileComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
