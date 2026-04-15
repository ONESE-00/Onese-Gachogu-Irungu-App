export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  idNumber: string;
  role: string;
  roleId: number;
  branch: string;
  branchId: number;
  subsidiary: string;
  subsidiaryId: number;
  password?: string;
  isActive: boolean;
  isLocked: boolean;
  createdAt: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  idNumber: string;
  roleId: number;
  role: string;
  branchId: number;
  branch: string;
  subsidiaryId: number;
  subsidiary: string;
  password: string;
  isActive: boolean;
  isLocked: boolean;
  createdAt: string;
  username: string;
}

export interface EditUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  idNumber?: string;
  roleId?: number;
  role?: string;
  branchId?: number;
  branch?: string;
  subsidiaryId?: number;
  subsidiary?: string;
}

export interface Analytics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  lockedUsers: number;
}

export interface Branch {
  id: number | string;
  name: string;
  subsidiaryId: number;
  code: string;
}

export interface Subsidiary {
  id: number | string;
  name: string;
  code: string;
  country: string;
}

export interface Role {
  id: number | string;
  name: string;
  code: string;
  description: string;
}
