# CodeMirror + Harper Editor Integration Plan

This document outlines the plan to replace the existing Tiptap-based text editor with a new, more powerful editor built on CodeMirror 6 and the Harper grammar engine. The goal is to improve performance, provide a cleaner highlighting experience, and create a more maintainable and extensible editor core.

## 1. Core Technologies

-   **Editor Framework**: **CodeMirror 6**. Chosen for its performance, extensibility, and superior decoration system, which is ideal for non-destructive grammar highlighting.
-   **Grammar Engine**: **Harper**. A fast, private, Wasm-based grammar linter that runs entirely in the browser.
-   **Document Format**: **Markdown**. We will use CodeMirror's native Markdown support for document structure and formatting.

## 2. Key Architectural Goals

-   **Decoupling**: Separate the editor view (CodeMirror) from the grammar logic (Harper) using a dedicated React hook (`useHarperLinter`).
-   **Component Reuse**: Integrate our existing React-based `SuggestionPopover` components with CodeMirror's tooltip system to maintain UI consistency.
-   **Performance**: Ensure a fast, responsive user experience by leveraging CodeMirror's virtualized DOM and Harper's efficient Wasm build.
-   **Maintainability**: Create a more organized and strictly-typed codebase for the editor.

## 3. Implementation Task Plan

| Priority | Task Description | Implementation Details | Code Pointers | Dependencies | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P1** | **Project Setup & Dependencies** | Add all necessary CodeMirror packages (`@codemirror/view`, `@codemirror/state`, `@codemirror/lang-markdown`, etc.) to `package.json`. Copy the `harper.wasm` binary to the `public/` folder to be served locally. | - **Edit:** `package.json` <br>- **Create:** `public/harper.wasm` | `npm` or `pnpm` | Not Started |
| **P1** | **Define Harper Types** | Create a new TypeScript definition file to house the `Linter`, `Lint`, `Suggestion`, and other related interfaces provided in the Harper documentation. This ensures a strictly-typed integration. | - **Create:** `src/types/harper.d.ts` | None | Not Started |
| **P1** | **Create Harper Linter Hook** | Develop a React hook (`useHarperLinter`) to manage the entire lifecycle of the Harper engine. It will handle loading the Wasm binary, managing state (loading, ready, error), and exposing a typed `linter` instance. | - **Create:** `src/hooks/useHarperLinter.ts` | `harper.d.ts` | Not Started |
| **P2** | **Create Core CodeMirror Component** | Build the main `CodeMirrorEditor.tsx` component. This component will initialize a CodeMirror `EditorView` instance. | - **Create:** `src/components/editor/CodeMirrorEditor.tsx` | `@codemirror/view`, `@codemirror/state` | Not Started |
| **P2** | **Integrate Markdown Support** | Add the `@codemirror/lang-markdown` extension to the editor to provide out-of-the-box syntax highlighting for Markdown. | - **Edit:** `src/components/editor/CodeMirrorEditor.tsx` | `@codemirror/lang-markdown` | Not Started |
| **P1** | **Bridge Harper Lints to Decorations** | Create the core logic that runs Harper's `lint()` function on document changes. It will then convert the array of `Lint` objects into CodeMirror `Decoration` objects (e.g., wavy red underlines) and apply them to the editor view. | - **Edit:** `src/components/editor/CodeMirrorEditor.tsx` | `useHarperLinter` | Not Started |
| **P2** | **Integrate Existing Suggestion Popovers** | **Use CodeMirror's `showTooltip` extension to render our existing React-based popover components.** This will involve creating a small "bridge" that allows CodeMirror to mount and display a React component (`SuggestionPopover`) when hovering over a decoration. | - **Edit:** `src/components/editor/CodeMirrorEditor.tsx` <br>- **Use:** `src/components/editor/SuggestionPopover.tsx` | `@codemirror/view`'s tooltip system, `ReactDOM` | Not Started |
| **P2** | **Implement "Apply Suggestion"** | Inside the `SuggestionPopover` component, ensure the "apply" button calls `linter.applySuggestion()` and dispatches the change to the CodeMirror document. | - **Edit:** `src/components/editor/SuggestionPopover.tsx` <br>- **Edit:** `src/components/editor/CodeMirrorEditor.tsx` | `useHarperLinter` | Tooltip integration | Not Started |
| **P3** | **Styling and Theming** | Create a custom CodeMirror theme extension to style the editor, highlights, and tooltips to match the WordWise design system. | - **Create:** `src/themes/wordwiseTheme.ts` <br>- **Edit:** `src/components/editor/CodeMirrorEditor.tsx` | `@codemirror/view` | None | Not Started |
| **P3** | **Add POC Route** | Add a new route (`/codemirror-poc`) to `App.tsx` to allow for isolated testing and development of the new editor component. | - **Edit:** `src/App.tsx` | `CodeMirrorEditor` component | Not Started |

</rewritten_file> 