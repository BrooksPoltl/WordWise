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
  documentType?: string;
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

export type SuggestionType =
  | 'spelling'
  | 'grammar'
  | 'style'
  | 'weasel_word'
  | 'conciseness'
  | 'readability'
  | 'passive';

export type Suggestion = {
  id: string;
  text: string;
};

// Legacy type for backward compatibility
export type SuggestionOption = Suggestion;

// Legacy spelling suggestion type for backward compatibility
export interface SpellingSuggestion extends BaseSuggestion {
  type: 'spelling';
}

export type SuggestionAction =
  | { type: 'replace'; text: string }
  | { type: 'remove' }
  | { type: 'insert_after'; text: string };

// Base suggestion type
export interface BaseSuggestion {
  id: string;
  type: SuggestionType;
  title: string; // Harper's lint_kind for display (e.g., "Spelling", "Word Choice")
  word: string;
  text: string; // The actual text content of the suggestion
  startOffset: number;
  endOffset: number;
  suggestions?: Suggestion[];
  actions?: SuggestionAction[]; // Rich actions for Harper suggestions
  explanation?: string;
}

export interface GrammarSuggestion extends BaseSuggestion {
  raw: Diagnostic;
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

// All suggestion types now inherit from BaseSuggestion and have consistent properties
export interface ClaritySuggestion extends BaseSuggestion {
  type: 'style';
}

export interface ConcisenessSuggestion extends BaseSuggestion {
  type: 'conciseness';
}

export interface ReadabilitySuggestion extends BaseSuggestion {
  type: 'readability';
}

export interface PassiveSuggestion extends BaseSuggestion {
  type: 'passive';
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


