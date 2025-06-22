import { Extension, StateEffect, StateField } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';
import { CONTEXT_AWARE_CATEGORIES } from '../constants/advisoryConstants';
import { AdvisoryComment } from '../types';

// Get CSS class for advisory comments based on category type
const getAdvisoryCssClass = (reason: AdvisoryComment['reason']): string => {
  const isContextAware = CONTEXT_AWARE_CATEGORIES.includes(reason);
  return isContextAware ? 'wordwise-advisory-comment-blue' : 'wordwise-advisory-comment-amber';
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
        
        // Check document length
        const docLength = tr.newDoc.length;
        
        // Create decorations
        const decorationRanges = visibleComments
          .filter(comment => {
            // Validate indices before creating decorations
            if (comment.startIndex >= docLength || comment.endIndex > docLength) {
              return false;
            }
            return true;
          })
          .map(comment => {
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
    // Blue styling for context-aware categories
    '.wordwise-advisory-comment-blue': {
      backgroundColor: 'rgba(59, 130, 246, 0.1)', // Blue background (blue-500 with opacity)
      borderBottom: '2px dotted #3b82f6', // Blue dotted border (blue-500)
      cursor: 'pointer',
    },
    // Amber styling for standard categories
    '.wordwise-advisory-comment-amber': {
      backgroundColor: 'rgba(245, 158, 11, 0.1)', // Amber background (amber-500 with opacity)
      borderBottom: '2px dotted #f59e0b', // Amber dotted border (amber-500)
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