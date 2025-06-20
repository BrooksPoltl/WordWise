### Feature: Style Enhancement & UX Overhaul

### Session Summary (End of Last Session)
This document has been updated to reflect the significant progress made in refactoring the suggestion UI from a sidebar to an inline, popover-based system.

**Key Accomplishments:**
- **Complete UI/UX Overhaul:** The old `SuggestionSidebar` was successfully deprecated and replaced with a modern, inline suggestion model using Tiptap decorations and popovers.
- **Component Architecture:** We implemented a scalable popover system where a main `SuggestionPopover.tsx` acts as a dispatcher, routing suggestion data to specialized components like `SpellingSuggestionPopover.tsx`, `ClaritySuggestionPopover.tsx`, and `ConcisenessSuggestionPopover.tsx`.
- **Feature Implementation:** We fully implemented "Clarity (Weasel Words)" and "Conciseness (Wordy Phrases)" suggestions using `retext-equality` and `retext-simplify`. This included creating custom, user-friendly explanations for weasel words.
- **State Management:** The `suggestionStore` (Zustand) was successfully integrated and now serves as the single source of truth for all suggestion types, managed by the `useSuggestions` hook.
- **Robustness:** A critical race condition was solved by adding validation logic to `SuggestionDecorations.ts`, preventing crashes when deleting text containing suggestions.
- **Future-Proofing:** We laid the groundwork for the "Readability" feature by installing the required dependencies (`retext-readability`, `retext-passive`) and creating the initial `readabilityAnalyzer.ts`.

---

### 1. Feature Summary & Context

This document outlines the plan for implementing a new **Style Enhancement** feature in WordWise and a concurrent **UX Overhaul** for how all suggestions (including existing spell-checking) are presented to the user.

The primary goal is to provide users with real-time, actionable suggestions to improve the **clarity**, **conciseness**, and **readability** of their writing, while simultaneously modernizing the application's core user interaction model for suggestions.

### 2. Core Technology: The `retext` Ecosystem

After initial exploration of lower-level NLP libraries like `natural`, we have chosen to build this feature on the **`retext`** ecosystem. This decision is strategic:

*   **Modularity & Precision:** `retext`'s plugin-based architecture allows us to precisely target specific writing issues with dedicated, community-vetted packages. Its AST-based approach provides exact positional data for highlighting and replacing text.
*   **Industry Trust & Stability:** As a core part of the `unified` collective, `retext` is a well-maintained, stable, and trusted tool used in major projects by companies like Mozilla, Gatsby, and Shopify. This mitigates the risk of building on an unsupported or volatile dependency.

### 3. New User Experience Vision

We have successfully moved away from the `SuggestionSidebar` to an inline, contextual model.

*   **Inline Underlines and Pop-ups:** All suggestions now appear as colored underlines directly within the text editor.
    *   **Spelling:** Red underline.
    *   **Clarity:** Blue underline.
    *   **Conciseness:** Green underline.
    *   **Readability:** Purple underline.
    *   Interacting with an underline triggers a **`SuggestionPopover`**.
    *   **Architecture:** The `SuggestionPopover` is a dispatcher component that, based on the suggestion type, renders a more specific component (e.g., `SpellingSuggestionPopover`, `ClaritySuggestionPopover`). This makes the system scalable and easy to maintain.

*   **Lazy-Loading LLM Suggestions:** To provide powerful suggestions without perceived latency, we will use a hybrid approach for complex suggestions like passive voice and readability improvements.
    *   **Instant Detection:** A `retext` plugin (e.g., `retext-passive`, `retext-readability`) will instantly detect a potential issue and apply the appropriate underline.
    *   **Background Fetch:** The moment the underline appears, a non-blocking request will be sent to our backend.
    *   **AI-Powered Rewrite:** The backend will use the `gpt-4o` model to rewrite the sentence (e.g., in the active voice or as a simpler sentence).
    *   **Seamless UI Update:** The result will be sent back to the client. When the user clicks the underline, the `SuggestionPopover` will ideally already be populated with the high-quality AI suggestion. If the call is still in progress, a loading state will be shown.

*   **Suggestion Category Toggles:** To give users control over the density of feedback, a new UI element has been added to the editor toolbar.
    *   This component (`SuggestionToggles.tsx`) contains a list of clickable toggles for each suggestion category.
    *   Each toggle displays the category name and a live count of active suggestions in that category.
    *   Clicking a toggle shows or hide the corresponding underlines in the editor, allowing users to focus on one type of improvement at a time.

### 4. Detailed Feature Breakdown

The Style Enhancement feature is composed of the following checks, managed by the unified `useSuggestions` hook:

*   **Clarity Enhancement (Blue - `#3B82F6`)**
    *   **Passive Voice Detection:** Using `retext-passive`, we will identify sentences written in the passive voice. This serves as the trigger for the lazy-loaded LLM rewrite. The pop-up will explain *why* active voice is often better and offer the AI-generated alternative.
    *   **Weasel Word Detection:** Using `retext-equality`, we flag weak, hedging, or overly assertive words. The suggestion typically is to remove the word for a stronger statement. **This is complete, including custom, user-friendly explanations.** ✅

*   **Conciseness Enhancement (Green - `#10B981`)**
    *   **Wordy Phrase Simplification:** Using `retext-simplify`, we find and offer simpler, more direct alternatives for common verbose phrases (e.g., suggest "use" for "utilize", "about" for "in regards to", "to" for "in order to"). These are one-click replacements. ✅

*   **Readability Enhancement (Purple - `#8B5CF6`)**
    *   **Complex Sentence Flagging & Simplification:** Using `retext-readability`, we will calculate readability scores (e.g., Flesch-Kincaid) on the fly. Sentences that fall below a certain readability threshold (indicating they are too long or complex) will be underlined. This serves as the trigger for a lazy-loaded LLM rewrite to offer a simpler, more readable version of the sentence. ✅

### 5. Implementation Plan

### 6. Refactor Notes & Incremental Implementation Strategy

This section outlines the phased approach to implementing the Style Enhancement and UX Overhaul, focusing on incremental delivery and minimizing disruption.

**Key Principle for Refactor:** The initial phase of this refactor focuses *only* on changing the User Interface and User Experience for how suggestions are presented. The underlying logic for *how* spell-checking suggestions are generated (i.e., the `useSpellCheck.ts` hook and its dependencies) **will not be changed** in the initial increments. The existing `nspell` implementation is working well and will be retained. We are swapping out the presentation layer first.

---

**Increment 1: Foundational UX Replacement (Spelling Only - Phased)**

*   **Goal:** Completely replace the existing spell-check sidebar and score with the new inline, popover-based UX, focusing *only* on spelling errors. This ensures a direct feature swap with a new UI, without changing the underlying spell-check logic itself.
*   **Phased Tasks for this Increment:**
    1.  **Deprecate and Remove Old UI (Easiest First):**
        *   Task: Remove the `SuggestionSidebar` component from `DocumentEditor.tsx`.
            *   Details: Delete component import and usage.
            *   Code Pointers: `src/components/DocumentEditor.tsx`
        *   Task: Delete the `SuggestionSidebar.tsx` file.
            *   Details: Remove the file and any associated CSS or utility files specific to it.
            *   Code Pointers: `src/components/SuggestionSidebar.tsx`
        *   Task: Remove the "Spell Score" UI element.
            *   Details: Identify and remove the JSX and logic for displaying the spell score.
            *   Code Pointers: `src/components/editor/EditorHeader.tsx` (likely)
    2.  **Build and Test Core New UI for Spelling (Using Existing Logic):**
        *   Task: Create the `SuggestionPopover.tsx` component.
            *   Details: Build the reusable popover UI that will display suggestion details and actions. Initially, it will handle spelling suggestions.
            *   Code Pointers: `src/components/editor/SuggestionPopover.tsx` (new)
        *   Task: Create the `SuggestionDecorations.ts` Tiptap extension.
            *   Details: Develop the Tiptap extension to apply underlines to text based on suggestion data.
            *   Code Pointers: `src/extensions/SuggestionDecorations.ts` (new)
        *   Task: Integrate Popover and Decorations for Spell Check (Phased).
            *   **1.6.1: Render Spell-Check Underlines:** Reconnect `useSpellCheck` hook, implement logic in `SuggestionDecorations.ts` to draw underlines, add the extension to Tiptap, and add CSS for the styling.
            *   **1.6.2: Position and Trigger the Popover:** Add state to `TextEditor.tsx` to manage the popover's visibility and position. Add a Tiptap click handler to show the popover on interaction with a decoration.
            *   **1.6.3: Implement Popover Actions:** Build out the `SuggestionPopover.tsx` UI to show details and "Accept"/"Dismiss" buttons. Wire up the buttons to either apply the correction or hide the popover.
            *   Code Pointers: `src/components/TextEditor.tsx`, `src/hooks/useSpellCheck.ts`, `src/extensions/SuggestionDecorations.ts`, `src/components/editor/SuggestionPopover.tsx`
    3.  **Introduce State Management for Scalability (`suggestionStore`):**
        *   Task: Create the `suggestion.store.ts` (Zustand).
            *   Details: Define the store structure to hold suggestion data. Initially, it will be populated with spelling errors from `useSpellCheck.ts`.
            *   Code Pointers: `src/store/suggestion/suggestion.store.ts` (new), `src/store/suggestion/suggestion.types.ts` (new)
        *   Task: Refactor `TextEditor` to use `suggestionStore`.
            *   Details: Modify `TextEditor.tsx` (and potentially `DocumentEditor.tsx` or a relevant hook) to populate the `suggestionStore` with spell check results and read from the store to display suggestions. This ensures the store is correctly integrated.
            *   Code Pointers: `src/components/TextEditor.tsx`, `src/hooks/useSpellCheck.ts` (for populating the store)
    4.  **Final Editor Integration Review:**
        *   Task: Ensure `DocumentEditor.tsx` and `TextEditor.tsx` are correctly and efficiently using the `suggestionStore` and the new UI components (`SuggestionPopover`, `SuggestionDecorations.ts`) for a seamless inline spell-checking experience.
        *   Code Pointers: `src/components/DocumentEditor.tsx`, `src/components/TextEditor.tsx`

---

### Initial Refactor (Increment 1 - Spelling UX Replacement)

| Priority | Task Description                                     | Implementation Details                                                                                                                                                                                                                            | Code Pointers                                                                                                                                                              | Dependencies                                     | Completion |
| :------- | :--------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------- | :--------- |
| **High** | **1.1: Remove `SuggestionSidebar` from UI**          | Delete component import and usage from `DocumentEditor`.                                                                                                                                                                                          | `src/components/DocumentEditor.tsx`                                                                                                                                        | -                                                | ✅          |
| **High** | **1.2: Delete `SuggestionSidebar.tsx` file**         | Remove the file and any associated CSS or utility files specific to it.                                                                                                                                                                           | `src/components/SuggestionSidebar.tsx`                                                                                                                                     | -                                                | ✅          |
| **High** | **1.3: Remove "Spell Score" UI element**             | Identify and remove the JSX and logic for displaying the spell score.                                                                                                                                                                             | `src/components/editor/EditorHeader.tsx` (likely)                                                                                                                          | -                                                | ✅          |
| **High** | **1.4: Create `SuggestionPopover.tsx` component**    | Build the reusable popover UI to display suggestion details and actions. Evolved into a dispatcher for suggestion-specific popovers.                                                                                                                | `src/components/editor/SuggestionPopover.tsx`                                                                                                                              | Radix UI for Popover, Tailwind CSS             | ✅          |
| **High** | **1.5: Create `SuggestionDecorations.ts` extension** | Develop the Tiptap extension to apply underlines to text based on suggestion data.                                                                                                                                                                | `src/extensions/SuggestionDecorations.ts`                                                                                                                                  | Tiptap                                           | ✅          |
| **High** | **1.6: Render Spell-Check Underlines**               | Re-add `useSpellCheck` hook. Implement `SuggestionDecorations.ts` to draw underlines based on `useSpellCheck` data. Add extension to Tiptap.                                                                                                         | `src/components/TextEditor.tsx`<br>`src/hooks/useSpellCheck.ts`<br>`src/extensions/SuggestionDecorations.ts`<br>`src/hooks/useTextEditor.ts`                                    | `SuggestionDecorations.ts`                       | ✅          |
| **High** | **1.7: Position & Trigger Popover**                  | Add state to `TextEditor.tsx` to manage popover visibility/position. Use Tiptap click handler to show popover on decoration click.                                                                                                                   | `src/components/TextEditor.tsx`<br>`src/components/editor/SuggestionPopover.tsx`                                                                                            | `SuggestionPopover`                              | ✅          |
| **High** | **1.8: Implement Popover Actions**                   | Build out `SuggestionPopover` UI with "Accept"/"Dismiss" buttons. Wire up "Accept" to apply correction and "Dismiss" to hide.                                                                                                                       | `src/components/editor/SuggestionPopover.tsx`<br>`src/components/TextEditor.tsx`                                                                                            | Tasks 1.6, 1.7                                   | ✅          |
| **High** | **1.9: Create `suggestion.store.ts` (Zustand)**      | Define store structure for suggestion data. Initially populate with spelling errors from `useSpellCheck.ts`.                                                                                                                                    | `src/store/suggestion/suggestion.store.ts` (new)<br>`src/store/suggestion/suggestion.types.ts` (new)                                                                  | Zustand                                          | ✅          |
| **High** | **1.10: Refactor `TextEditor` to use `suggestionStore`**| Modify `TextEditor.tsx` (and relevant calling components/hooks) to populate and read from `suggestionStore` for spell check results.                                                                                                                  | `src/components/TextEditor.tsx`<br>`src/hooks/useSpellCheck.ts` (for populating store)                                                                                    | `suggestion.store.ts`                            | ✅          |
| **High** | **1.11: Final Editor Integration Review**             | Ensure `DocumentEditor.tsx` & `TextEditor.tsx` correctly use `suggestionStore` & new UI components for a seamless inline spell-checking experience.                                                                                              | `src/components/DocumentEditor.tsx`<br>`src/components/TextEditor.tsx`                                                                                                    | All tasks in Increment 1                         | ✅          |

---

### Backend

| Priority | Task Description                       | Implementation Details                                                                                                                                                                             | Code Pointers                                                              | Dependencies      | Completion |
| :------- | :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- | :---------------- | :--------- |
| **High** | Extend Firebase Function for Style Correction | - Add a new route (`/style`) to the existing Express app in the main cloud function.<br>- This route will be handled by a new `style.ts` handler.<br>- Use the `gpt-4o` model via the OpenAI API to rewrite passive voice sentences into active voice.<br>- Ensure the route is protected by the existing authentication middleware. | `functions/src/index.ts`<br>`functions/src/handlers/style.ts` (new) | - OpenAI API Key  | ✅          |

---

### Future Frontend Increments (Post-Refactor)

| Priority | Task Description                               | Implementation Details                                                                                                                                                                                                                                                        | Code Pointers                                                                      | Dependencies          | Completion |
| :------- | :--------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- | :-------------------- | :--------- |
| **High**   | **Setup: Install Style Dependencies**          | Install the necessary `retext` packages: `retext-english`, `retext-passive`, `retext-readability`, `retext-simplify`, `retext-equality`.                                                                                                                                       | `package.json`                                                                     | -                     | ✅          |
| **High**   | **Core: Create Unified `useSuggestions` Hook** | - A single hook now manages all text suggestions.<br>- It runs `retext` for all categories and incorporates the existing spell-check logic, populating the `suggestionStore`.<br>- For `retext-passive` and `retext-readability` detections, it needs to trigger a lazy-loaded call to the `/style` backend endpoint. | `src/hooks/useSuggestions.ts`<br>`src/utils/clarityAnalyzer.ts`<br>`src/utils/concisenessAnalyzer.ts` | - `retext` packages | ✅          |
| **Medium** | **UI: Create `SuggestionToggles` Component**   | - Create the new component for filtering suggestions (`Spelling`, `Clarity`, etc.).<br>- Each toggle has a color-coded dot, category name, and suggestion count.<br>- Clicking a toggle updates the `suggestionStore` to filter suggestions in the editor.                      | `src/components/editor/SuggestionToggles.tsx` (new)                                | - `suggestionStore`   | ✅          |

---

### Next Steps & Future Enhancements

This section outlines the critical path forward to complete the Style Enhancement feature set and refine the user experience.

| Priority | Task Description                                                    | Implementation Details                                                                                                                                                                                                                                     | Code Pointers                                                                                                                                                                                                    | Status    |
| :------- | :------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------- |
| **High**   | **1. Implement Readability (Complex Sentences)**            | - Integrate `retext-readability` into `readabilityAnalyzer.ts`.<br>- On detection, trigger a call to the backend AI service for an active voice rewrite.<br>- Create a `ReadabilitySuggestionPopover.tsx` to show the explanation and the AI suggestion (with a loading state). | `src/utils/readabilityAnalyzer.ts`<br>`src/hooks/useReadabilityRewrite.ts` (new)<br>`src/components/editor/ReadabilitySuggestionPopover.tsx` (new)                                                                | ✅         |
| **High**   | **2. Implement Passive Voice Detection**                    | - Integrate `retext-passive` into a new `passiveVoiceAnalyzer.ts`.<br>- On detection, trigger a call to a new backend AI service for an active voice rewrite.<br>- Create a new `PassiveSuggestionPopover.tsx` to show the explanation and the AI suggestion (with a loading state).<br>- Add a new "Passive" toggle to the UI. | `src/utils/passiveVoiceAnalyzer.ts` (new)<br>`src/hooks/usePassiveVoiceRewrite.ts` (new)<br>`src/components/editor/PassiveSuggestionPopover.tsx` (new)                                                          | ☐         |
| **Medium** | **3. UI/UX Refinement & Consistency**                               | - Conduct a full review of all popover components (`Spelling`, `Clarity`, `Conciseness`, `Readability`, `Passive`) for consistent styling, positioning, and behavior.<br>- Add subtle `framer-motion` animations for popover transitions to enhance feel.<br>- Verify toggle counts are accurate for all new suggestion types. | `src/components/editor/*SuggestionPopover.tsx`                                                                                                                                                                   | ☐         |
| **Low**    | **4. Code Cleanup & Finalization**                                  | - Review all new hooks and components for adherence to project standards (conciseness, modularity).<br>- Remove any dead code, leftover comments, or `console.log` statements from the refactoring process.<br>- Run `npm run build` and `npm run lint` and fix all issues. | Entire `src/` directory                                                                                                                                                                                          | ☐         |

---

### Implementation Plan: Passive Voice Detection (New)

| Priority | Task Description                                        | Implementation Details                                                                                                                                                                                                                       | Code Pointers                                                                                                                                                                                                                                                                                                                        | Status |
| :------- | :------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- |
| **High** | **Backend: Create `passiveVoiceRewrite` function**      | - Create a new Firebase Function handler `passive.ts`.<br>- Implement logic to call the `gpt-4o` model to rewrite a passive sentence into active voice.<br>- The function should accept a `text` payload and return the rewritten sentence.            | `functions/src/handlers/passive.ts` (new)                                                                                                                                                                                                                                                                                                | ☐      |
| **High** | **Backend: Expose New Endpoint**                        | - In `functions/src/index.ts`, create a new callable function named `passiveVoiceRewrite` that points to the new handler.                                                                                                                   | `functions/src/index.ts`                                                                                                                                                                                                                                                                                                                 | ☐      |
| **High** | **Frontend: Install `retext-passive`**                  | - Run `npm install retext-passive`.                                                                                                                                                                                                            | `package.json`                                                                                                                                                                                                                                                                                                                           | ☐      |
| **High** | **Frontend: Define `passive` Suggestion Type**          | - Add `'passive'` to the `SuggestionType` in `suggestion.types.ts`.<br>- Add a new `PassiveSuggestion` interface extending `BaseSuggestion`.<br>- Update the `Suggestion` union type.                                                             | `src/store/suggestion/suggestion.types.ts`                                                                                                                                                                                                                                                                                               | ☐      |
| **High** | **Frontend: Update `suggestionStore`**                  | - Add `passive: []` to the initial store state.<br>- Add `passive: boolean` to the `visibility` state.                                                                                                                                           | `src/store/suggestion/suggestion.store.ts`                                                                                                                                                                                                                                                                                               | ☐      |
| **High** | **Frontend: Create `passiveVoiceAnalyzer.ts`**          | - Create a new utility that uses `retext-passive` to find passive voice sentences in the text.<br>- It should return an array of `PassiveSuggestion` objects.                                                                                     | `src/utils/passiveVoiceAnalyzer.ts` (new)                                                                                                                                                                                                                                                                                                | ☐      |
| **High** | **Frontend: Integrate Analyzer into `useSuggestions`**  | - Import and call `analyzePassiveVoice` within the `handleAnalysis` function.<br>- On detection, trigger a call to the new rewrite hook for each suggestion.                                                                                      | `src/hooks/useSuggestions.ts`                                                                                                                                                                                                                                                                                                            | ☐      |
| **High** | **Frontend: Create `usePassiveVoiceRewrite.ts` hook**   | - Create a new hook that calls the `passiveVoiceRewrite` Firebase Function.<br>- It should manage its own `isLoading` and `error` states.<br>- On success, it should call `updatePassiveSuggestion` to update the store with the AI rewrite.      | `src/hooks/usePassiveVoiceRewrite.ts` (new)                                                                                                                                                                                                                                                                                              | ☐      |
| **High** | **Frontend: Create `PassiveSuggestionPopover.tsx`**     | - Create a new popover component to display the passive voice suggestion.<br>- It should show a loading state while the rewrite is being fetched.<br>- It will display the original sentence, the reason, and the AI-generated active voice version. | `src/components/editor/PassiveSuggestionPopover.tsx` (new)                                                                                                                                                                                                                                                                               | ☐      |
| **High** | **Frontend: Update `SuggestionPopover` Dispatcher**     | - Add a case for the `'passive'` suggestion type to render the new `PassiveSuggestionPopover`.                                                                                                                                                 | `src/components/editor/SuggestionPopover.tsx`                                                                                                                                                                                                                                                                                            | ☐      |
| **High** | **Frontend: Add "Passive" Toggle to UI**                | - In `SuggestionToggles.tsx`, add a new toggle button for the "Passive" category.<br>- It should display the live count and control the visibility of passive voice underlines.                                                                   | `src/components/editor/SuggestionToggles.tsx`                                                                                                                                                                                                                                                                                            | ☐      |

---