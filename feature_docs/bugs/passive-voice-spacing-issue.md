# Bug: Missing Space After Passive Voice Suggestion

- **Priority**: Medium
- **Status**: Not Started

## Description

When a user accepts a passive voice suggestion for a sentence that is not the first in a paragraph, the rewritten sentence is inserted without a leading space. This causes the new sentence to merge with the end of the preceding word, breaking the formatting and readability of the text.

## Code Analysis

The investigation pinpointed the exact location of the bug in the `handleAcceptSuggestion` function within `src/components/TextEditor.tsx`.

When a suggestion of type `passive` is accepted, the following logic is executed:

```typescript
// src/components/TextEditor.tsx

if (suggestion.type === 'passive') {
  const currentText = editor.getText();
  // 1. Get the boundaries of the sentence to be replaced.
  const { start, end } = getSentenceBoundaries(
    currentText, 
    suggestion.startOffset, 
    suggestion.endOffset
  );
  
  // 2. Get the AI-generated replacement text.
  const replacementText = suggestion.suggestions[0].text;

  // 3. Clean the replacement text (remove trailing punctuation).
  const cleanedReplacementText = replacementText.replace(/[.!?]$/, '');
  
  // 4. Replace the original sentence with the cleaned replacement.
  editor
    .chain()
    .focus()
    .command(({ tr }) => {
      tr.replaceWith(start, end, editor.schema.text(cleanedReplacementText));
      return true;
    })
    .run();
}
```

The root cause of the bug lies between steps 3 and 4. The `getSentenceBoundaries` function correctly identifies the start of the sentence text itself, but it does not include any preceding whitespace. The `cleanedReplacementText` from the AI also does not have a leading space. When the `replaceWith` command is executed, it replaces *only* the characters of the original sentence, and the new text is inserted without the necessary leading space, causing it to collide with the previous word.

## Proposed Solutions

### Solution 1: (Recommended) Conditionally Add a Leading Space

- **Description**: In `TextEditor.tsx`, before executing the replacement command, inspect the character immediately before the `start` position of the sentence. If the `start` position is not 0 (i.e., not the beginning of the entire document) and the character at `start - 1` is not a whitespace character, then manually prepend a single space to the `cleanedReplacementText`.
- **Level of Effort**: Low.
- **Tradeoffs**: This is a clean, targeted, and robust solution. It surgically fixes the formatting issue at the exact point where it occurs, with no side effects on other parts of the application.
- **Why it's likely the fix**: It directly and deterministically solves the problem by ensuring a space is present when needed and only when needed.
- **Why it might not be the fix**: This is almost certainly the correct and complete fix.

### Solution 2: Modify `getSentenceBoundaries`

- **Description**: Change the `getSentenceBoundaries` utility to be "space-aware." The function could be altered to include any leading whitespace in its calculation of the `start` offset.
- **Level of Effort**: Medium.
- **Tradeoffs**: This is a risky approach. `getSentenceBoundaries` is a shared utility function, and changing its core behavior could have unintended and negative consequences for other features that rely on it (such as the planned heuristic for detecting proper nouns). It's poor practice to modify a general utility to fix a specific formatting issue.
- **Why it might be the fix**: It would solve the problem at a lower level.
- **Why it might not be the fix**: The risk of introducing new bugs in other features is high.

### Solution 3: Rely on the AI Prompt

- **Description**: Modify the prompt sent to the AI for passive voice rewriting, instructing it to always include a leading space in its response unless the sentence is at the beginning of the text.
- **Level of Effort**: Low to High.
- **Tradeoffs**: This is an unreliable and brittle solution. Relying on an LLM for precise UI formatting is not deterministic. The model may not always follow the instruction, and it incorrectly mixes the responsibility of content generation with presentation logic.
- **Why it might be the fix**: It might work some of the time.
- **Why it might not be the fix**: It's not a guaranteed fix and represents poor architectural design.

## Conclusion

**Solution 1** is the clear winner. It's a simple, reliable, and self-contained fix that corrects the formatting issue in the client-side code where it belongs. This approach ensures consistent behavior without risking side effects or relying on non-deterministic AI behavior. 