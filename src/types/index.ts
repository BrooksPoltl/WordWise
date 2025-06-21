import { Diagnostic } from '@codemirror/lint';
import { User as FirebaseUser } from 'firebase/auth';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  preferences: UserPreferences;
  role?: string;
  persona?: string;
  onboardingCompleted?: boolean;
  message?: string;
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

// Base suggestion type
export interface BaseSuggestion {
  id: string;
  startOffset: number;
  endOffset: number;
  raw?: Diagnostic;
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
  context?: string;
  documentType?: string;
}

export interface DocumentCreatePayload {
  title?: string;
  content?: string;
  context?: string;
  documentType?: string;
}

export interface DocumentUpdatePayload {
  id: string;
  title?: string;
  content?: string;
  context?: string;
  documentType?: string;
}

// Spell checking types
export interface SuggestionOption {
  id: string;
  text: string;
}

export interface SpellingSuggestion extends BaseSuggestion {
  word: string;
  suggestions: SuggestionOption[];
  type: 'spelling' | 'grammar' | 'style';
}

export interface ClaritySuggestion extends BaseSuggestion {
  text: string;
  suggestions: SuggestionOption[];
  type: 'weasel_word';
  explanation: string;
}

export interface ConcisenessSuggestion extends BaseSuggestion {
  text: string;
  suggestions: SuggestionOption[];
  type: 'conciseness';
  explanation: string;
}

export interface ReadabilitySuggestion extends BaseSuggestion {
  text: string;
  type: 'readability';
  explanation: string;
  suggestions?: SuggestionOption[];
}

export interface PassiveSuggestion extends BaseSuggestion {
  text: string;
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

export interface AIComment {
  id: string;
  type: "REPLACEMENT" | "ADVICE";
  suggestion: string;
  originalText?: string;
  startIndex?: number;
  endIndex?: number;
  status: "active" | "resolved";
}

export interface AIAdvisorySuggestion {
  id: string; // Unique ID generated on the frontend for state management
  originalText: string; // The text the advice pertains to
  explanation: string; // The AI's advice
  startIndex: number;
  endIndex: number;
}

export interface OnboardingContent {
  welcome: {
    TITLE: string;
  };
  persona: {
    TITLE: string;
    DESCRIPTION: string;
  };
  writingStyle: {
    TITLE: string;
  };
}


