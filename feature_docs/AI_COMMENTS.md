# Feature: Document-Aware AI Comments

## 1. Overview & Vision

The AI Comments feature will transform WordWise from a static editor into a dynamic, intelligent writing partner. The vision is to provide users with expert-level feedback that is tailored to their document's specific context and goals, helping them communicate their ideas with greater clarity and impact.

## 2. Feature Evolution & Key Decisions

This feature's scope was defined through several key decisions based on user experience goals and technical constraints.

-   **Initial Concept vs. Final Design**: The feature began as a proposal for simple AI-powered popovers. It evolved into a more sophisticated, Quip-like commenting system where feedback is contextual and anchored directly to lines of text, providing a more intuitive user experience.
-   **Manual vs. Automatic Trigger**: To manage API costs and give users explicit control, the analysis will be triggered by a manual "Submit for Review" button, rather than running automatically in the background.
-   **De-Scoped Functionality**: A "chat with the AI" concept was considered but was explicitly **de-scoped** from this feature to ensure focus and meet a tight development deadline. This may be revisited in the future.

## 3. Core User Story

> As a user writing a **Technical Design Document**, I want to **request an AI review** of my draft, so that I can get **contextual, actionable feedback** on both my specific wording and the document's overall structure, helping me ensure it meets professional standards before sharing it with my team.

## 4. Functional Requirements

### Triggering & Analysis

-   **Trigger**: A "Submit for Review" button will be located in the editor's header. Clicking it initiates the entire analysis process.
-   **Document-Aware Analysis**: The backend will analyze the document's content based on its designated `documentType`.
-   **Dual-Level Feedback**: The AI will provide two categories of feedback:
    1.  **Inline Comments**: For specific text that can be improved (e.g., clarity, conciseness, tone). These are linked to `startIndex` and `endIndex` character offsets.
    2.  **Structural Comments**: For high-level document composition issues (e.g., a missing required section). These are not linked to a specific text range.

### UI & User Interaction

-   **Inline Highlighting**: Text corresponding to an inline comment will be highlighted in the editor using a custom Tiptap Decoration.
-   **Comment Popover**: When a user clicks a highlight, a popover UI will appear, absolutely positioned and aligned to the highlighted text line.
-   **Structural Comment Sidebar**: A dedicated side panel will display all document-level structural comments.
-   **Conditional Actions**: The actions available within a comment popover will depend on the type of feedback:
    -   For `REPLACEMENT` comments (e.g., "rephrase this sentence"):
        -   **Accept**: Applies the suggested text change and deletes the comment.
        -   **Dismiss**: Deletes the comment without changing the text.
    -   For `ADVICE` comments (e.g., "add more data to this point"):
        -   **Like (Acknowledge)**: Deletes the comment, serving as a "mark as read."
        -   **Dislike (Reject)**: Deletes the comment.

### Document-Specific Analysis Criteria

The AI's structural analysis will be tailored based on the `documentType`.

| Document Type | Required Sections for AI to Verify                                                                                                                                              |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`POST_MORTEM`**   | **What Happened** (Timeline), **Impact Analysis**, **Root Cause Analysis** (e.g., 5 Whys), **Action Items**                                                                        |
| **`PRD`**           | **Problem Statement**, **Goals/Objectives**, **User Personas**, **Functional Requirements**, **Success Metrics**                                                                  |
| **`TDD`**           | **System Architecture** (with diagram), **Data Model**, **API Design**, **Security Considerations**, **Alternatives Considered**                                                    |

## 5. Technical Architecture

-   **Frontend-Backend Communication**: The frontend triggers analysis by calling a single HTTPS Callable Firebase Function: `getDocumentComments`.
-   **Backend Orchestration**: This function uses `Promise.all` to execute multiple, parallel calls to the OpenAI API (`gpt-4-turbo-preview`) for different analysis types (e.g., one for inline suggestions, one for each required section).
-   **Data Flow & Persistence**:
    -   **Storage**: All generated comments are stored in a Firestore sub-collection: `documents/{docId}/ai_comments`.
    -   **Decoupled Architecture**: The backend function's sole responsibility is to write results to Firestore. It **does not** return comment data in its response.
    -   **Real-Time Updates**: The frontend uses a real-time `onSnapshot` listener to subscribe to the `ai_comments` collection, ensuring the UI is always in sync.
    -   **Data Integrity**: Each new analysis performs a "wipe-and-replace," deleting all old AI comments for the document before saving the new ones. This prevents stale feedback.
-   **Frontend Implementation**:
    -   **State Management**: A dedicated Zustand store (`commentStore`) will manage the comments array, loading state (`isLoading`), and any potential errors.
    -   **Editor Integration**: A custom Tiptap extension (`AiCommentHighlight`) will apply `Decoration`s to the editor content based on the comments in the store.

---

## 6. Key Learnings from Initial Implementation

A previous development cycle provided critical insights that must be incorporated.

#### Backend Learnings

1.  **Authentication**: The Firestore security check in `getDocumentComments` must validate against the document's `ownerId`, not `userId`, to prevent `PERMISSION_DENIED` errors.
2.  **OpenAI Integration**: The `gpt-4-turbo-preview` model reliably returns JSON. Prompts should be concise, and complex response-cleanup logic is unnecessary. A direct `JSON.parse()` is sufficient.
3.  **API Design**: The callable function should only return a success/error status, not the comments. This decouples the trigger from data delivery.

#### Frontend Learnings

1.  **Data Flow**: The UI must rely exclusively on the Firestore `onSnapshot` listener for comment data.
2.  **State Management**: The `requestComments` action must set `isLoading` to `false` in all cases (on success *and* on error) to prevent a stuck UI.
3.  **Dependencies**: Avoid circular dependencies when creating the `commentStore`.

---

## 7. Implementation Plan

### Backend (Firebase Functions)

| Priority | Task Description                                     | Implementation Details                                                                                                                                                                                                                                                                                                                                     | Code Pointers                                                              | Dependencies | Completion |
| :------- | :--------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- | :----------- | :--------- |
| **P1**   | Create `getDocumentComments` Cloud Function          | Create an HTTPS Callable Function accepting `{ documentId, documentContent, documentType }`. **CRITICAL**: Auth check must be against the document's `ownerId`. The response should only be `{ success: true }` or an error.                                                                                                                                 | `functions/src/index.ts` <br/> `functions/src/handlers/comments.ts` (new)  | -            | ☐          |
| **P1**   | Implement OpenAI Orchestration Service               | Use `Promise.all` and `gpt-4-turbo-preview`. Prompts for inline issues must ask for `startIndex` and `endIndex`. Prompts can be concise; complex formatting instructions and response cleanup logic are not needed.                                                                                                                                            | `functions/src/utils/openai.ts`                                            | -            | ☐          |
| **P1**   | Define Data Model & Firestore Logic                  | Create the `documents/{docId}/ai_comments` sub-collection. Implement the "wipe-and-replace" logic. Define the shared `AIComment` type.                                                                                                                                                                                                                        | `functions/src/handlers/comments.ts` <br/> `src/types/index.ts`             | -            | ☐          |
| **P2**   | Implement Document-Type-Specific Analysis            | In the orchestrator, use a switch statement on `documentType` to generate the specific structural analysis prompts.                                                                                                                                                                                                                                            | `functions/src/utils/openai.ts`                                            | -            | ☐          |

### Frontend (React Client) - Implementation Tasks

| Priority | Task Description                                     | Implementation Details                                                                                                                                                                                                                         | Code Pointers                                                              | Dependencies | Completion |
| :------- | :--------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- | :----------- | :--------- |
| **P1**   | Create `commentStore` & Actions                      | Create the store structure. Implement `listenToComments`, `requestComments`, `deleteComment`, and a new `acceptSuggestion(commentId, editor)` action.                                                                                           | `src/store/comment/`                                                       | -            | ☐          |
| **P1**   | Create `useCommentListener` Hook                     | Encapsulate the `listenToComments` call and its cleanup logic within a reusable hook.                                                                                                                                                          | `src/hooks/useCommentListener.ts` (new)                                    | P1-Store     | ☐          |
| **P1**   | Create `AiCommentHighlight` Extension                | Create the Tiptap extension. It must read from the `commentStore` and create `Decoration.inline` with the `.ai-comment-highlight` class and `data-comment-id`.                                                                                   | `src/extensions/AiCommentHighlight.ts`                                     | -            | ☐          |
| **P1**   | Update `EditorContainer` to be the Orchestrator      | Add `activeComment` and `popoverPosition` state. Implement the global click handler to manage this state. Conditionally render the popover. Use the `useCommentListener` hook.                                                               | `src/components/EditorContainer.tsx`                                       | P1-Hook      | ☐          |
| **P2**   | Create `AiCommentPopover` Component                  | Build the stateless popover component. It takes `comment` and `position` as props and calls store actions on button clicks.                                                                                                                      | `src/components/editor/AiCommentPopover.tsx`                               | -            | ☐          |
| **P2**   | Create `AiCommentSidebar` Component                  | Build the sidebar. It will subscribe to the `commentStore`, filter for structural comments, and render them in a list.                                                                                                                          | `src/components/editor/AiCommentSidebar.tsx`                               | -            | ☐          |
| **P3**   | Style Highlights and UI                              | Add CSS for `.ai-comment-highlight`, the popover, and the sidebar to match the app's visual theme.                                                                                                                                             | `src/index.css`                                                            | -            | ☐          |

---
## 8. Detailed UI/UX Implementation Plan

The frontend implementation is centered around creating an intuitive and seamless experience for viewing and actioning AI-driven feedback. This requires orchestrating state from `commentStore` with several React components and a custom Tiptap extension.

### 1. Component & Hook Responsibilities

-   **`useCommentListener` (New Hook)**:
    -   **Responsibility**: To manage the lifecycle of the Firestore comment listener.
    -   **Implementation**: This hook will take a `documentId` as an argument. It will call the `listenToComments` action from the `commentStore` when the component mounts (or when `documentId` changes). Crucially, it will return the `unsubscribe` function from the action and call it in its own `useEffect` cleanup phase. This encapsulates the subscription logic and prevents memory leaks.
    -   **Usage**: It will be used inside the main `EditorContainer` or `DocumentEditor` component.

-   **`EditorContainer.tsx` (Orchestrator)**:
    -   **Responsibility**: To act as the central hub for the commenting UI.
    -   **Implementation**:
        1.  It will use the `useCommentListener` hook to keep the `commentStore` up-to-date.
        2.  It will manage a new piece of local state: `activeComment: AIComment | null`.
        3.  It will manage another piece of local state: `popoverPosition: { top: number, left: number } | null`.
        4.  It will contain the global `onClick` handler for the editor. This handler will inspect the click event target. If the target (or its parent) is a highlighted span (`.ai-comment-highlight`), it will:
            a. Extract the `data-comment-id` from the element.
            b. Find the corresponding comment in the `commentStore`.
            c. Set this comment as the `activeComment`.
            d. Calculate the `popoverPosition` using `getBoundingClientRect()` on the clicked span.
            e. If the user clicks anywhere else, it will set `activeComment` to `null`.

-   **`AiCommentHighlight.ts` (Tiptap Extension)**:
    -   **Responsibility**: To visually mark up the text in the editor.
    -   **Implementation**: This is a ProseMirror plugin. Its `decorations` property will be a function that:
        1.  Gets the current list of comments directly from the `commentStore.getState().comments`.
        2.  Filters for comments that have a `startIndex` and `endIndex`.
        3.  Maps over these comments to create a `Decoration.inline` for each one, applying a CSS class (`ai-comment-highlight`) and setting a `data-comment-id` attribute in the node's HTML attributes. This ID is essential for linking the visual highlight back to the data.

-   **`AiCommentPopover.tsx` (View Component)**:
    -   **Responsibility**: To display the details of a single active comment and provide action buttons.
    -   **Implementation**:
        1.  It will be a simple presentational component, rendered conditionally by `EditorContainer` only when `activeComment` is not `null`.
        2.  It receives `comment` and `position` as props.
        3.  It uses the `position` prop to set its `style` for absolute positioning.
        4.  It conditionally renders "Accept/Dismiss" or "Like/Dislike" buttons based on `comment.type`.
        5.  The `onClick` handlers for these buttons will call the appropriate actions from the `commentStore` (e.g., `deleteComment`, `acceptSuggestion`).

-   **`AiCommentSidebar.tsx` (View Component)**:
    -   **Responsibility**: To display high-level structural advice.
    -   **Implementation**:
        1.  It subscribes to the `commentStore`.
        2.  It filters the comments to find only those of type `ADVICE` that do *not* have a `startIndex`.
        3.  It maps over this filtered list to render each piece of structural feedback.

### 2. User Interaction Flow (Step-by-Step)

1.  **Load & Listen**: `EditorContainer` mounts. `useCommentListener` is called, which subscribes `commentStore` to the Firestore `ai_comments` collection.
2.  **Highlight**: `commentStore` is populated with comments. The `AiCommentHighlight` extension's decoration function re-runs, reads the store, and applies `.ai-comment-highlight` spans with `data-comment-id` attributes to the document.
3.  **Click**: User clicks on a highlighted piece of text.
4.  **Orchestrate**: The `EditorContainer`'s `onClick` handler fires. It identifies the `data-comment-id`, finds the full comment object in the store, calculates the popover's position, and updates its local `activeComment` and `popoverPosition` state.
5.  **Render**: `EditorContainer` re-renders. Because `activeComment` is now populated, the `AiCommentPopover` is rendered with the necessary props.
6.  **Action**: User clicks the "Accept" button in the popover.
7.  **Execute**: The popover's `onClick` handler calls the `acceptSuggestion(commentId, documentId)` action from the `commentStore`. This action performs the text replacement in the editor and deletes the comment from Firestore.
8.  **Sync**: The Firestore listener fires automatically, removing the comment from the `commentStore`.
9.  **Re-render**: The highlight vanishes because it's no longer in the store, and the popover disappears because `activeComment` is cleared. The entire UI is now consistent.