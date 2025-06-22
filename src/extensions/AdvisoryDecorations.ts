import { Extension, StateEffect, StateField } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';
import { AdvisoryComment } from '../types';

// Get CSS class for advisory comments - using consistent yellow styling
const getAdvisoryCssClass = (): string => 
  // All advisory comments use the same yellow styling to match landing page
  // and avoid conflicts with grammar feedback colors
  'wordwise-advisory-comment';

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
            const cssClass = getAdvisoryCssClass();
            
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
    '.wordwise-advisory-comment': {
      backgroundColor: 'rgba(245, 158, 11, 0.1)', // Amber/yellow background
      borderBottom: '2px dotted #f59e0b', // Amber/yellow dotted border
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