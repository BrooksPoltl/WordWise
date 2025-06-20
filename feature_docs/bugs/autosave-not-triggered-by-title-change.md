# Bug: Auto-save Not Triggered by Title Change

- **Priority**: Important
- **Status**: Not Started

## Description

When a user edits the title of a document, the changes are not reliably saved. The auto-save mechanism that works for the document's main content does not apply to the title, leading to potential data loss if the user navigates away after changing the title without a manual save.

## Code Analysis

The investigation revealed that the application has two separate and inconsistent auto-save implementations: one for the document content and another for the document title.

1.  **Content Auto-save**: In `src/components/TextEditor.tsx`, the `useAutoSave` hook is used to automatically save changes to the document's content. This implementation is debounced and works as expected.

    ```typescript
    // src/components/TextEditor.tsx
    const { debouncedSave } = useAutoSave(documentId);
    // ...
    editor.on('transaction', ({ editor }) => {
      // ...
      const text = editor.getText();
      debouncedSave(text);
    });
    ```

2.  **Title Auto-save**: In `src/components/DocumentEditor.tsx`, a manual, component-level debouncing mechanism using `setTimeout` and `useState` is implemented to save the title. This logic is completely separate from the `useAutoSave` hook.

    ```typescript
    // src/components/DocumentEditor.tsx
    const [titleChangeTimeout, setTitleChangeTimeout] = useState<NodeJS.Timeout | null>(null);
    // ...
    const handleTitleChange = (newTitle: string) => {
      if (!documentId) return;

      if (titleChangeTimeout) {
        clearTimeout(titleChangeTimeout);
      }

      const timeout = setTimeout(async () => {
        await updateDocument({ id: documentId, title: newTitle });
      }, 1500);

      setTitleChangeTimeout(timeout);
    };
    ```

The problem is the existence of this second, inconsistent implementation for the title. The `useAutoSave` hook is designed to handle this functionality but is not being leveraged for title changes.

## Proposed Solutions

### Solution 1: (Recommended) Unify Auto-save Logic in `useAutoSave`

- **Description**: Refactor the `useAutoSave` hook to manage the saving of both the document `content` and `title`. The hook can be modified to accept an object with optional `title` and `content` fields and save only what has changed. The manual `setTimeout` logic in `DocumentEditor.tsx` would be replaced with a call to the unified save function from the hook.
- **Level of Effort**: Medium
- **Tradeoffs**: This requires a refactor of the `useAutoSave` hook and the components that use it (`TextEditor.tsx` and `DocumentEditor.tsx`). However, the benefit is a single, centralized, and reliable auto-save mechanism for the entire document, which is a significant architectural improvement.
- **Why it's likely the fix**: It directly addresses the root cause by eliminating the fragmented save logic and creating a single source of truth for auto-saving.
- **Why it might not be the fix**: This is the correct architectural solution and is highly likely to be a permanent fix.

### Solution 2: Improve the Existing Title-Save Logic

- **Description**: Leave the two separate save mechanisms in place but improve the title-saving logic in `DocumentEditor.tsx`. This could involve creating a custom `useDebouncedCallback` hook to make the implementation cleaner than the current `useState` and `setTimeout` combination.
- **Level of Effort**: Low
- **Tradeoffs**: This is a less invasive, "patch" solution. It would likely fix the immediate bug but would not address the underlying architectural issue of having two different auto-save systems, leaving the codebase harder to maintain.
- **Why it might be the fix**: It would resolve the inconsistent saving of the title without requiring a larger refactor.
- **Why it might not be the fix**: It's a workaround that leaves a poor architectural pattern in place, which could lead to other bugs in the future.

### Solution 3: Prop-Drill the `debouncedSave` Function

- **Description**: Pass the `debouncedSave` function from `TextEditor.tsx` up to its parent `DocumentEditor.tsx` and adapt it to save the title.
- **Level of Effort**: Medium
- **Tradeoffs**: This would create tight and confusing coupling between components, a practice known as "prop drilling." It is an architecturally unsound solution that would make the code difficult to reason about and maintain.
- **Why it might be the fix**: It might technically be possible to make it work.
- **Why it might not be the fix**: It's a poor architectural choice that should be avoided. It would create more problems than it solves.

## Conclusion

**Solution 1** is the best path forward. Unifying the auto-save logic into a single, robust hook is the most professional and maintainable solution. It not only fixes the current bug but also improves the overall architecture of the application. 