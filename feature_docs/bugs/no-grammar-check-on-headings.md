# Bug: No Grammar Checking on Headings

- **Priority**: Less Important
- **Status**: Not Started

## Description

The application's suggestion system (which includes spell-checking, grammar, conciseness, etc.) does not apply its visual highlights to text within heading elements (H1, H2, etc.). While the text content of headings is being analyzed, the resulting suggestions are not rendered in the UI, leaving the user unaware of potential issues in their headings.

## Code Analysis

The investigation confirmed that the issue is not with the analysis itself, but with the rendering of the suggestions.

1.  **Text Extraction (`useSuggestions.ts`)**: The analysis begins in the `useSuggestions` hook, which uses `editor.getText()` to extract the document's content. This Tiptap method correctly extracts text from all nodes, including headings, into a single string. The analysis pipeline is therefore processing the heading text.

2.  **Decoration Logic (`SuggestionDecorations.ts`)**: The `SuggestionDecorations` extension is responsible for applying the highlights. Its logic is based on character offsets within the plain text version of the document and is designed to be agnostic to the type of block node (paragraph, heading, etc.) the text resides in. The decorations are being created correctly for the heading text.

3.  **The Root Cause (Tiptap Schema)**: The problem lies in the configuration of the Tiptap editor itself. The editor is configured using Tiptap's `StarterKit` extension in `src/hooks/useTextEditor.ts`. By default, or in some versions, `StarterKit` may configure its `Heading` nodes with a schema that restricts inline content. Specifically, it might not allow "marks" (which is how Tiptap handles inline styling like bold, italic, and our custom suggestion highlights) within heading elements. Because the suggestion highlights are implemented as marks, the editor's schema for headings is silently preventing them from being rendered.

## Proposed Solutions

### Solution 1: (Recommended) Explicitly Configure `StarterKit` for Headings

- **Description**: In `src/hooks/useTextEditor.ts`, modify the `StarterKit` configuration to explicitly define the schema for heading nodes. We will configure it to allow inline content, which includes the marks required for suggestion highlighting.

    ```typescript
    // In src/hooks/useTextEditor.ts
    // ...
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3], // Or whatever levels are needed
          content: 'inline*', // This is the key change
        },
      }),
      // ... other extensions
    ],
    // ...
    ```
    The `content: 'inline*'` setting explicitly tells Tiptap that heading nodes can contain any inline content, including our suggestion marks.

- **Level of Effort**: Low.
- **Tradeoffs**: None. This is the correct, standard Tiptap way to customize the behavior of a default extension. It's a clean, declarative fix that makes our intentions clear.
- **Why it's likely the fix**: It directly addresses the most probable root cause—the node's schema—by overriding the default configuration with one that explicitly permits the required content type.
- **Why it might not be the fix**: It is highly likely that this is the correct and complete fix.

### Solution 2: Rebuild Editor Without `StarterKit`

- **Description**: Instead of using the `StarterKit` bundle, manually import and configure each Tiptap extension (`Paragraph`, `Heading`, `Bold`, etc.) individually in `useTextEditor.ts`. This would provide full control over the `Heading` schema.
- **Level of Effort**: Medium.
- **Tradeoffs**: This is a significant refactor that adds a large amount of boilerplate code and complexity to the editor setup, all to fix a single configuration issue. It's overkill.
- **Why it might be the fix**: It would allow for precise configuration of the `Heading` node.
- **Why it might not be the fix**: It's a much more invasive and verbose solution to a problem that can be solved with a simple configuration override.

### Solution 3: Create a Custom Heading Extension

- **Description**: Develop a completely new, custom Tiptap extension that inherits from the default `Heading` extension but modifies its schema to allow for suggestion marks.
- **Level of Effort**: High.
- **Tradeoffs**: This is the most complex solution, requiring a deep understanding of the Tiptap extension API. It adds a significant amount of custom code to maintain for what is a simple configuration issue.
- **Why it might be the fix**: It would work.
- **Why it might not be the fix**: It's a heavyweight, unnecessary solution.

## Conclusion

**Solution 1** is the clear and correct approach. It uses Tiptap's standard API for customizing bundled extensions and provides a simple, declarative, and low-risk fix for the problem. 