export interface User {
  id?: number;
  name: string;
  email: string;
}

export interface UserCreatePayload {
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
} 