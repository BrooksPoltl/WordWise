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

### Test Case A4: Context-Aware Advisory Comments (Product Manager)
*   **Objective:** Verify that the AI provides context-aware recommendations based on user role, document type, and document context.
*   **Setup Requirements:**
    1.  **User Profile Setup:**
        - Role: Product Manager
        - Persona: "Senior PM at B2B SaaS company with 5+ years experience. Focus on data-driven decisions, user research, and stakeholder alignment. Working primarily with engineering and design teams on customer-facing features."
    2.  **Document Type:** Product Requirements Document (PRD)
    3.  **Document Context:** "Mobile banking app for small business owners. Target audience includes engineering team, design team, and executive stakeholders. Must meet regulatory compliance requirements and launch Q2 2024."

*   **Test Document:**
    ```
    PRD: Small Business Mobile Banking Features

    Overview
    We're building new features for small business owners who need mobile banking solutions. The current app doesn't meet their needs very well.

    Problem Statement
    Small businesses struggle with banking on mobile devices. They need better tools to manage their finances. Our research shows they want improved functionality.

    User Stories
    - As a small business owner, I want to transfer money between accounts
    - As a user, I want to view account balances
    - As a business owner, I want to pay vendors

    Technical Implementation
    The mobile app will integrate with our existing banking APIs. We'll use React Native for cross-platform development. The backend services are already built and can handle the additional load.

    Success Criteria
    We expect positive user feedback and increased app usage. The feature should be better than competitors.

    Timeline
    Launch should happen soon. Development will take some time but we need to be quick to market.

    Regulatory Requirements
    Banking apps need to follow certain rules and regulations for financial transactions.
    ```

*   **Expected Context-Aware Recommendations (Blue colored):**
    1.  **Audience-Specific Suggestions:**
        - "For executive stakeholders, consider adding specific business impact metrics and ROI projections."
        - "Given your engineering audience, include more technical requirements such as API rate limits, error handling, and security protocols."

    2.  **Role-Specific PM Guidance:**
        - "As a PM, you should include user research data to support the problem statement. Consider adding survey results, user interview quotes, or usage analytics."
        - "Missing acceptance criteria for user stories. Each story should include specific, testable conditions for engineering team."

    3.  **Domain-Specific Insights:**
        - "For mobile banking apps targeting small businesses, consider offline functionality for areas with poor connectivity."
        - "Given the B2B SaaS context, include integration requirements with common business tools like QuickBooks or accounting software."

    4.  **Regulatory Compliance Guidance:**
        - "Since this is a banking app with regulatory requirements, specify which regulations apply (PCI DSS, SOX, etc.) and include security requirements."
        - "Consider adding a dedicated compliance section detailing data protection and financial transaction security measures."

    5.  **Timeline & Resource Planning:**
        - "For Q2 2024 launch, provide specific milestones and dependencies. Consider including resource allocation and risk mitigation strategies."

*   **Testing Steps:**
    1.  Set up user profile with specified role and persona
    2.  Create new document and select "Product Requirements Document (PRD)" as document type
    3.  Fill in document context field with provided context
    4.  Paste the test document content
    5.  Click "Get Feedback" button
    6.  Verify context-aware recommendations appear in **blue** color
    7.  Check that suggestions reference:
        - User role (PM-specific advice)
        - Document context (mobile banking, B2B, regulatory requirements)
        - Target audience (engineering, design, executives)
        - Domain expertise (B2B SaaS, small business needs)
    8.  Verify blue styling in both card view and modal view
    9.  Test dismissing context-aware recommendations independently of other advisory comments

*   **Expected Behavior:**
    - Context-aware recommendations appear alongside standard advisory comments
    - Blue visual styling distinguishes context recommendations from amber ones
    - Suggestions demonstrate understanding of PM role and B2B SaaS context
    - Recommendations are substantive and actionable for the specific use case
    - No regression in existing advisory comment functionality

### Test Case A5: Context-Aware Edge Cases
*   **Objective:** Verify graceful handling of context-aware feature with missing or minimal context.
*   **Test Scenarios:**
    1.  **No Document Context:** User persona set, document type selected, but context field empty
    2.  **No User Persona:** Document context filled, but user persona not set
    3.  **Generic Context:** Vague context like "writing a document for work"
    4.  **Mismatched Context:** Software Engineer user writing PRD (role mismatch)

*   **Expected Behavior:** System should degrade gracefully, potentially providing fewer context-specific suggestions but not breaking.

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