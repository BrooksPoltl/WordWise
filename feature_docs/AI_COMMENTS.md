# Feature: Document-Aware AI Comments

## 1. Feature Specification

### Core Concept
The AI Comments feature transforms the application from a simple editor into an intelligent writing assistant. The AI will function as an expert reviewer, providing feedback that is tailored to the specific type and context of the document being written.

### Triggering Mechanism
- **Manual Trigger**: The analysis is initiated explicitly by the user.
- **UI Control**: A "Submit for Review" button will be present in the editor's header. This ensures a deliberate user action, managing user expectations and controlling API costs.

### Analysis & Feedback
- **Document-Aware Analysis**: The backend will analyze the document's content based on its designated `documentType` (e.g., 'POST_MORTEM', 'PROJECT_REQUIREMENTS_DOC').
- **Dual-Level Feedback**: The AI will provide two categories of feedback:
    1.  **Inline Comments**: For specific text that can be improved (e.g., clarity, conciseness, tone).
    2.  **Structural Comments**: For high-level document composition issues (e.g., a missing "Impact Analysis" section in a Post-Mortem).

### Data Handling
- **Firestore Storage**: All generated comments will be stored in a dedicated sub-collection: `documents/{docId}/ai_comments`.
- **Wipe-and-Replace Logic**: Each time a user clicks "Submit for Review," the system will delete all existing AI comments for that document and replace them with the fresh results from the new analysis. This ensures comments are never stale.

### User Interface & Interaction
- **Inline Highlighting**: Text corresponding to an inline comment will be highlighted in the editor using a custom Tiptap Decoration.
- **Line-Anchored Comments**:
    - When a user clicks a highlight, a popover UI will appear.
    - This popover will be positioned absolutely, aligned to the vertical position of the highlighted text line (achieved by reading the DOM element's `getBoundingClientRect`).
- **Structural Comment Display**: Comments that relate to the overall document structure (and lack a specific text anchor) will be displayed in a dedicated "Document Analysis" side panel.
- **Conditional Actions**: The actions available within a comment popover will depend on the type of feedback:
    - For `REPLACEMENT` comments (e.g., "rephrase this sentence"):
        - **Accept**: Applies the suggested text change to the editor and deletes the comment from Firestore.
        - **Dismiss**: Deletes the comment from Firestore without changing the text.
    - For `ADVICE` comments (e.g., "add more data to this point"):
        - **Like (Acknowledge)**: Deletes the comment from Firestore, serving as a "mark as read."
        - **Dislike (Reject)**: Deletes the comment from Firestore.

### Supported Document Types & Analysis Criteria

The AI's structural analysis will be tailored based on the `documentType`. The following outlines the initial set of supported types and the key sections the AI will check for.

#### 1. Post-Mortem (`POST_MORTEM`)
- **What Happened**: A clear, chronological timeline of the incident.
- **Impact Analysis**: The full impact on users, systems, and business metrics.
- **Root Cause Analysis**: A deep dive into the fundamental cause (e.g., using the "5 Whys" method).
- **Action Items**: A list of concrete, actionable tasks to prevent recurrence.

#### 2. Product Requirements Document (`PRD`)
- **Problem Statement**: A clear definition of the user problem being solved.
- **Goals/Objectives**: Specific, measurable, and time-bound goals for the project.
- **User Personas**: A clear description of the target audience.
- **Functional Requirements**: A detailed list of what the system must do.
- **Success Metrics**: Quantifiable metrics to measure the feature's success.

#### 3. Technical Design Document (`TDD`)
- **System Architecture**: A high-level overview of the system's components and their interactions, often including a diagram.
- **Data Model**: The structure and schema of the data being stored.
- **API Design**: Definitions for any new or modified API endpoints.
- **Security Considerations**: An analysis of potential security vulnerabilities and mitigations.
- **Alternatives Considered**: A discussion of other approaches that were considered and why they were not chosen.

---

## 2. Implementation Plan

This document outlines the implementation plan for providing document-aware AI-driven comments and suggestions to the user.

## Sections

### Backend (Firebase Functions)

| Priority | Task Description                                     | Implementation Details                                                                                                                                                                                                                                                             | Code Pointers                                                              | Dependencies | Completion |
| :------- | :--------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- | :----------- | :--------- |
| **P1**   | Create `getDocumentComments` Cloud Function          | Create an HTTPS Callable Function. It must be authenticated to ensure only the document owner can trigger it. It will accept `{ documentId, documentContent, documentType }`.                                                                                                          | `functions/src/index.ts` <br/> `functions/src/handlers/comments.ts` (new)  | -            | ☐          |
| **P1**   | Implement OpenAI Orchestration Service               | The main function will use `Promise.all` to trigger multiple, parallel analyses (e.g., structure, clarity). Prompts for inline issues must ask the AI to return `startIndex` and `endIndex` in its JSON response.                      | `functions/src/utils/openai.ts`                                            | -            | ☐          |
| **P1**   | Define Data Model & Firestore Logic                  | Create a new sub-collection `documents/{docId}/ai_comments`. On each run, use a "wipe-and-replace" strategy to clear old comments and save the new ones. Define the `AIComment` type with `type: 'REPLACEMENT' | 'ADVICE'`, `suggestion`, `startIndex`, `endIndex`, etc.            | `functions/src/handlers/comments.ts` <br/> `src/types/index.ts` (shared type) | -            | ☐          |
| **P2**   | Implement Document-Type-Specific Analysis            | In the orchestrator, use a switch statement on the `documentType`. Define the required sections for each type (e.g., 'POST_MORTEM' requires 'Impact', '5 Whys'). Create a separate OpenAI call to check for the presence of these sections.                                                 | `functions/src/utils/openai.ts`                                            | -            | ☐          |

### Frontend (React Client)

| Priority | Task Description                                     | Implementation Details                                                                                                                                                                                                                                                             | Code Pointers                                                                        | Dependencies | Completion |
|:---|:---|:---|:---|:---|:---|
| **P1**   | Create `commentStore` File Structure                 | Create the new directory and files: `comment.store.ts`, `comment.types.ts`, `comment.actions.ts`.                                                                                                                                                                                   | `src/store/comment/` (new folder)                                                    | -            | ☐          |
| **P1**   | Define `commentStore` State & Types                  | In `comment.types.ts`, define the `CommentState` interface (`comments`, `isLoading`, `error`) and the shared `AIComment` type.                                                                                                                                                     | `src/store/comment/comment.types.ts`, `src/types/index.ts`                             | -            | ☐          |
| **P1**   | Implement Core `commentStore` Logic                  | In `comment.store.ts`, set up the Zustand store creator with initial state.                                                                                                                                                                                                            | `src/store/comment/comment.store.ts`                                                 | -            | ☐          |
| **P1**   | Implement `listenToComments` Action                  | Create an action that takes a `documentId` and establishes a real-time `onSnapshot` listener to the `documents/{docId}/ai_comments` Firestore collection. The listener will update the store.                                                                                       | `src/store/comment/comment.actions.ts`                                               | -            | ☐          |
| **P1**   | Implement Listener Cleanup Logic                     | Ensure the `listenToComments` action returns an `unsubscribe` function and that it's called on component unmount to prevent memory leaks.                                                                                                                                        | `src/hooks/useTextEditor.ts` or `DocumentEditor.tsx`                                   | Task 4       | ☐          |
| **P1**   | Create `requestComments` Action                      | Create an action that calls the `getDocumentComments` Cloud Function. It must set `isLoading` to true before the call and false on success or failure, populating the `error` state if needed.                                                                                      | `src/store/comment/comment.actions.ts`                                               | -            | ☐          |
| **P1**   | Add "Submit for Review" Button to UI                 | Add a `<button>` element to the `EditorHeader` component.                                                                                                                                                                                                                          | `src/components/editor/EditorHeader.tsx`                                             | -            | ☐          |
| **P1**   | Implement Button `onClick` Handler                   | Wire the button's `onClick` event to call the `requestComments` action.                                                                                                                                                                                                               | `src/components/editor/EditorHeader.tsx`                                             | Task 6, 7    | ☐          |
| **P1**   | Implement Button Loading State                       | The button should be disabled and show a loading indicator when `isLoading` from the `commentStore` is true.                                                                                                                                                                         | `src/components/editor/EditorHeader.tsx`                                             | Task 2       | ☐          |
| **P1**   | Create `AiCommentHighlight` Extension File           | Create a new file for a custom Tiptap extension.                                                                                                                                                                                                                                       | `src/extensions/AiCommentHighlight.ts`                                               | -            | ☐          |
| **P1**   | Implement ProseMirror Plugin for Decorating          | Within the new extension, create a ProseMirror plugin that defines a `decorations` property.                                                                                                                                                                                           | `src/extensions/AiCommentHighlight.ts`                                               | Task 10      | ☐          |
| **P1**   | Implement Decoration Logic                           | The plugin must read the `comments` from the `commentStore`. For each comment, create a `Decoration.inline`, applying a CSS class and a `data-comment-id` attribute.                                                                                                              | `src/extensions/AiCommentHighlight.ts`                                               | Task 2, 11   | ☐          |
| **P1**   | Integrate New Extension                              | Add the `AiCommentHighlight` extension to the list of extensions in the `useTextEditor` hook.                                                                                                                                                                                        | `src/hooks/useTextEditor.ts`                                                         | Task 12      | ☐          |
| **P1**   | Create `AiCommentPopover` Component File & Structure | Create the new component file and its basic React function structure.                                                                                                                                                                                                                  | `src/components/editor/AiCommentPopover.tsx`                                         | -            | ☐          |
| **P2**   | Manage Popover State                                 | The `DocumentEditor` will manage which comment is active. The popover will appear when an active comment is set and receive its data as props.                                                                                                                                        | `src/components/DocumentEditor.tsx`, `AiCommentPopover.tsx`                          | Task 14      | ☐          |
| **P2**   | Implement Popover Positioning Logic                  | When a highlighted span is clicked, get its `getBoundingClientRect()`. Use these coordinates to position the `AiCommentPopover` absolutely on the page, aligned to the correct line.                                                                                               | `src/components/DocumentEditor.tsx`                                                  | Task 15      | ☐          |
| **P2**   | Implement Conditional Button Rendering               | Inside the popover, render "Accept/Dismiss" buttons if `comment.type === 'REPLACEMENT'`, and "Like/Dislike" buttons if `comment.type === 'ADVICE'`.                                                                                                                              | `src/components/editor/AiCommentPopover.tsx`                                         | Task 14      | ☐          |
| **P2**   | Implement `deleteComment` Action                     | Create an action in the `commentStore` that takes a `commentId` and deletes the corresponding document from Firestore.                                                                                                                                                               | `src/store/comment/comment.actions.ts`                                               | -            | ☐          |
| **P2**   | Wire Popover Actions                                 | Hook up the `onClick` handlers for "Dismiss" and "Dislike" to call the `deleteComment` action.                                                                                                                                                                                           | `src/components/editor/AiCommentPopover.tsx`                                         | Task 17, 18  | ☐          |
| **P2**   | Implement "Accept" Action Logic                      | The "Accept" button's `onClick` handler should use Tiptap commands to replace the text in the editor, then call the `deleteComment` action.                                                                                                                                        | `src/components/editor/AiCommentPopover.tsx`                                         | Task 19      | ☐          |
| **P2**   | Create `DocumentAnalysisPanel` Component             | Create a new component to display structural comments. It will get all comments from the `commentStore` and filter for `ADVICE` types without a `startIndex`.                                                                                                                       | `src/components/editor/DocumentAnalysisPanel.tsx`                                    | Task 2       | ☐          |
| **P2**   | Integrate `DocumentAnalysisPanel`                    | Add the `DocumentAnalysisPanel` to the `DocumentEditor`'s layout, likely in a sidebar.                                                                                                                                                                                                  | `src/components/DocumentEditor.tsx`                                                  | Task 21      | ☐          |
| **P3**   | Style Highlights and Popover                         | Add CSS for `.ai-comment-highlight` and the `AiCommentPopover` to match the app's visual theme.                                                                                                                                                                                        | `src/index.css`                                                                    | -            | ☐          |

</rewritten_file> 