import { Tone } from '../types';

export const TONE_OPTIONS: Tone[] = [
  'Friendly',
  'Professional',
  'Humorous',
  'Serious',
  'Academic',
  'Persuasive',
  'Empathetic',
];

export const TONE_EMOJI_MAP: Record<Tone, string> = {
  Friendly: '😊',
  Professional: '💼',
  Humorous: '😂',
  Serious: '🧐',
  Academic: '📚',
  Persuasive: '🗣️',
  Empathetic: '🤗',
} as const;

export const EDITOR_CONFIG = {
  AUTO_SAVE_DELAY: 3000,
  TONE_ANALYSIS_DELAY: 5000,
  LINTER_DEBOUNCE_DELAY: 500,
} as const; 