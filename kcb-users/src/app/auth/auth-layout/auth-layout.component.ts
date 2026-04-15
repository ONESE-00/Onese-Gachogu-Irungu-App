import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  standalone: false,
})
export class AuthLayoutComponent {
  year = new Date().getFullYear();
}
