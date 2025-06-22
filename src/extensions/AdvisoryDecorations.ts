import { Extension, StateEffect, StateField } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';
import { AdvisoryComment } from '../types';

// Get CSS class for advisory comment reason
const getAdvisoryCssClass = (reason: AdvisoryComment['reason']): string => {
  switch (reason) {
    case 'Strengthen a Claim':
      return 'wordwise-advisory-strengthen';
    case 'Define a Key Term/Acronym':
      return 'wordwise-advisory-define';
    case 'Improve Structural Flow':
      return 'wordwise-advisory-flow';
    case 'Add a Clear Call to Action':
      return 'wordwise-advisory-cta';
    case 'Acknowledge Alternatives':
      return 'wordwise-advisory-alternatives';
    default:
      return 'wordwise-advisory-default';
  }
};

// State effect to update advisory comments
export const updateAdvisoryComments = StateEffect.define<{
  comments: AdvisoryComment[];
}>();

// Advisory decoration field
export const advisoryDecorationField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    // Map existing decorations through document changes
    let newDecorations = decorations.map(tr.changes);
    
    // Check for advisory comment updates
    for (const effect of tr.effects) {
      if (effect.is(updateAdvisoryComments)) {
        const { comments } = effect.value;
        
        // Filter visible (non-dismissed) comments
        const visibleComments = comments.filter(comment => !comment.dismissed);
        
        // Create decorations
        const decorationRanges = visibleComments.map(comment => {
          const cssClass = getAdvisoryCssClass(comment.reason);
          return Decoration.mark({
            class: cssClass,
            attributes: {
              'data-advisory-id': comment.id,
              'data-advisory-reason': comment.reason,
            }
          }).range(comment.startIndex, comment.endIndex);
        });
        
        newDecorations = Decoration.set(decorationRanges, true);
      }
    }
    
    return newDecorations;
  },
  provide: f => EditorView.decorations.from(f)
});

// Create the advisory decoration extension
export const createAdvisoryDecorationExtension = (): Extension => [
  advisoryDecorationField,
  EditorView.theme({
    '.wordwise-advisory-strengthen': {
      backgroundColor: 'rgba(139, 92, 246, 0.1)', // Purple
      borderBottom: '2px dotted #8b5cf6',
      cursor: 'pointer',
    },
    '.wordwise-advisory-define': {
      backgroundColor: 'rgba(6, 182, 212, 0.1)', // Cyan
      borderBottom: '2px dotted #06b6d4',
      cursor: 'pointer',
    },
    '.wordwise-advisory-flow': {
      backgroundColor: 'rgba(16, 185, 129, 0.1)', // Emerald
      borderBottom: '2px dotted #10b981',
      cursor: 'pointer',
    },
    '.wordwise-advisory-cta': {
      backgroundColor: 'rgba(245, 158, 11, 0.1)', // Amber
      borderBottom: '2px dotted #f59e0b',
      cursor: 'pointer',
    },
    '.wordwise-advisory-alternatives': {
      backgroundColor: 'rgba(239, 68, 68, 0.1)', // Red
      borderBottom: '2px dotted #ef4444',
      cursor: 'pointer',
    },
    '.wordwise-advisory-default': {
      backgroundColor: 'rgba(107, 114, 128, 0.1)', // Gray
      borderBottom: '2px dotted #6b7280',
      cursor: 'pointer',
    },
  }),
];

// Helper function to update advisory comments in the editor
export const dispatchAdvisoryUpdate = (
  view: EditorView,
  comments: AdvisoryComment[]
) => {
  view.dispatch({
    effects: updateAdvisoryComments.of({ comments })
  });
}; 