# Feature: Inline Advisory Comments

## Discussion Summary

**Context**: This feature evolved from the AI Comments V2 MVP (modal-based approach) to a full inline commenting system similar to Google Docs.

**Key Decisions Made**:
- **UI Pattern**: Follow existing suggestion popover pattern rather than modal approach
- **Editor Integration**: Use CodeMirror decorations for text highlighting, similar to existing spell check and tone suggestions
- **State Management**: Create separate advisory store (no database persistence - client-side only)
- **Auto-Refresh**: Trigger API analysis 5 seconds after user stops typing, clearing old comments and replacing with new ones
- **Comment Types**: Support both anchored (text-specific) and document-level comments
- **Backend**: Reuse existing `generateAdvisoryComments` function in `functions/src/utils/openai.ts` - no backend changes needed
- **User Actions**: Comments can be dismissed (tracked client-side, no persistence)
- **Collaboration**: No real-time features in this version (single user experience)

**Technical Approach**:
- Extend existing suggestion system architecture
- Create new CodeMirror decoration extension for advisory highlights
- Build new popover component following `SuggestionPopover` pattern
- Implement debounced auto-refresh hook
- Client-side state management only (no Firestore integration)

## Implementation Tasks

| Priority | Task Description | Implementation Details | Code Pointers | Dependencies | Completion |
|----------|------------------|----------------------|---------------|--------------|------------|
| **TYPES & INTERFACES** | | | | | |
| P0 | Define Advisory Comment Types | Create `AdvisoryComment` interface with id, type, originalText, explanation, startIndex, endIndex, reason | `src/types/index.ts` | None | ⬜ |
| P0 | Define Advisory Store Types | Create store state and action interfaces following existing store patterns | `src/store/advisory/advisory.types.ts` (new file) | AdvisoryComment type | ⬜ |
| **STATE MANAGEMENT** | | | | | |
| P0 | Create Advisory Store | Implement Zustand store with client-side state management following suggestion store pattern | `src/store/advisory/advisory.store.ts` (new file) | Zustand, existing store patterns | ⬜ |
| P0 | Create Advisory Store Actions | Implement actions for API calls, comment management, dismissal (client-side only) | `src/store/advisory/advisory.actions.ts` (new file) | Firebase functions, advisory store | ⬜ |
| P0 | Create Advisory Store Index | Export store components for clean imports following existing pattern | `src/store/advisory/index.ts` (new file) | All advisory store files | ⬜ |
| **CODEMIRROR INTEGRATION** | | | | | |
| P0 | Create Advisory Comment Decorations | Implement CodeMirror extension for highlighting text with advisory comments, similar to existing SuggestionDecorations | `src/extensions/AdvisoryDecorations.ts` (new file) | CodeMirror, existing decoration patterns | ⬜ |
| P0 | Integrate Advisory Decorations in Editor | Add advisory decorations to DocumentCodeMirrorEditor alongside existing decorations | `src/components/editor/DocumentCodeMirrorEditor.tsx` | Advisory decorations, existing editor setup | ⬜ |
| P0 | Update Editor Extensions Management | Ensure advisory decorations work with existing BasicFormattingDecorations and SuggestionDecorations | `src/extensions/` | All decoration extensions | ⬜ |
| **UI COMPONENTS** | | | | | |
| P0 | Create Advisory Comment Popover | Build popover component for displaying advisory comments, following SuggestionPopover pattern | `src/components/editor/AdvisoryPopover.tsx` (new file) | Existing popover patterns, advisory store | ⬜ |
| P0 | Create Advisory Comment Card | Build individual comment card component for display within popover | `src/components/editor/AdvisoryCard.tsx` (new file) | Advisory popover, advisory types | ⬜ |
| P0 | Integrate Advisory Popover in Editor | Add advisory popover to DocumentCodeMirrorEditor with proper positioning and state management | `src/components/editor/DocumentCodeMirrorEditor.tsx` | Advisory popover, existing editor | ⬜ |
| **AUTO-REFRESH SYSTEM** | | | | | |
| P0 | Create Advisory Auto-Refresh Hook | Implement debounced hook that triggers advisory analysis 5 seconds after typing stops | `src/hooks/useAdvisoryAutoRefresh.ts` (new file) | Debounce utility, advisory store | ⬜ |
| P0 | Integrate Auto-Refresh in Editor | Add auto-refresh hook to DocumentCodeMirrorEditor with proper cleanup and state management | `src/components/editor/DocumentCodeMirrorEditor.tsx` | Advisory auto-refresh hook, editor | ⬜ |
| P0 | Handle Advisory Comment Clearing | Implement logic to clear old advisory comments before applying new ones | Advisory store actions | Advisory store, comment management | ⬜ |
| **UTILITIES & HELPERS** | | | | | |
| P1 | Create Advisory Comment Utils | Implement helper functions for comment positioning, text matching, offset calculations | `src/utils/advisoryComments.ts` (new file) | Text utilities, existing patterns | ⬜ |
| P1 | Update Debounce Utility | Ensure debounce utility supports advisory comment use case with proper cleanup | `src/utils/debounce.ts` | None | ⬜ |
| P1 | Create Advisory Comment Constants | Define constants for comment types, styling, timing (5-second debounce) | `src/constants/advisoryConstants.ts` (new file) | None | ⬜ |
| **INTEGRATION** | | | | | |
| P1 | Handle Advisory Comments in Document Editor | Integrate advisory system into main DocumentEditor component | `src/components/DocumentEditor.tsx` | All advisory components, existing editor | ⬜ |
| P1 | Add Advisory Comment Error Handling | Implement proper error states and user feedback for failed advisory requests | Advisory store, UI components | Error handling patterns | ⬜ |
| P2 | Add Advisory Comment Loading States | Implement loading indicators during advisory comment generation | UI components, advisory store | Existing loading patterns | ⬜ |
| P2 | Performance Optimization | Optimize advisory comment rendering and memory usage for large documents | All advisory components | Performance best practices | ⬜ |

## Architecture Notes

- **No Database Changes**: All advisory comments are ephemeral and stored client-side only
- **API Integration**: Uses existing `generateAdvisoryComments` function from OpenAI utils
- **Pattern Consistency**: Follows established patterns from suggestion system (SuggestionPopover, SuggestionDecorations)
- **Auto-Refresh Logic**: Clear → Generate → Apply new comments every 5 seconds after typing stops
- **Comment Categories**: Strengthen Claims, Define Terms, Improve Flow, Add CTAs, Acknowledge Alternatives 