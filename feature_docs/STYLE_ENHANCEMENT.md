### Feature: Style Enhancement & UX Overhaul

### 1. Feature Summary & Context

This document outlines the plan for implementing a new **Style Enhancement** feature in WordWise and a concurrent **UX Overhaul** for how all suggestions (including existing spell-checking) are presented to the user.

The primary goal is to provide users with real-time, actionable suggestions to improve the **clarity**, **conciseness**, and **readability** of their writing, while simultaneously modernizing the application's core user interaction model for suggestions.

### 2. Core Technology: The `retext` Ecosystem

After initial exploration of lower-level NLP libraries like `natural`, we have chosen to build this feature on the **`retext`** ecosystem. This decision is strategic:

*   **Modularity & Precision:** `retext`'s plugin-based architecture allows us to precisely target specific writing issues with dedicated, community-vetted packages. Its AST-based approach provides exact positional data for highlighting and replacing text.
*   **Industry Trust & Stability:** As a core part of the `unified` collective, `retext` is a well-maintained, stable, and trusted tool used in major projects by companies like Mozilla, Gatsby, and Shopify. This mitigates the risk of building on an unsupported or volatile dependency.

### 3. New User Experience Vision

We are moving away from the `SuggestionSidebar` to an inline, contextual model. This solves significant mobile UX challenges and enables a more fluid and intuitive workflow.

*   **Inline Underlines and Pop-ups:** All suggestions will now appear as colored underlines directly within the text editor.
    *   **Spelling:** Red underline.
    *   **Clarity:** Blue underline.
    *   **Conciseness:** Green underline.
    *   **Readability:** Purple underline.
    *   Interacting with an underline (hover on desktop, click on mobile/desktop) will trigger a **`SuggestionPopover`**. This pop-up will contain a brief explanation of the issue and a one-click button to accept the suggested fix.

*   **Lazy-Loading LLM Suggestions:** To provide powerful suggestions without perceived latency, we will use a hybrid approach for passive voice.
    *   **Instant Detection:** `retext-passive` will instantly detect a passive sentence and apply the blue "Clarity" underline.
    *   **Background Fetch:** The moment the underline appears, a non-blocking request will be sent to our backend.
    *   **AI-Powered Rewrite:** The backend will use the `gpt-4o` model to rewrite the sentence in the active voice.
    *   **Seamless UI Update:** The result will be sent back to the client. When the user clicks the underline, the `SuggestionPopover` will ideally already be populated with the high-quality AI suggestion. If the call is still in progress, a loading state will be shown.

*   **Suggestion Category Toggles:** To give users control over the density of feedback, a new UI element will be added to the editor toolbar.
    *   This component will contain a list of clickable toggles for each suggestion category (e.g., `🔴 Spelling`, `🔵 Clarity`).
    *   Each toggle will display the category name and a live count of active suggestions in that category.
    *   Clicking a toggle will show or hide the corresponding underlines in the editor, allowing users to focus on one type of improvement at a time.

### 4. Detailed Feature Breakdown

The Style Enhancement feature will be composed of the following checks, managed by the unified `useSuggestions` hook:

*   **Clarity Enhancement (Blue - `#3B82F6`)**
    *   **Passive Voice Detection:** Using `retext-passive`, we will identify sentences written in the passive voice. This serves as the trigger for the lazy-loaded LLM rewrite. The pop-up will explain *why* active voice is often better and offer the AI-generated alternative.
    *   **Weasel Word Detection:** Using `retext-equality`, we will flag weak, hedging, or overly assertive words that undermine the writer's message (e.g., "obviously," "basically," "in my opinion," "perhaps"). The suggestion will typically be to remove the word for a stronger statement.

*   **Conciseness Enhancement (Green - `#10B981`)**
    *   **Wordy Phrase Simplification:** Using `retext-simplify`, we will find and offer simpler, more direct alternatives for common verbose phrases (e.g., suggest "use" for "utilize", "about" for "in regards to", "to" for "in order to"). These will be one-click replacements.

*   **Readability Enhancement (Purple - `#8B5CF6`)**
    *   **Complex Sentence Flagging:** Using `retext-readability`, we will calculate readability scores (e.g., Flesch-Kincaid) on the fly. We will not expose the raw score to the user. Instead, sentences that fall below a certain readability threshold (indicating they are too long or complex) will be underlined. The suggestion will be instructional: "This sentence may be hard to read. Try splitting it into shorter sentences."
    *   **Repeated Words:** Using `retext-repeated-words`, we will catch simple but common errors like "the the" or "and and".

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
| **High** | **1.1: Remove `SuggestionSidebar` from UI**          | Delete component import and usage from `DocumentEditor`.                                                                                                                                                                                          | `src/components/DocumentEditor.tsx`                                                                                                                                        | -                                                | ☐          |
| **High** | **1.2: Delete `SuggestionSidebar.tsx` file**         | Remove the file and any associated CSS or utility files specific to it.                                                                                                                                                                           | `src/components/SuggestionSidebar.tsx`                                                                                                                                     | -                                                | ☐          |
| **High** | **1.3: Remove "Spell Score" UI element**             | Identify and remove the JSX and logic for displaying the spell score.                                                                                                                                                                             | `src/components/editor/EditorHeader.tsx` (likely)                                                                                                                          | -                                                | ☐          |
| **High** | **1.4: Create `SuggestionPopover.tsx` component**    | Build the reusable popover UI to display suggestion details and actions (initially for spelling).                                                                                                                                                 | `src/components/editor/SuggestionPopover.tsx` (new)                                                                                                                        | Radix UI for Popover, Tailwind CSS             | ☐          |
| **High** | **1.5: Create `SuggestionDecorations.ts` extension** | Develop the Tiptap extension to apply underlines to text based on suggestion data.                                                                                                                                                                | `src/extensions/SuggestionDecorations.ts` (new)                                                                                                                            | Tiptap                                           | ☐          |
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
| **High** | Extend Firebase Function for Style Correction | - Add a new route (`/style`) to the existing Express app in the main cloud function.<br>- This route will be handled by a new `style.ts` handler.<br>- Use the `gpt-4o` model via the OpenAI API to rewrite passive voice sentences into active voice.<br>- Ensure the route is protected by the existing authentication middleware. | `functions/src/index.ts`<br>`functions/src/handlers/style.ts` (new) | - OpenAI API Key  | ☐          |

---

### Future Frontend Increments (Post-Refactor)

| Priority | Task Description                               | Implementation Details                                                                                                                                                                                                                                                        | Code Pointers                                                                      | Dependencies          | Completion |
| :------- | :--------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- | :-------------------- | :--------- |
| **High**   | **Setup: Install Style Dependencies**          | Install the necessary `retext` packages: `retext`, `retext-english`, `retext-simplify`, `retext-equality`, `retext-readability`, `retext-passive`.                                                                                                                              | `package.json`                                                                     | -                     | ☐          |
| **High**   | **Core: Create Unified `useSuggestions` Hook** | - Create a new hook to be the single source for all text suggestions, running after the initial refactor is complete.<br>- It will run `retext` for style/clarity/etc., and incorporate the existing spell-check logic from the `suggestionStore`.<br>- For `retext-passive` detections, it will trigger a lazy-loaded call to the `/style` backend endpoint. | `src/hooks/useSuggestions.ts` (new)<br>`src/hooks/useSpellCheck.ts` (to be deprecated) | - `retext` packages | ☐          |
| **Medium** | **UI: Create `SuggestionToggles` Component**   | - Create the new component for filtering suggestions (`Spelling`, `Clarity`, etc.).<br>- Each toggle has a color-coded dot, category name, and suggestion count.<br>- Clicking a toggle updates the `suggestionStore` to filter suggestions in the editor.                      | `src/components/editor/SuggestionToggles.tsx` (new)                                | - `suggestionStore`   | ✅          |

---

