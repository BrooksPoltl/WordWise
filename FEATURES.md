# AlignWrite Feature Requirements

This document outlines the requirements for the key features of AlignWrite.

## Spell Checking

The spell checking feature is designed to be a seamless and intuitive part of the writing process. It provides real-time feedback to help users identify and correct spelling errors.

### Core Functionality

-   **Error Highlighting**: Misspelled words shall be visually highlighted within the text editor using a distinct underline decoration.
-   **Suggestion Popover**: Hovering over a highlighted word shall display a small popover or tooltip containing a list of suggested corrections.
-   **Apply Suggestion**: Clicking on a suggestion from the list shall replace the misspelled word in the editor with the selected correction. The underline decoration for that word shall be removed.
-   **Dismiss Suggestion**: The suggestion popover shall include an option to "dismiss" or "ignore" the suggestion. Once dismissed, the underline decoration for that specific instance of the word shall be removed, and it will not be flagged as an error again for the current session.

### Triggering Spell Check

-   **On-the-fly Document Check**: Spell check is triggered automatically on every change to the document content. This provides instant, real-time feedback as the user types, pastes, or edits text.

### Technical Requirements

-   **Client-Side Engine**: Spell checking is powered by `nspell`, a Hunspell-compatible engine that runs entirely in the user's browser.
    -   It uses local English dictionary files (`.aff` and `.dic`) for fast, offline spell checking.
    -   This approach ensures user privacy as no content is sent to a server for spell checking.
-   **Performance**:
    -   The client-side engine is highly performant, allowing for a full document re-check on each keystroke without noticeable delay.
-   **State Management**: The list of active spelling suggestions and the set of dismissed suggestion IDs are managed by the global `documentStore` (Zustand). This ensures a single source of truth and allows for easy updates from different parts of the application.

## 1. User Authentication

// ... existing code ... 