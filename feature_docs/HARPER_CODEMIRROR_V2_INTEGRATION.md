# Feature Plan: Harper Linter & CodeMirror V2 Integration

### **Strategy**

This document outlines a phased approach to integrate the Harper grammar engine into our `EditorV2` component. Our strategy is to first stabilize the existing codebase from a previous refactor, creating a solid foundation. We will then build the Harper integration within the isolated `EditorV2` environment.

**Key Principles:**
- **Stabilize First:** All work begins with **Phase 0**, which is dedicated to cleaning up the current branch state by removing deprecated code and consolidating UI components.
- **Isolate New Work:** All new feature development will occur within `EditorV2.tsx` and its related hooks and utilities. The existing production editor will not be touched.
- **Defer Non-Essential Scope:** Integration with our custom `passiveAnalyzer` and final wiring into the `documentStore` for autosaving are explicitly deferred to a future phase to keep this effort focused and manageable.

---

### **Phase 0: Codebase Stabilization**

*Goal: Clean up the half-finished migration to establish a stable, working baseline.*

| Priority | Task Description | Implementation Details | Code Pointers | Dependencies | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P0** | **Remove Legacy Spell Checker** | Completely remove all code related to the deprecated `browserSpellChecker` and `useSpellCheck` hook. This includes deleting the files and cleaning up any lingering imports or function calls. | • **Delete:** `src/hooks/useSpellCheck.ts`<br/>• **Delete:** `src/utils/browserSpellChecker.ts` | None | ✅ **Complete** |
| **P0** | **Consolidate Suggestion Popovers** | Refactor to use a single, generic `SuggestionPopover.tsx`. Remove any temporary or redundant popovers (e.g., `SpellingSuggestionPopover`, `GrammarSuggestionPopover`) to centralize the popover logic. | • **Edit:** `src/components/editor/SuggestionPopover.tsx`<br/>• **Delete:** `src/components/editor/SpellingSuggestionPopover.tsx`<br/>• **Delete:** `src/components/editor/GrammarSuggestionPopover.tsx` | None | ✅ **Complete** |
| **P0** | **Reset `useSuggestions` Hook** | Refactor the `useSuggestions` hook to remove any temporary proof-of-concept logic. Establish a clean, minimal version of the hook that is ready for the new Harper-only linter logic. | • **Edit:** `src/hooks/useSuggestions.ts` | None | ✅ **Complete** |
| **P0** | **Stabilize Suggestion Store** | Review and clean up the pending changes in `suggestionStore`. Ensure its state and actions are consistent and do not contain references to the removed spell checker. | • **Edit:** `src/store/suggestion/suggestion.store.ts`<br/>• **Edit:** `src/store/suggestion/suggestion.types.ts` | Task 1 | ✅ **Complete** |

### **Phase 1: Backend & State Management (Harper Integration)**

*Goal: Integrate Harper as the primary source of suggestions, managed through our global state.*

| Priority | Task Description | Implementation Details | Code Pointers | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| **P1** | **Define Rich Suggestion Types** | Update `BaseSuggestion` to include a `title: string` (for Harper's `lint_kind`) and an `actions` array. Create a `SuggestionAction` union type for `{ type: 'replace', ... }`, `{ type: 'remove' }`, etc. | • **Edit:** `src/types/index.ts`<br/>• **Edit:** `src/store/suggestion/suggestion.types.ts` | Phase 0 |
| **P1** | **Create Harper Lint Kind Mapper** | Create a utility function `mapHarperLintKind` that takes a Harper `lint_kind` string and returns our corresponding internal category (`'grammar'`, `'clarity'`, etc.). | • **Create:** `src/utils/harperMapping.ts` | None |
| **P1** | **Implement Harper Linter Logic** | In the `useSuggestions` hook, implement the logic to run Harper's linter on the document text. **Note: Do not integrate `passiveAnalyzer` at this time.** | • **Edit:** `src/hooks/useSuggestions.ts`<br/>• **Use:** `src/utils/harperLinterSource.ts` | Task 5, Task 6 |
| **P1** | **Process Raw Lints into App State** | Within `useSuggestions`, transform raw Harper output into our rich `Suggestion` objects, setting the `type`, `title`, and `actions` array using the mapper. | • **Edit:** `src/hooks/useSuggestions.ts` | Task 7 |
| **P1** | **Dispatch Suggestions to Store** | The `useSuggestions` hook will call an action (e.g., `setSuggestions`) to update the global `suggestionStore` with the processed Harper suggestions. | • **Edit:** `src/hooks/useSuggestions.ts`<br/>• **Use:** `src/store/suggestion/suggestion.actions.ts` | Task 8 |

### **Phase 2: Frontend (EditorV2) Integration**

*Goal: Connect the `EditorV2` component to the suggestion store to display highlights and actions.*

| Priority | Task Description | Implementation Details | Code Pointers | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| **P2** | **Drive Decorations from Store** | `EditorV2` will read the suggestion list from `suggestionStore` and use a CodeMirror `ViewPlugin` to render decorations (underlines) based on this global state. | • **Edit:** `src/components/EditorV2.tsx`<br/>• **Use:** `src/store/suggestion/suggestion.store.ts` | Task 9 |
| **P2** | **Enhance Suggestion Popover** | Update `SuggestionPopover` to display `suggestion.title` as its header and render action buttons based on the `suggestion.actions` array. | • **Edit:** `src/components/editor/SuggestionPopover.tsx` | Task 5 |
| **P2** | **Implement "Apply Action" Logic** | The popover will emit a `SuggestionAction` on click. `EditorV2` will listen and dispatch the correct CodeMirror transaction (`replace`, `delete`, `insert`) to apply the change. | • **Edit:** `src/components/EditorV2.tsx`<br/>• **Edit:** `src/components/editor/SuggestionPopover.tsx` | Task 11 |
| **P3** | **Implement Suggestion Toggles** | The `SuggestionToggles` component will filter suggestions by type (`grammar`, `clarity`, etc.) by updating state in the `suggestionStore`. | • **Use:** `src/components/editor/SuggestionToggles.tsx`<br/>• **Edit:** `src/components/EditorV2.tsx`<br/>• **Edit:** `src/store/suggestion/suggestion.store.ts` | Task 10 | 