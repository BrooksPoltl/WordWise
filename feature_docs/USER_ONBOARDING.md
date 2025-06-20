# User Onboarding Enhancement Plan

## Feature Summary

This document outlines the plan to implement a new user onboarding flow. This flow will appear immediately after a user creates an account and before they access the main dashboard. The primary goal is to capture the user's professional role and an optional, descriptive persona. This information is crucial for personalizing the user experience, which includes tailoring AI-powered suggestions and providing relevant document templates in future updates.

The feature also includes the creation of a new User Profile page, allowing users to update their role and persona at any time. The main header UI will be updated to replace the current standalone sign-out button with a profile dropdown menu containing links to the new Profile page and the sign-out action.

## User Roles

The following roles will be presented to the user during onboarding. This list will be stored in a constants file and validated on the backend.
-   Product Manager
-   Software Engineer
-   Technical Writer
-   UX/UI Designer
-   Data Scientist
-   Marketing Manager
-   QA Engineer
-   Engineering Manager
-   Business Analyst
-   Tech Sales

## User-Facing Text Strings

-   **Onboarding Page Title**: "Welcome to WordWise! Let's personalize your experience."
-   **Role Selection Sub-header**: "By understanding your role, we can provide you with tailored suggestions, document templates, and insights to help you write more effectively."
-   **Persona Section Title**: "Supercharge your suggestions."
-   **Persona Section Description**: "Give WordWise more context about what you do. The more detail you provide (like your industry, company, or specific projects), the more insightful and relevant the AI's feedback will become. This is optional but highly recommended for the best experience."

---

## Backend Tasks

| Priority | Task Description | Implementation Details | Code Pointers | Dependencies | Completed |
| :--- | :--- | :--- |:--- |:--- |:--- |
| **P1** | Update Firestore Security Rules | Modify `firestore.rules` to allow authenticated users to read and write the `role` and `persona` fields on their own user document in the `users` collection. Ensure other users cannot read or write to this document. | `firestore.rules` | - | ☑️ |
| **P1** | Update User Data Types | Add `role: string`, `persona: string`, and `onboardingCompleted: boolean` to the user data model/interface. | `src/store/user/user.types.ts` | - | ☑️ |
| **P2** | Implement Backend Validation for Role | Add logic in a new or existing Firebase Function to ensure the `role` field submitted by the client is one of the predefined valid roles. This prevents arbitrary data from being saved. | `functions/src/handlers/userProfile.ts` | Backend: User Data Types | ☑️ |

## Frontend Tasks

| Priority | Task Description | Implementation Details | Code Pointers | Dependencies | Completed |
| :--- | :--- | :--- |:--- |:--- |:--- |
| **P1** | Create User Constants | Create a file to store the list of user roles. This makes the list easily maintainable and reusable. | `src/constants/userConstants.ts` (New File) | - | ☑️ |
| **P1** | Update Zustand User Store | Add `role`, `persona`, and `onboardingCompleted` to the user store's state and types. | `src/store/user/user.store.ts`, `src/store/user/user.types.ts` | Backend: User Data Types | ☑️ |
| **P1** | Implement User Profile Update Action | Create a new action that updates the user's `role`, `persona`, and sets `onboardingCompleted` to `true` in Firestore. This action should update the Zustand store upon success. | `src/store/user/user.actions.ts` | Zustand: User Store Update | ☑️ |
| **P2** | Create Onboarding Page Route & Component | Create a new page component for the onboarding flow. This includes the UI for role selection (grid of cards) and persona input (textarea), along with the explanatory text. | `src/components/Onboarding.tsx` (New File), Add route in `src/App.tsx` | User Constants, User Profile Update Action | ☑️ |
| **P2** | Implement Conditional Redirect for New Users | In the main application wrapper, check if the authenticated user has `onboardingCompleted: false`. If so, redirect them to the `/onboarding` route. Otherwise, allow them to proceed to the dashboard. | `src/components/AuthWrapper.tsx` or `src/App.tsx` | Onboarding Page Component | ☑️ |
| **P2** | Create Profile Page Route & Component | Create a new page component where users can view and edit their `role` and `persona`. The page should fetch the user's current data and use the `updateUserProfile` action to save changes. | `src/components/Profile.tsx` (New File), Add route in `src/App.tsx` | User Profile Update Action | ☐ |
| **P3** | Update Header/Profile Indicator UI | Modify the existing profile indicator to be a dropdown menu. Remove the old standalone sign-out button. The dropdown will contain links to the new "Profile" page (`/profile`) and the existing "Sign Out" functionality. | `src/components/editor/EditorHeader.tsx` (Likely location) | Profile Page Component | ☐ |

</rewritten_file> 