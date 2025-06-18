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
  SPELL_CHECK_DELAY: 1500,
  TONE_ANALYSIS_DELAY: 5000,
  PASTE_CHECK_DELAY: 100,
  TONE_REWRITE_DELAY: 100,
} as const; 