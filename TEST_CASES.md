# WordWise Manual Test Cases

This document provides a set of sentences and scenarios to manually test and verify the functionality of WordWise's text analysis features. Each test case is designed to trigger one or more suggestion types to ensure the system is working as expected.

---

## I. AI Advisory Comments Feature

This section tests the new AI Advisory Comments feature that provides high-level feedback on document structure and substance.

### Test Case A1: Comprehensive Advisory Document
*   **Objective:** Verify that the AI Advisory Comments feature correctly identifies various types of structural and argumentative issues.
*   **Test Document:**
    ```
    Product Requirements Document: New User Dashboard

    Overview
    Our platform needs a better dashboard. Users are complaining about the current one and we should fix it soon.

    Problem Statement
    The dashboard is bad. It doesn't work well and users don't like it. This causes issues for our business.

    Goals
    We want to make a new dashboard that is good. It should be better than the old one and users should like it more.

    User Research
    We talked to some users and they said the dashboard needs improvement. They mentioned various issues but we didn't document all the feedback systematically.

    Technical Requirements
    The new dashboard will use React and will have charts. We'll implement real-time updates using WebSockets. The backend will be built with Node.js and will connect to our existing PostgreSQL database.

    Success Metrics
    We'll measure success by looking at user satisfaction and engagement. The dashboard should perform better than the current version.

    Timeline
    This project should be completed as soon as possible. We need to launch before our competitors do.

    Implementation Plan
    The engineering team will build the dashboard. We'll start with the frontend and then work on the backend. Testing will be done throughout the process.
    ```
*   **Expected Advisory Categories:**
    1.  **Strengthen a Claim:** "Users are complaining" and "The dashboard is bad" should be flagged for needing supporting data/evidence.
    2.  **Define Key Terms:** Technical terms like "WebSockets" and "PostgreSQL" should be flagged for definition.
    3.  **Improve Structural Flow:** Brief paragraphs or dense sections should be identified.
    4.  **Add Clear Call to Action:** Vague sections like "Timeline" and "Implementation Plan" should be flagged for specific next steps.
    5.  **Acknowledge Alternatives:** Lack of alternative solutions mentioned should be identified.

*   **Testing Steps:**
    1.  Paste the test document into the WordWise editor.
    2.  Click the "Get Advice" button in the editor header.
    3.  Verify loading state appears ("Analyzing...").
    4.  Verify modal opens with advisory suggestions.
    5.  Check that suggestions are categorized correctly.
    6.  Test dismissing individual suggestions.
    7.  Test closing the modal.

### Test Case A2: Well-Structured Document (No Suggestions)
*   **Objective:** Verify that well-written documents receive minimal or no advisory suggestions.
*   **Test Document:**
    ```
    Technical Design Document: User Authentication System

    Executive Summary
    This document outlines the design for implementing a secure user authentication system. Based on our analysis of 500+ user feedback responses, 73% of users cited security concerns as their primary barrier to adoption. This system will address these concerns while maintaining usability.

    Problem Statement
    Our current authentication relies on basic username/password combinations. Security audit findings from Q3 2023 revealed 15 critical vulnerabilities. Industry standards (NIST 800-63B) recommend multi-factor authentication for applications handling sensitive data.

    Technical Architecture
    The system will implement OAuth 2.0 with PKCE (Proof Key for Code Exchange) for enhanced security. OAuth 2.0 is an industry-standard authorization framework that enables applications to obtain limited access to user accounts. We considered three alternatives: SAML 2.0 (rejected due to complexity), custom JWT implementation (rejected due to security risks), and Auth0 integration (selected as our primary approach with OAuth 2.0 as fallback).

    Success Metrics
    - Reduce authentication-related support tickets by 40%
    - Achieve 99.9% uptime for authentication services
    - Complete security audit with zero critical findings
    - User adoption rate of 85% within 30 days

    Next Steps
    The development team will begin implementation on January 15th, 2024. Phase 1 (OAuth integration) will be completed by February 1st, followed by Phase 2 (multi-factor authentication) by February 15th.
    ```
*   **Expected Behavior:** Should receive few or no advisory suggestions, demonstrating the AI can distinguish well-structured content.

### Test Case A3: Empty/Minimal Content
*   **Objective:** Verify graceful handling of edge cases.
*   **Test Cases:**
    1.  **Empty Document:** Click "Get Advice" with no content - button should be disabled.
    2.  **Single Sentence:** "This is a test." - Should handle gracefully.
    3.  **Very Short Document:** A few sentences - Should provide appropriate feedback or indicate no suggestions.

---

## II. Comprehensive & Combined Suggestions

These test cases are designed to trigger multiple, overlapping suggestions to test the robustness of the highlighting and popover systems.

### Test Case 1: Passive Voice & Spelling
*   **Sentence:** `The decision was made by the manager, but it had a major errror.`
*   **What to look for:**
    *   **Passive Voice:** The phrase `was made` should be highlighted. The suggestion should offer an active voice alternative, like "The manager made the decision...".
    *   **Spelling:** The word `errror` should be flagged as a spelling mistake, with "error" as a suggestion.

### Test Case 2: Readability & Conciseness
*   **Sentence:** `It is of the utmost importance to undertake a thorough review of all the relevant documentation prior to the commencement of the project.`
*   **What to look for:**
    *   **Readability:** The entire sentence should be highlighted as being too long or complex. The AI suggestion should offer a simpler, more direct version.
    *   **Conciseness:**
        *   `of the utmost importance` -> "it is crucial"
        *   `prior to the commencement of` -> "before"

### Test Case 3: Clarity (Weasel Words) & Spelling
*   **Sentence:** `It seems like we should basically try to completly rethink this feature.`
*   **What to look for:**
    *   **Clarity:** `It seems like`, `basically`, `try to` should all be flagged.
    *   **Spelling:** `completly` -> "completely".

### Test Case 4: Multiple Passive Voice & Wordiness
*   **Sentence:** `In the event that a problem is detected, a notification is sent by the system immediately.`
*   **What to look for:**
    *   **Conciseness:** `In the event that` -> "If".
    *   **Passive Voice:** `is detected` and `is sent` should both be highlighted.

### Test Case 5: All Categories Combined
*   **Sentence:** `Obviously, the new feature was built by the dev team, and it is absolutely essential to utilize their feedback to fix this mispelled text.`
*   **What to look for:**
    *   **Clarity:** `Obviously` (assertive), `absolutely essential` (wordy).
    *   **Passive Voice:** `was built`.
    *   **Conciseness:** `utilize` -> "use".
    *   **Spelling:** `mispelled` -> "misspelled".

---

## II. Isolated Feature Tests

These test cases focus on a single feature to ensure its basic functionality is correct.

### Test Case 6: Simple Spelling Error
*   **Objective:** Verify that a basic spelling mistake is correctly identified and can be corrected.
*   **Text to Enter:** `This is a test with a simple speling mistake.`
*   **Expected Behavior:**
    1.  "speling" is underlined in red.
    2.  Popover suggests "spelling".
    3.  Accepting the suggestion fixes the word.

### Test Case 7: AI Passive Voice Rewrite
*   **Objective:** Verify that the lazy-loaded AI rewrite for passive voice works correctly.
*   **Text to Enter:** `The ball was thrown by the boy.`
*   **Expected Behavior:**
    1.  The sentence is underlined for passive voice.
    2.  The popover shows a loading state, then the suggestion "The boy threw the ball."
    3.  Accepting the suggestion replaces the sentence.

### Test Case 8: Simple Conciseness
*   **Objective:** Verify that a simple wordy phrase is caught.
*   **Text to Enter:** `In order to improve, we must utilize our resources.`
*   **Expected Behavior:**
    1.  `In order to` is underlined, suggesting "To".
    2.  `utilize` is underlined, suggesting "use".

---

## III. Edge Case Tests

These test cases verify that the editor remains stable under unusual conditions.

### Test Case 9: Multiple Suggestions in One Sentence
*   **Objective:** Verify that the editor correctly handles multiple, overlapping, or adjacent suggestions without crashing.
*   **Text to Enter:** `It is absolutly essential that the new featur is implemented by the team in a timely manner.`
*   **Expected Suggestions:**
    *   **Clarity:** "absolutly essential" -> "essential".
    *   **Spelling:** "featur" -> "feature".
    *   **Passive:** "is implemented by the team" -> "the team implements".
*   **Expected Behavior:** All underlines appear correctly and can be actioned independently. Accepting one does not break the others.

### Test Case 10: Deleting Text with Suggestions
*   **Objective:** Verify that deleting text containing active suggestions does not cause the application to crash.
*   **Text to Enter:** `This is a sentance with a misteak.`
*   **Steps:**
    1.  Wait for "sentance" and "misteak" to be underlined.
    2.  Select the entire sentence.
    3.  Press the `Delete` or `Backspace` key.
*   **Expected Behavior:** The text is deleted and the application remains stable. Suggestion counts update to zero. 