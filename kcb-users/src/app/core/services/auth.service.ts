import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API = 'http://localhost:3000';
  private readonly CURRENT_USER_KEY = 'kcb_current_user';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<User> {
    return this.http
      .get<User[]>(`${this.API}/users`)
      .pipe(
        switchMap((users) => {
          const user = users.find((u) => u.email === username);
          if (!user || password !== 'kcb123') {
            return throwError(() => new Error('Invalid username or password.'));
          }
          if (user.isLocked) {
            return throwError(
              () => new Error('Your account is locked. Please contact your administrator.')
            );
          }
          this.setCurrentUser(user);
          return [user];
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): User | null {
    const stored = localStorage.getItem(this.CURRENT_USER_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  private setCurrentUser(user: User): void {
    // Never persist the password in localStorage
    const { password, ...safeUser } = user;
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(safeUser));
  }
}
