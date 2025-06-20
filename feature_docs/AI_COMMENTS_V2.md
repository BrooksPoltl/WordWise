# Feature: AI-Powered Advisory Comments (MVP)

## 1. Overview & Vision (MVP)

This document outlines the Minimum Viable Product (MVP) for an AI-powered advisory comments feature. The vision is to provide users with on-demand, high-level feedback to improve the substance and structure of their writing. This MVP prioritizes a streamlined user flow, focusing exclusively on this new category of advice via a simple request/response architecture.

## 2. Core User Story (MVP)

> As a user, I want to request a review of my document and see a list of AI-generated advisory comments, so I can get high-level feedback on how to strengthen my arguments and improve my document's structure.

## 3. Functional Requirements & Scope

-   **Trigger**: Two buttons will be located in the editor's header:
    -   **"Get Comments" button**: Triggers new AI analysis and opens the modal with fresh suggestions.
    -   **"Comments" button**: Opens existing advisory comments without triggering new analysis. This button is disabled when no comments exist and shows a badge with the comment count when available.
-   **User Interface**:
    -   Clicking the "Get Comments" button will trigger a loading state and upon completion, open a **full-screen, scrollable modal**.
    -   Clicking the "Comments" button will immediately open the modal with existing suggestions.
    -   All interactions will occur inside the modal.
    -   The modal can be closed and reopened without losing existing suggestions.
-   **Suggestion Category**: The AI analysis will provide a single type of feedback:
    -   **Advisory Comments (`ADVICE`)**: Higher-level suggestions that encourage the user to improve the document's substance. These suggestions only include the relevant text and an explanation.
        -   **Strengthen a Claim**: "Consider adding a specific data point or example to support this claim."
        -   **Define a Key Term**: "This term may be unfamiliar to some readers. Consider adding a definition."
        -   **Improve Structural Flow**: "This paragraph is dense. Consider breaking it into smaller, more focused paragraphs."
        -   **Add a Call to Action**: "What is the key takeaway? Consider adding a sentence stating the desired next step."
        -   **Acknowledge Alternatives**: "To build a stronger case, consider briefly mentioning alternative solutions."
-   **User Actions Within Modal**:
    -   Each advisory comment card will have a single "Dismiss" button to remove it from the list.
    -   Dismissed suggestions are permanently removed and won't be restored even if the modal is reopened.

## 4. Technical Architecture (MVP)

The architecture uses a direct request/response flow and does not persist suggestions in Firestore.

-   **Backend (Firebase Functions)**:
    -   A single HTTPS Callable Function, `requestAdvisoryComments`, will serve as the endpoint.
    -   **Input**: `{ documentContent: string }`
    -   **Process**: It will construct a prompt for the OpenAI API (`gpt-4-turbo-preview`), requesting a structured JSON response containing an array of advisory suggestions, as detailed in the section below.
    -   **Output**: It returns the array of suggestion objects directly in the function's response: `Promise<AIAdvisorySuggestion[]>`
    -   **Data Model**: A shared `AIAdvisorySuggestion` type will be defined.
        ```typescript
        // in src/types/index.ts
        export type AIAdvisorySuggestion = {
          id: string; // Unique ID generated on the frontend for state management
          originalText: string; // The text the advice pertains to
          explanation: string; // The AI's advice
          startIndex: number;
          endIndex: number;
        };
        ```

### 4.1. LLM Prompt Design

The success of this feature hinges on a precise and well-structured prompt. The following system prompt will be sent to the `gpt-4-turbo-preview` model to ensure a reliable and parseable JSON output.

**System Prompt:**
```
You are an expert writing assistant and editor, specializing in providing high-level, structural, and argumentative feedback on business and technical documents. Your goal is to help users strengthen their writing by focusing on substance, not just style.

You will be given a document as a single block of text. Your task is to analyze this text and identify opportunities for improvement based *only* on the following advisory categories:

1.  **Strengthen a Claim**: Identify a subjective statement, an opinion, or a claim made without sufficient proof. Suggest that the user add a specific data point, a statistic, or a concrete example.
2.  **Define a Key Term/Acronym**: Find specialized jargon or an acronym that has not been defined. Suggest that the user add a brief definition for clarity.
3.  **Improve Structural Flow**: Detect paragraphs that are overly long, dense, or contain multiple disconnected ideas. Suggest breaking the paragraph into smaller, more focused units.
4.  **Add a Clear Call to Action**: Find sections that describe a problem or situation but do not guide the reader on the next steps. Suggest adding a concluding sentence that summarizes the main point or states the desired action.
5.  **Acknowledge Alternatives**: When a specific solution or proposal is presented, identify the absence of context about other options. Suggest that the user briefly mention alternatives that were considered to strengthen their case.

**Output Format:**
You MUST return your response as a valid JSON array of objects. Each object represents a single piece of advice. Your entire response must be ONLY the JSON array, with no other text, explanations, or markdown formatting.

The format for each object in the array MUST be as follows:
```json
{
  "originalText": "<The exact, verbatim text from the document that your advice pertains to.>",
  "explanation": "<Your concise advice, written in the second person (e.g., 'Consider adding a data point...')>",
  "startIndex": "<The starting character index of originalText within the full document as a number>",
  "endIndex": "<The ending character index of originalText within the full document as a number>"
}
```

**Constraints:**
-   **DO NOT** provide grammatical corrections, stylistic rewrites, or spelling suggestions. Focus exclusively on the five advisory categories listed above.
-   The `originalText` field in your JSON output must be an *exact* substring of the input document.
-   The `startIndex` and `endIndex` values must correspond precisely to the location of `originalText`. `endIndex` should be `startIndex` + `originalText.length`.
-   If you find no instances that fit these categories, you MUST return an empty array: `[]`.
```

-   **Frontend (React Client)**:
    -   **State Management**: A new Zustand store, `advisoryStore`, will manage the UI state.
        -   **State**: `isOpen: boolean`, `isLoading: boolean`, `suggestions: AIAdvisorySuggestion[]`, `error: string | null`.
        -   **Actions**: `