# Hyper-Granular Refactoring Roadmap

This document provides an exhaustive, task-by-task breakdown for refactoring the WordWise application. Each item represents a specific, actionable change required to align the codebase with the project's strict coding standards. The list is organized by architectural layer, starting with the most critical backend and state management changes.

## Phase 1: Backend & Security Overhaul

*Tasks to secure the backend, establish robust data handling patterns, and modularize the serverless functions.*

| ID | Parent Task | File / Path | Task Description | Done |
| --- | --- | --- | --- | --- |
| **FN-01** | **Implement Backend Security** | `functions/src/utils/auth.ts` | **Create `withAuth` HOF:** Develop a higher-order function that verifies the Firebase Auth token from request headers (`context.auth`). | [ ] |
| **FN-02** | **Implement Backend Security** | `functions/src/utils/handlers.ts` | **Create `createApiHandler` HOF:** Develop a wrapper for all functions to centralize CORS, `try/catch` error handling, and logging. | [ ] |
| **FN-03** | **Implement Backend Security** | `functions/src/utils/validation.ts` | **Create `withValidation` HOF:** Develop a higher-order function that takes a `zod` schema and validates the request body. | [ ] |
| **FN-04** | **Decompose Functions** | `functions/src/index.ts` | **Refactor `spellCheck`:** Decompose the monolithic `spellCheck` function. Remove the `mode` parameter and rely on separate endpoints. | [ ] |
| **FN-05** | **Decompose Functions** | `functions/src/index.ts` -> `functions/src/handlers/spell.ts` | **Create `spellCheckHandler`:** Move the core spell-check logic into its own file, wrapped by the new HOFs. | [ ] |
| **FN-06** | **Decompose Functions** | `functions/src/index.ts` -> `functions/src/handlers/tone.ts` | **Create `toneDetectHandler`:** Move the tone detection logic into its own file, wrapped by the new HOFs. | [ ] |
| **FN-07** | **Decompose Functions** | `functions/src/index.ts` -> `functions/src/handlers/rewrite.ts` | **Create `toneRewriteHandler`:** Move the tone rewrite logic into its own file, wrapped by the new HOFs. | [ ] |
| **FN-08** | **Re-architect Spell-Checking** | `functions/src/utils/spellcheck.ts` | **Simplify AI Prompt:** Remove all offset calculation logic from the prompt. The new prompt should only ask for suggestions for a list of words. | [ ] |
| **FN-09** | **Re-architect Spell-Checking** | `functions/src/utils/spellcheck.ts` | **Refactor `performSpellCheck`:** Rewrite the function to take a `string[]` of words and return a `Map<string, string[]>`. | [ ] |
| **FN-10** | **Re-architect Spell-Checking** | `functions/src/utils/spellcheck.ts` | **Delete `convertToSuggestions`:** This complex, brittle function for fixing offsets is no longer needed and must be deleted. | [ ] |
| **FN-11** | **Re-architect Spell-Checking** | `functions/src/utils/spellcheck.ts` | **Delete `findWordInText`:** This utility for fixing offsets is no longer needed and must be deleted. | [ ] |
| **FN-12** | **Modularize Functions** | `functions/src/utils/openai.ts` | **Refactor OpenAI Client:** Ensure the client is initialized once and reused across function invocations (singleton pattern). | [ ] |

## Phase 2: State Management Refactoring

*Tasks to break down oversized Zustand stores, enforce purity, and improve UX with optimistic updates.*

| ID | Parent Task | File / Path | Task Description | Done |
| --- | --- | --- | --- | --- |
| **ST-01** | **Modularize `authStore`** | `src/store/authStore.ts` | **Extract `signInWithGoogle`:** Move the `signInWithGoogle` logic into `src/store/auth/auth.actions.ts`. | [ ] |
| **ST-02** | **Modularize `authStore`** | `src/store/authStore.ts` | **Extract `signUpWithEmail`:** Move the `signUpWithEmail` logic into `src/store/auth/auth.actions.ts`. | [ ] |
| **ST-03** | **Modularize `authStore`** | `src/store/authStore.ts` | **Extract `signInWithEmail`:** Move the `signInWithEmail` logic into `src/store/auth/auth.actions.ts`. | [ ] |
| **ST-04** | **Modularize `authStore`** | `src/store/authStore.ts` | **Extract `signOut`:** Move the `signOut` logic into `src/store/auth/auth.actions.ts`. | [ ] |
| **ST-05** | **Modularize `authStore`** | `src/store/authStore.ts` | **Extract `onAuthStateChanged`:** Move the listener logic into its own file `src/store/auth/auth.listener.ts`. | [ ] |
| **ST-06** | **Modularize `authStore`** | `src/store/authStore.ts` | **Refactor Store Definition:** The main `auth.store.ts` file should only contain the `create` call with the state and actions, now under the 200-line limit. | [ ] |
| **ST-07** | **Modularize `documentStore`** | `src/store/documentStore.ts` | **Extract `fetchDocuments`:** Move the `fetchDocuments` logic into `src/store/document/document.actions.ts`. | [ ] |
| **ST-08** | **Modularize `documentStore`** | `src/store/documentStore.ts` | **Extract `fetchDocument`:** Move the `fetchDocument` logic into `src/store/document/document.actions.ts`. | [ ] |
| **ST-09** | **Modularize `documentStore`** | `src/store/documentStore.ts` | **Extract `createDocument`:** Move the `createDocument` logic into `src/store/document/document.actions.ts`. | [ ] |
| **ST-10** | **Modularize `documentStore`** | `src/store/documentStore.ts` | **Extract `updateDocument`:** Move the `updateDocument` logic into `src/store/document/document.actions.ts`. | [ ] |
| **ST-11** | **Modularize `documentStore`** | `src/store/documentStore.ts` | **Extract `deleteDocument`:** Move the `deleteDocument` logic into `src/store/document/document.actions.ts`. | [ ] |
| **ST-12** | **Refactor `documentStore`**| `src/store/document/document.actions.ts` | **Implement Optimistic `updateDocument`:** The action should immediately update the local state and handle server errors gracefully. | [ ] |
| **ST-13** | **Refactor `documentStore`**| `src/store/document/document.actions.ts` | **Implement Optimistic `deleteDocument`:** The action should immediately remove the document from the local state. | [ ] |
| **ST-14** | **Refactor `documentStore`**| `src/store/document/document.actions.ts` | **Remove Redundant Fetch:** In `createDocument`, do not re-fetch the document. Construct the new document object locally after creation. | [ ] |
| **ST-15** | **Modularize `documentStore`** | `src/store/documentStore.ts` | **Refactor Store Definition:** The main `document.store.ts` file should be under the 200-line limit. | [ ] |
| **ST-16** | **Modularize `userStore`** | `src/store/userStore.ts` | **Extract `fetchUser`:** Move async logic to `src/store/user/user.actions.ts`. | [ ] |
| **ST-17** | **Modularize `userStore`** | `src/store/userStore.ts` | **Extract `updateUser`:** Move async logic to `src/store/user/user.actions.ts`. | [ ] |
| **ST-18** | **Modularize `userStore`** | `src/store/userStore.ts` | **Refactor Store Definition:** The main `user.store.ts` file should be under the 200-line limit. | [ ] |

## Phase 3: Frontend Utilities & Hooks Refactoring

*Tasks to eliminate class-based utilities, create reusable hooks, and align with functional patterns.*

| ID | Parent Task | File / Path | Task Description | Done |
| --- | --- | --- | --- | --- |
| **HU-01** | **Re-architect Spell-Checking** | `src/utils/spellChecker.ts` | **Delete `SpellCheckerService`:** Delete this entire file. Its functionality will be replaced by a functional approach in `useSpellCheck`. | [ ] |
| **HU-02** | **Re-architect Spell-Checking** | `src/hooks/useSpellCheck.ts` | **Refactor `useSpellCheck`:** Rewrite the hook to use a local dictionary (`nspell`) to find misspelled words. | [ ] |
| **HU-03** | **Re-architect Spell-Checking** | `src/hooks/useSpellCheck.ts` | **Integrate Debouncing:** Use the new `useDebounce` hook to manage API calls for suggestions. | [ ] |
| **HU-04** | **Re-architect Spell-Checking** | `src/hooks/useSpellCheck.ts` | **Modularize `useSpellCheck`:** Break down the 237-line hook into smaller helper functions for finding words, calling the API, etc. | [ ] |
| **HU-05** | **Create Reusable Hooks** | `src/hooks/useDebounce.ts` | **Create `useDebounce` Hook:** Create a new file for a generic, reusable debounce hook to replace all `setTimeout` logic. | [ ] |
| **HU-06** | **Refactor Utilities** | `src/utils/textDiffer.ts` | **Review `textDiffer`:** Assess if this utility is still needed with the new spell-check architecture and simplify or remove it. | [ ] |
| **HU-07** | **Refactor Utilities** | `src/utils/toneAnalyzer.ts` | **Refactor `ToneAnalyzer` Class:** Convert the class-based utility into a set of pure functions for tone analysis. | [ ] |
| **HU-08** | **Refactor Utilities** | `src/utils/logger.ts` | **Refactor Logger:** Review the logger implementation for unnecessary complexity. A simple wrapper around `console.log` may suffice. | [ ] |
| **HU-09** | **General Conventions** | `src/types/index.ts` | **Use Interfaces:** Convert all `type` definitions for objects into `interface` declarations. | [ ] |

## Phase 4: Component Decomposition

*Tasks to break down large, monolithic components into smaller, single-responsibility components, adhering to the 200-line limit.*

| ID | Parent Task | File / Path | Task Description | Done |
| --- | --- | --- | --- | --- |
| **C-01** | **Decompose `DocumentList`**| `src/components/DocumentList.tsx` | **Extract `DocumentListItem`:** Create a new component for rendering a single row in the document list. | [ ] |
| **C-02** | **Decompose `DocumentList`**| `src/components/DocumentList.tsx` | **Extract `DocumentListHeader`:** Create a new component for the header/search bar of the list. | [ ] |
| **C-03** | **Decompose `DocumentList`**| `src/components/DocumentList.tsx` | **Extract `NewDocumentModal`:** The modal for creating a new document should be its own component. | [ ] |
| **C-04** | **Decompose `DocumentList`**| `src/components/DocumentList.tsx` | **Refactor Main Component:** The root `DocumentList.tsx` should now be a simple composition of the new sub-components. | [ ] |
| **C-05** | **Decompose `SignUp`** | `src/components/SignUp.tsx` | **Extract Form Fields:** Reusable input field components should be extracted from the sign-up form. | [ ] |
| **C-6** | **Decompose `SignUp`** | `src/components/SignUp.tsx` | **Extract Social Auth Buttons:** The "Sign up with Google" button should be a reusable component. | [ ] |
| **C-07** | **Decompose `SignUp`** | `src/components/SignUp.tsx` | **Refactor Main Component:** The root `SignUp.tsx` file should be a lean composition of its new sub-components. | [ ] |
| **C-08** | **Decompose `Login`** | `src/components/Login.tsx` | **Decompose Login Form:** Similar to `SignUp`, extract form fields and social auth buttons into reusable components. | [ ] |
| **C-09** | **Decompose `Dashboard`** | `src/components/Dashboard.tsx` | **Extract `DashboardHeader`:** The header section of the dashboard should be its own component. | [ ] |
| **C-10** | **Decompose `Dashboard`** | `src/components/Dashboard.tsx` | **Refactor Main Component:** The root `Dashboard.tsx` should be a lean composition of its parts. | [ ] |
| **C-11** | **Decompose `DocumentEditor`**| `src/components/DocumentEditor.tsx` | **Remove Debounce Logic:** Replace the inline `setTimeout` for title changes with the new `useDebounce` hook. | [ ] |
| **C-12** | **Decompose `DocumentEditor`**| `src/components/DocumentEditor.tsx` | **Extract `EditorHeader`:** Move the editor header logic into the existing `editor/EditorHeader.tsx` component. | [ ] |
| **C-13** | **Decompose `DocumentEditor`**| `src/components/DocumentEditor.tsx` | **Simplify Loading/Error State:** Abstract the repetitive loading and error UI into a reusable `StatusIndicator` component. | [ ] |
| **C-14** | **Decompose `TextEditor`** | `src/components/TextEditor.tsx` | **Refactor `useEditor`:** The Tiptap `useEditor` hook configuration is large. Move the extension list into `src/extensions/index.ts`. | [ ] |
| **C-15** | **Decompose `SuggestionSidebar`**|`src/components/SuggestionSidebar.tsx`| **Extract `SuggestionCard`:** Each individual suggestion in the sidebar should be its own component. | [ ] |

