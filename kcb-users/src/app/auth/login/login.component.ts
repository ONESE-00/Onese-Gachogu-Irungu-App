import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { WebSocket } from '../../core/services/web-socket/web-socket';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  private destroy$ = new Subject<void>()

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private webSocketService: WebSocket,
  ) { }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }

    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    this.webSocketService.connect('wss://echo.websocket.org');

    this.webSocketService.getMessages()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (message) => this.errorMessage = `WebSocket Message: ${message}`,
      error: (err) => console.error('WebSocket error:', err),
      complete: () => console.log('WebSocket connection closed'),
    });
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;
    this.webSocketService.send('Login successful');
    this.isLoading = false;
    // this.authService.login(username, password).subscribe({
    //   next: () => {
    //     this.isLoading = false;
    //     // this.router.navigate(['/dashboard']);
    //     this.webSocketService.send('Login successful');
    //   },
    //   error: (err) => {
    //     this.isLoading = false;
    //     this.webSocketService.send(err.message || 'Login failed');
    //     // this.errorMessage = err.message || 'Login failed. Please try again.';
    //   },
    // });
  }

 
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
