import { User as FirebaseUser } from 'firebase/auth';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  language: string;
}

export interface UserCreatePayload {
  email: string;
  password: string;
  displayName?: string;
}

export interface UserLoginPayload {
  email: string;
  password: string;
}

export interface AuthUser extends FirebaseUser {
  // Additional custom properties if needed
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Document types
export interface Document {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  characterCount: number;
}

export interface DocumentCreatePayload {
  title: string;
  content?: string;
}

export interface DocumentUpdatePayload {
  id: string;
  title?: string;
  content?: string;
} 