# WordWise Manual Test Cases

This document provides a set of sentences and scenarios to manually test and verify the functionality of WordWise's text analysis features. Each test case is designed to trigger one or more suggestion types to ensure the system is working as expected.

---

## I. Comprehensive & Combined Suggestions

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