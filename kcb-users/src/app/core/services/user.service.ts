import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  User,
  CreateUserPayload,
  EditUserPayload,
  Analytics,
  Branch,
  Subsidiary,
  Role,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // ─── Analytics ───────────────────────────────────────────────────────────────
  getAnalytics(): Observable<Analytics> {
    return this.http.get<Analytics>(`${this.API}/analytics`);
  }

  // ─── Users ────────────────────────────────────────────────────────────────────
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API}/users`);
  }

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.API}/users/${userId}`);
  }

  searchUsers(params: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    branch?: string;
    subsidiary?: string;
    isActive?: boolean;
    isLocked?: boolean;
  }): Observable<User[]> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<User[]>(`${this.API}/users`, { params: httpParams });
  }

  createUser(payload: CreateUserPayload): Observable<User> {
    return this.http.post<User>(`${this.API}/users`, payload);
  }

  editUser(userId: number, payload: EditUserPayload): Observable<User> {
    return this.http.patch<User>(`${this.API}/users/${userId}`, payload);
  }

  lockUser(userId: number): Observable<User> {
    return this.http.patch<User>(`${this.API}/users/${userId}`, { isLocked: true });
  }

  unlockUser(userId: number): Observable<User> {
    return this.http.patch<User>(`${this.API}/users/${userId}`, { isLocked: false });
  }

  // ─── Reference data ───────────────────────────────────────────────────────────
  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.API}/branches`);
  }

  getSubsidiaries(): Observable<Subsidiary[]> {
    return this.http.get<Subsidiary[]>(`${this.API}/subsidiaries`);
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.API}/roles`);
  }
}
