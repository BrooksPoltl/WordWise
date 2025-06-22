# CodeMirror Document Integration

## Overview
This feature integrates the new CodeMirror editor with Harper.js linting into the existing documents/:id route, completely replacing the current TipTap-based editor while maintaining all existing functionality including auto-save, document settings, and AI-powered suggestions.

## Scope
- **Complete replacement** of existing editor with CodeMirror
- **Maintain** all existing document functionality (auto-save, settings, suggestions)
- **Remove** TipTap formatting toolbar (not needed for plain text)
- **Preserve** document data compatibility (no formatting to migrate)
- **No** suggestion toggles integration (deferred)

## Implementation Tasks

### Backend Integration
| Priority | Task | Implementation Details | Code Pointers | Dependencies | Complete |
|----------|------|----------------------|---------------|--------------|----------|
| P0 | Remove EditorContainer indirection | Replace EditorContainer.tsx with direct CodeMirror integration | `src/components/EditorContainer.tsx` | None | ❌ |
| P0 | Update DocumentEditor to use CodeMirror | Replace EditorV2 import with proper document-connected CodeMirror editor | `src/components/DocumentEditor.tsx:282` | Document store integration | ❌ |

### Frontend Core Integration  
| Priority | Task | Implementation Details | Code Pointers | Dependencies | Complete |
|----------|------|----------------------|---------------|--------------|----------|
| P0 | Create DocumentCodeMirrorEditor component | New component that wraps CodeMirrorEditor with document data | Create `src/components/editor/DocumentCodeMirrorEditor.tsx` | Document store, auto-save hook | ❌ |
| P0 | Connect document data to editor | Load document content from currentDocument into initialContent prop | `src/store/document/document.store.ts:60`, `src/types/index.ts:87-98` | Document store | ❌ |
| P0 | Integrate auto-save functionality | Connect onChange handler to useAutoSave hook | `src/hooks/useAutoSave.ts:48`, `src/components/editor/CodeMirrorEditor.tsx:426` | Auto-save hook | ❌ |
| P0 | Add document title editing | Integrate title editing with document update actions | `src/store/document/document.actions.ts`, `src/components/DocumentEditor.tsx` | Document actions | ❌ |

### Settings Integration
| Priority | Task | Implementation Details | Code Pointers | Dependencies | Complete |
|----------|------|----------------------|---------------|--------------|----------|
| P1 | Integrate DocumentSettingsBar | Connect document type and context modal to new editor | `src/components/editor/DocumentSettingsBar.tsx:101` | Document update actions | ❌ |
| P1 | Connect UpdateContextModal | Ensure context updates work with new editor | `src/components/editor/UpdateContextModal.tsx` | Document settings | ❌ |
| P2 | Remove formatting toolbar | Remove EditorToolbar and TipTap-specific formatting options | `src/components/editor/EditorToolbar.tsx` | None | ❌ |

### Suggestion System Migration
| Priority | Task | Implementation Details | Code Pointers | Dependencies | Complete |
|----------|------|----------------------|---------------|--------------|----------|
| P0 | Connect suggestion store to decorations | Ensure all suggestion types flow through SuggestionDecorations | `src/extensions/SuggestionDecorations.ts:139`, `src/store/suggestion/suggestion.store.ts` | Suggestion store | ❌ |
| P1 | Update suggestion popovers | Ensure SuggestionPopover works with CodeMirror positioning | `src/components/editor/SuggestionPopover.tsx` | CodeMirror integration | ❌ |
| P2 | Remove TipTap suggestion extensions | Clean up old TipTap-based suggestion handling | Legacy TipTap files | None | ❌ |

### Route & Navigation
| Priority | Task | Implementation Details | Code Pointers | Dependencies | Complete |
|----------|------|----------------------|---------------|--------------|----------|
| P0 | Update App.tsx routing | Ensure /document/:id route properly loads new editor | `src/App.tsx:81` | DocumentEditor updates | ❌ |
| P2 | Remove /editor-v2 demo route | Clean up standalone demo route after integration | `src/App.tsx:67` | None | ❌ |
| P2 | Update navigation links | Ensure dashboard links go to correct document editor | Dashboard components | None | ❌ |

### Testing & Cleanup
| Priority | Task | Implementation Details | Code Pointers | Dependencies | Complete |
|----------|------|----------------------|---------------|--------------|----------|
| P1 | Test document loading/saving | Verify documents load correctly and auto-save works | Full document flow | Core integration | ❌ |
| P1 | Test suggestion integration | Verify all suggestion types display and interact correctly | Suggestion system | Suggestion migration | ❌ |
| P2 | Test document settings | Verify document type changes and context updates work | Settings components | Settings integration | ❌ |
| P3 | Remove old TipTap dependencies | Clean up unused TipTap imports and components | Package.json, various files | All migrations complete | ❌ |

### Error Handling & Edge Cases
| Priority | Task | Implementation Details | Code Pointers | Dependencies | Complete |
|----------|------|----------------------|---------------|--------------|----------|
| P1 | Handle document loading states | Show proper loading/error states during document fetch | `src/components/DocumentEditor.tsx:282` | Document store | ❌ |
| P1 | Handle empty documents | Ensure editor works correctly with new/empty documents | Document creation flow | Core integration | ❌ |
| P2 | Handle large documents | Test performance with large document content | CodeMirror editor | None | ❌ |

## Key Integration Points

### Document Data Flow
1. `DocumentEditor.tsx` loads document via `useDocumentStore.fetchDocument()`
2. `DocumentCodeMirrorEditor` receives `currentDocument` and passes `content` to `CodeMirrorEditor`
3. Changes flow through `onChange` → `useAutoSave.debouncedSave` → `autoSaveDocument`

### Suggestion Integration
1. Existing suggestion stores continue working unchanged
2. `SuggestionDecorations.ts` handles visual highlighting in CodeMirror
3. `SuggestionPopover` shows suggestion details on click/hover

### Settings Integration
1. `DocumentSettingsBar` updates `currentDocument.documentType` and `context`
2. Changes trigger document update actions
3. No impact on editor state (settings are metadata)

## Risk Mitigation
- **Data Loss**: Auto-save is fire-and-forget, existing pattern
- **Performance**: CodeMirror handles large documents better than TipTap
- **Suggestion Accuracy**: Harper.js integration already tested in demo
- **User Experience**: Plain text editing is simpler than rich text

## Success Criteria
- [ ] Documents load correctly in new editor
- [ ] Auto-save functions properly
- [ ] All suggestion types display and interact correctly  
- [ ] Document settings (type, context) work
- [ ] No regression in document operations (create, update, delete)
- [ ] Performance is equal or better than current editor 