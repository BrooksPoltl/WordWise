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

// Spell checking types
export interface SuggestionOption {
  id: string;
  text: string;
}

export interface SpellingSuggestion {
  id: string;
  word: string;
  startOffset: number;
  endOffset: number;
  suggestions: SuggestionOption[];
  type: 'spelling' | 'grammar' | 'style';
}

export interface ClaritySuggestion {
  id: string;
  text: string;
  startOffset: number;
  endOffset: number;
  suggestions: SuggestionOption[];
  type: 'weasel_word';
  explanation: string;
}

export interface ConcisenessSuggestion {
  id: string;
  text: string;
  startOffset: number;
  endOffset: number;
  suggestions: SuggestionOption[];
  type: 'conciseness';
  explanation: string;
}

export interface ReadabilitySuggestion {
  id: string;
  text: string;
  startOffset: number;
  endOffset: number;
  type: 'readability';
  explanation: string;
  suggestions?: SuggestionOption[];
}

export interface PassiveSuggestion {
  id: string;
  text: string;
  startOffset: number;
  endOffset: number;
  type: 'passive';
  explanation: string;
  suggestions?: SuggestionOption[];
}

export interface WritingMetrics {
  wordCount: number;
  characterCount: number;
  spellingErrors: number;
}

// Tone analysis types
export type Tone =
  | 'Friendly'
  | 'Professional'
  | 'Humorous'
  | 'Serious'
  | 'Academic'
  | 'Persuasive'
  | 'Empathetic';

export interface ToneDetectResult {
  tone: Tone;
  confidence?: number;
}


