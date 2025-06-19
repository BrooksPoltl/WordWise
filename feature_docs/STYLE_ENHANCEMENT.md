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

---

### Backend

| Priority | Task Description | Implementation Details | Code Pointers | Dependencies | Completion |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High** | Extend Firebase Function for Style Correction | - Add a new route (`/style`) to the existing Express app in the main cloud function.<br>- This route will be handled by a new `style.ts` handler.<br>- Use the `gpt-4o` model via the OpenAI API to rewrite passive voice sentences into active voice.<br>- Ensure the route is protected by the existing authentication middleware. | `functions/src/index.ts`<br>`functions/src/handlers/style.ts` (new) | - OpenAI API Key | ☐ |

---

### Frontend

| Priority | Task Description | Implementation Details | Code Pointers | Dependencies | Completion |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High** | **Setup: Install Dependencies** | Install the necessary `retext` packages: `retext`, `retext-english`, `retext-simplify`, `retext-equality`, `retext-readability`, `retext-passive`. | `package.json` | - | ☐ |
| **High** | **Core: Create Unified `useSuggestions` Hook** | - Create a new hook to be the single source for all text suggestions.<br>- It will run `retext` for style/clarity/etc., and incorporate the existing spell-check logic.<br>- It must return a unified array of suggestion objects for both spelling and style.<br>- For `retext-passive` detections, it will trigger a lazy-loaded call to the `/style` backend endpoint. | `src/hooks/useSuggestions.ts` (new)<br>`src/hooks/useSpellCheck.ts` (deprecate) | - `retext` packages | ☐ |
| **High** | **UI: Create `SuggestionPopover` Component** | - Build a new reusable pop-over component triggered by hover/click.<br>- Displays a color-coded reason and a one-click "Accept" button.<br>- Will show a loading state while waiting for LLM-based suggestions. | `src/components/editor/SuggestionPopover.tsx` (new) | - Radix UI for Popover<br>- Tailwind CSS | ☐ |
| **High** | **Refactor: Deprecate `SuggestionSidebar`** | - Remove the `SuggestionSidebar` component from the `DocumentEditor`.<br>- Delete the component file and any associated state or styles. | `src/components/SuggestionSidebar.tsx` (delete)<br>`src/components/DocumentEditor.tsx` | - | ☐ |
| **High** | **Refactor: Remove Spell Score** | - Remove the "Spell Score" UI element as its functionality is replaced by the new toggles. | `src/components/editor/EditorHeader.tsx` (likely location) | - | ☐ |
| **Medium** | **UI: Create `SuggestionToggles` Component** | - Create the new component for filtering suggestions (`Spelling`, `Clarity`, etc.).<br>- Each toggle has a color-coded dot, category name, and suggestion count.<br>- Clicking a toggle updates a Zustand store to filter suggestions in the editor. | `src/components/editor/SuggestionToggles.tsx` (new) | - Zustand store | ☐ |
| **Medium** | **State: Create `suggestionStore`** | - Create a new Zustand store to manage suggestion state.<br>- Will hold the raw list of suggestions from the `useSuggestions` hook.<br>- Will also hold the filter states for each category (e.g., `isClarityVisible: true`). | `src/store/suggestion/suggestion.store.ts` (new) | - | ☐ |
| **Medium** | **Integration: Update `DocumentEditor`** | - Integrate the new `useSuggestions` hook.<br>- Pass the raw suggestions to the new `suggestionStore`.<br>- Render the new `SuggestionToggles` component in the toolbar area. | `src/components/DocumentEditor.tsx` | - `useSuggestions`<br>- `SuggestionToggles` | ☐ |
| **Medium** | **Integration: Update `TextEditor` & Decorations** | - Read filtered suggestions from the `suggestionStore`.<br>- Use a custom Tiptap `Decoration` to apply underlines with the correct color based on the suggestion's category.<br>- Wire the `SuggestionPopover` to appear on interaction with these decorations. | `src/components/TextEditor.tsx`<br>`src/extensions/SuggestionDecorations.ts` (new) | - `SuggestionPopover`<br>- `suggestionStore` | ☐ |

</rewritten_file> 