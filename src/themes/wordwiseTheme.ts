import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

// Define the WordWise color palette
const colors = {
  background: '#ffffff',
  surface: '#f8fafc',
  foreground: '#1e293b',
  muted: '#64748b',
  accent: '#3b82f6',
  border: '#e2e8f0',
  selection: '#dbeafe',
  cursor: '#1e40af',
  
  // Syntax highlighting colors
  keyword: '#7c3aed',
  string: '#059669',
  comment: '#6b7280',
  number: '#dc2626',
  operator: '#374151',
  
  // Harper suggestion colors
  grammar: '#ef4444',
  clarity: '#8b5cf6',
  conciseness: '#06b6d4',
  readability: '#10b981',
  passive: '#f97316',
};

// Create the syntax highlighting theme
const wordwiseHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: colors.keyword, fontWeight: 'bold' },
  { tag: t.string, color: colors.string },
  { tag: t.comment, color: colors.comment, fontStyle: 'italic' },
  { tag: t.number, color: colors.number },
  { tag: t.operator, color: colors.operator },
  { tag: t.variableName, color: colors.foreground },
  { tag: t.typeName, color: colors.accent },
  { tag: t.propertyName, color: colors.accent },
  { tag: t.heading, color: colors.foreground, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.link, color: colors.accent, textDecoration: 'underline' },
]);

// Create the editor theme
const wordwiseEditorTheme = EditorView.theme({
  // Editor container
  '&': {
    color: colors.foreground,
    backgroundColor: colors.background,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  
  // Content area
  '.cm-content': {
    padding: '16px',
    minHeight: '300px',
    caretColor: colors.cursor,
  },
  
  // Focused state
  '&.cm-focused': {
    outline: 'none',
  },
  
  '&.cm-focused .cm-content': {
    outline: `2px solid ${colors.accent}`,
    outlineOffset: '-2px',
    borderRadius: '4px',
  },
  
  // Cursor
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: colors.cursor,
    borderLeftWidth: '2px',
  },
  
  // Selection
  '.cm-selectionBackground, .cm-focused .cm-selectionBackground': {
    backgroundColor: colors.selection,
  },
  
  // Harper suggestions
  '.harper-suggestion': {
    textDecoration: 'underline wavy',
    textDecorationColor: colors.grammar,
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
  
  '.harper-suggestion:hover': {
    opacity: 0.8,
  },
  
  // Tooltips
  '.cm-tooltip': {
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: '6px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    fontSize: '13px',
    padding: '8px 12px',
    color: colors.foreground,
  },
  
  // Placeholder
  '.cm-placeholder': {
    color: colors.muted,
    fontStyle: 'italic',
  },
}, { dark: false });

// Combine the theme extensions
export const wordwiseTheme: Extension = [
  wordwiseEditorTheme,
  syntaxHighlighting(wordwiseHighlightStyle),
]; 