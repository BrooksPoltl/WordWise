# Feature Requirements

This document outlines the requirements for the key features of WordWise.

## Spell Checking

The spell checking feature is designed to be a seamless and intuitive part of the writing process. It provides real-time feedback to help users identify and correct spelling errors.

### Core Functionality

-   **Error Highlighting**: Misspelled words shall be visually highlighted within the text editor using a distinct underline decoration.
-   **Suggestion Popover**: Hovering over a highlighted word shall display a small popover or tooltip containing a list of suggested corrections.
-   **Apply Suggestion**: Clicking on a suggestion from the list shall replace the misspelled word in the editor with the selected correction. The underline decoration for that word shall be removed.
-   **Dismiss Suggestion**: The suggestion popover shall include an option to "dismiss" or "ignore" the suggestion. Once dismissed, the underline decoration for that specific instance of the word shall be removed, and it will not be flagged as an error again for the current session.

### Triggering Spell Check

-   **On-the-fly Word Check**: Spell check shall be triggered automatically on the last typed word immediately after the user types a space character. This provides instant feedback during the writing process.
-   **Full Check on Paste**: When a user pastes content into the editor, a spell check shall be performed on the entire document. This ensures that potentially large blocks of new text are validated.
-   **Initial Load**: When a document is first loaded, a full spell check is performed to highlight any existing errors.

### Technical Requirements

-   **Backend Service**: Spell checking is powered by a dedicated `spellCheck` Firebase Function.
    -   The function accepts an array of unique words from the document.
    -   It uses the OpenAI API to generate a map of misspelled words to their suggested corrections.
    -   The function is protected and requires user authentication.
-   **Client-Side Logic**:
    -   The client is responsible for identifying unique words in the document content to send to the backend.
    -   Upon receiving the suggestion map from the backend, the client must find all occurrences of each misspelled word in the text.
    -   For each occurrence, the client will calculate the precise start and end character offsets to apply the visual decorations correctly.
-   **Performance**:
    -   To avoid excessive API calls on every keystroke, the primary spell-checking mechanism is targeted at specific user actions (space press, paste).
    -   A full-document check is reserved for initial load and paste events, which are less frequent.
-   **State Management**: The list of active spelling suggestions and the set of dismissed suggestion IDs shall be managed by the global `documentStore` (Zustand). This ensures a single source of truth and allows for easy updates from different parts of the application. 