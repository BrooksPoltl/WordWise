# New Document Creation Flow

## 1. Feature Summary

This document outlines the plan to implement a "New Document" creation flow. This feature will allow users to create new documents from a modal on the Dashboard, providing an optional title, context for the document, and selecting an optional document type based on their professional role. This initial context and typing will enable more powerful, context-aware AI suggestions in the future.

The implementation will also include refactoring the existing user onboarding flow to remove the "Data Scientist" and "Tech Sales" roles, focusing the application's feature set on "Product Manager" and "Software Engineer" roles for a more targeted experience.

## 2. User Roles & Document Types

The application will be streamlined to support the following roles and their associated document types.

#### Product Manager
- **Product Requirements Document (PRD)**: Outline the product's purpose, features, functionality, and behavior.
- **User Story**: Describe a software feature from the end-user's perspective.
- **Feature Specification**: Provide detailed information about a new feature, including design, functionality, and technical requirements.
- **Product Roadmap**: High-level summary of the product's vision and direction over time.

#### Software Engineer
- **Technical Design Document (TDD)**: Detail the technical approach, architecture, and implementation plan for a new feature or system.
- **API Documentation**: Provide clear instructions and examples for using an API.
- **Post-Mortem Analysis**: Document an incident, analyzing the root cause, impact, and steps to prevent recurrence.
- **Request for Comments (RFC)**: Propose a new technical standard or major architectural change and solicit feedback from peers.

## 3. User-Facing Text Strings

- **Modal Title**: "Create a New Document"
- **Title Field Label**: "Title (Optional)"
- **Title Field Placeholder**: "Untitled Document"
- **Context Field Label**: "What's this document about?"
- **Context Field Description**: "Provide some context (e.g., project name, goals, audience). This will help power AI suggestions. You can always add this later."
- **Document Type Section Header**: "Select a document type for tailored AI suggestions (Optional)"
- **Create Button Text**: "Create Document"

---

## 4. Implementation Plan

### Phase 1: Refactoring Existing Roles

| Priority | Task Description | Implementation Details | Code Pointers | Dependencies | Completed |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P1** | Update User Role Constants | Remove "Data Scientist" and "Tech Sales" from the `USER_ROLES` array. | `src/constants/userConstants.ts` | - | ☐ |
| **P1** | Update Backend Role Validation | Update the `USER_ROLES` enum in the `updateUserProfile` Firebase Function to match the new, smaller list of roles. | `functions/src/handlers/userProfile.ts` | - | ☐ |
| **P1** | Update Onboarding Documentation | Update the user roles list in the user onboarding documentation to reflect the changes. | `feature_docs/USER_ONBOARDING.md` | - | ☐ |

### Phase 2: Backend Development

| Priority | Task Description | Implementation Details | Code Pointers | Dependencies | Completed |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P1** | Update Document Data Type | Add `context?: string` and `documentType?: string` to the `Document` interface. | `src/types/index.ts` | - | ☐ |
| **P1** | Update Firestore Security Rules | Ensure the `documents` collection rules allow for writing the new `context` and `documentType` fields during creation. | `firestore.rules` | - | ☐ |
| **P2** | Create `createDocument` Firebase Function | Create a new callable function that accepts `{ title?: string, context?: string, documentType?: string }`. It should validate input, create a new document in Firestore with an `ownerId` and timestamps, and return the new `documentId`. | `functions/src/handlers/document.ts` (New File) | Document Data Type | ☐ |

### Phase 3: Frontend Development

| Priority | Task Description | Implementation Details | Code Pointers | Dependencies | Completed |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P1** | Create Document Constants | Create a new file to store the document type definitions for each role, including name and description. | `src/constants/documentConstants.ts` (New File) | - | ☐ |
| **P1** | Update Document Store | Add `context` and `documentType` to the store's `Document` type. Create a `createDocument` action that calls the new Firebase Function and navigates to the editor on success. | `src/store/document/document.store.ts`, `document.actions.ts` | Backend: Firebase Function | ☐ |
| **P2** | Create `NewDocumentModal` Component | Build the UI for the new document modal. It should include fields for title and context, and a section to select a document type. **Display document type descriptions in a tooltip on hover.** | `src/components/NewDocumentModal.tsx` (New File) | Document Constants, Document Store | ☐ |
| **P2** | Add "New Document" Button to Dashboard | Add a prominent "New Document" button to the `Dashboard` component. This button will manage the state (open/closed) of the `NewDocumentModal`. | `src/components/Dashboard.tsx` | NewDocumentModal Component | ☐ |
| **P2** | Implement Form Logic | In the modal, handle form state, call the `createDocument` action on submit, and display loading/error states. | `src/components/NewDocumentModal.tsx` | Document Store | ☐ |
| **P3** | Editor Placeholder/Context | Determine how the `context` field will be displayed in the `TextEditor`. This may involve updating the editor to show placeholder text if the document content is empty. | `src/components/TextEditor.tsx` | - | ☐ | 