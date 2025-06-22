# Enhanced Markdown Editor

## Executive Summary

This document outlines the plan to enhance WordWise's CodeMirror editor with a powerful and intuitive toolbar for inserting markdown syntax. This enhancement focuses on improving the user experience for our target audience—Product Managers and Software Engineers—by providing quick access to common formatting options without requiring them to manually type markdown. This approach prioritizes simplicity and efficiency over a full WYSIWYG implementation.

**Key Features:**
- **Markdown Toolbar**: A responsive toolbar with buttons to insert markdown syntax for standard formatting.
- **Core Formatting**: Support for bold, italics, headers, lists, links, blockquotes, and tables.
- **Mobile-First Design**: A responsive toolbar that works seamlessly on all devices.
- **AI Integration**: Retains all existing AI-powered suggestions and analysis features within the raw markdown context.

**Technical Approach:**
- Extend the existing CodeMirror 6 setup.
- Create a library of editor commands in `src/utils/editorCommands.ts` that use the CodeMirror `dispatch` API to programmatically insert or modify markdown syntax.
- Build a responsive toolbar component (`src/components/editor/ResponsiveToolbar.tsx`) that utilizes these commands.

**Impact:**
- Streamlined document creation for users who prefer markdown but want GUI shortcuts.
- Maintains the speed and simplicity of a raw markdown editor.
- Solid foundation for adding more complex markdown-based features.

---

## Detailed Task Breakdown

| Priority | Task Description | Implementation Details | Code Pointers | Dependencies | Status |
|----------|------------------|----------------------|---------------|--------------|--------|
| **P0** | **Toolbar & Core Commands** | | | | |
| P0 | Implement Responsive Toolbar | Create a toolbar that adapts to different screen sizes. | `src/components/editor/ResponsiveToolbar.tsx` | CodeMirror 6 | ✅ Done |
| P0 | Implement Toolbar Commands for Bold/Italic | Add `toggleMark` command for `**` and `*` syntax. Add buttons to the toolbar. | `src/utils/editorCommands.ts`, `ResponsiveToolbar.tsx` | Toolbar | ✅ Done |
| P0 | Implement Toolbar Commands for Headers (H1-H3) | Add `toggleHeader` command for `#`, `##`, `###` syntax. Add buttons to the toolbar. | `src/utils/editorCommands.ts`, `ResponsiveToolbar.tsx` | Toolbar | ✅ Done |
| **P1** | **Additional Formatting Support** | | | | |
| P1 | Implement Toolbar Command for Links | Add `toggleLink` command. Prompt user for URL and wrap selection in `[text](url)` syntax. Add button to toolbar. | `src/utils/editorCommands.ts`, `ResponsiveToolbar.tsx` | Toolbar | ⏳ Next Up |
| P1 | Implement Toolbar Command for Tables | Add `insertTable` command. Prompt user for rows/columns and insert a markdown table template. Add button to toolbar. | `src/utils/editorCommands.ts`, `ResponsiveToolbar.tsx` | Toolbar | ⏳ Next Up |
| P2 | Implement Toolbar Command for Lists (Unordered/Ordered) | Add commands to toggle bullet (`-`) and numbered (`1.`) list items on selected lines. | `src/utils/editorCommands.ts`, `ResponsiveToolbar.tsx` | Toolbar | 📝 Planned |
| P2 | Implement Toolbar Command for Blockquotes | Add command to toggle blockquote (`>`) syntax on selected lines. | `src/utils/editorCommands.ts`, `ResponsiveToolbar.tsx` | Toolbar | 📝 Planned |
| P2 | Implement Toolbar Command for Code (Inline/Block) | Add commands to wrap selection in backticks (`` ` ``) or triple-backticks (```` ``` ````). | `src/utils/editorCommands.ts`, `ResponsiveToolbar.tsx` | Toolbar | 📝 Planned |
| **Cancelled** | **WYSIWYG Features** | | | | |
| N/A | Create WYSIWYG text decoration system | *Removed due to strategy pivot to pure markdown.* | `src/extensions/WysiwygDecorations.ts` | - | ❌ Cancelled |
| N/A | Build markdown parser for visual rendering | *Removed due to strategy pivot to pure markdown.* | `src/utils/markdownParser.ts` | - |
| N/A | Implement mode toggle functionality | *Removed due to strategy pivot to pure markdown.* | `src/components/editor/ModeToggle.tsx`, `src/store/editor/` | - | ❌ Cancelled |

---

## Technical Architecture Details

The editor enhancement is built directly on top of CodeMirror 6, leveraging its powerful API to programmatically manipulate the document's content. The core of this functionality resides in a set of command functions.

### Editor Commands (`editorCommands.ts`)

A central file, `src/utils/editorCommands.ts`, exports functions that take an `EditorView` instance and apply specific markdown formatting. These functions use the `view.dispatch` method with `changes` to insert text or wrap selections.

- `toggleMark(view, mark)`: Wraps/unwraps a selection with a given mark (e.g., `*` for italics).
- `toggleHeader(view, level)`: Adds/removes header syntax (`#`) at the start of a line.
- `toggleLink(view)`: Prompts for a URL and wraps the selection in markdown link syntax.
- `insertTable(view)`: Inserts a markdown table template at the cursor position.

**Example Command:**
```typescript
// src/utils/editorCommands.ts
export const toggleMark = (view: EditorView | null, mark: string) => {
    if (!view) return;

    const { state, dispatch } = view;
    const { from, to } = state.selection.main;
    const selection = state.doc.sliceString(from, to);
    
    // Check if the selection is already wrapped with the mark
    const isMarked = selection.startsWith(mark) && selection.endsWith(mark);
    
    let change;
    if (isMarked) {
        // Unwrap the mark
        const newSelection = selection.slice(mark.length, selection.length - mark.length);
        change = { from, to, insert: newSelection };
    } else {
        // Wrap with the mark
        change = { from, to, insert: `${mark}${selection}${mark}` };
    }
    
    dispatch({ changes: change });
};
```

### Responsive Toolbar (`ResponsiveToolbar.tsx`)

The UI component, `src/components/editor/ResponsiveToolbar.tsx`, consumes the `EditorView` instance passed down from the main editor component. It contains buttons that, when clicked, invoke the corresponding functions from `editorCommands.ts`, passing the active `EditorView`. This cleanly separates the UI from the editor logic.

This architecture is simple, maintainable, and directly utilizes the CodeMirror API for all operations, ensuring stability and performance.

---

## Technical Implementation Plan

### Architecture Overview

**Core Technology Stack:**
- **Base**: Existing CodeMirror 6 setup
- **WYSIWYG Layer**: Custom text decorations using markText API
- **State Management**: Zustand editor store for mode and formatting state
- **Mobile Support**: Responsive design with touch-optimized controls
- **AI Integration**: Enhanced visual indicators for tone and spelling

### Implementation Phases

#### Phase 1: Foundation (WYSIWYG Core)
- Implement CodeMirror text decoration system
- Create markdown-to-visual conversion engine
- Build basic formatting (bold, italic, headers)
- Establish mode toggle functionality

#### Phase 2: Advanced Formatting
- Add lists, links, code blocks, blockquotes
- Implement table support (basic)
- Create custom syntax highlighting for WYSIWYG mode
- Build line-height and spacing adjustments

#### Phase 3: Mobile Optimization
- Responsive toolbar with collapsible design
- Touch-friendly button sizing and spacing
- Mobile-optimized suggestion overlays

#### Phase 4: AI Integration Enhancement
- Visual tone detection indicators
- Enhanced spell checking with inline corrections
- AI suggestion overlays in WYSIWYG mode

---

## Detailed Task Breakdown

| Priority | Task Description | Implementation Details | Code Pointers | Dependencies | Status |
|----------|------------------|----------------------|---------------|--------------|--------|
| **P0** | **WYSIWYG Foundation** | | | | |
| P0 | Create WYSIWYG text decoration system | Implement markText API wrapper for visual formatting overlay | `src/extensions/WysiwygDecorations.ts` | CodeMirror 6 API | ⏳ |
| P0 | Build markdown parser for visual rendering | Create AST parser to convert markdown to decoration rules | `src/utils/markdownParser.ts` | Markdown parsing library | ⏳ |
| P0 | Implement mode toggle functionality | Add state management and UI toggle between markdown/WYSIWYG | `src/components/editor/ModeToggle.tsx`, `src/store/editor/` | Editor store | ⏳ |
| P0 | Create basic formatting decorations (Bold/Italic/Headers) | Implement visual styling for **bold**, *italic*, # headers | `src/extensions/BasicFormattingDecorations.ts` | WYSIWYG foundation | ⏳ |
| **P1** | **Responsive Toolbar System** | | | | |
| P1 | Design mobile-first toolbar layout | Create collapsible toolbar with responsive breakpoints | `src/components/editor/ResponsiveToolbar.tsx` | CSS Grid/Flexbox | ⏳ |
| P1 | Implement formatting buttons with icons | Add bold, italic, header, list buttons with proper icons | `src/components/editor/FormattingButtons.tsx` | Icon library (Lucide) | ⏳ |
| P1 | Create mobile toolbar collapse/expand | Add hamburger menu for mobile with slide-out toolbar | `src/components/editor/MobileToolbarMenu.tsx` | Touch event handling | ⏳ |
| P1 | Add keyboard shortcuts overlay | Show keyboard shortcuts help modal | `src/components/editor/KeyboardShortcuts.tsx` | Modal component | ⏳ |
| **P1** | **Advanced Formatting Support** | | | | |
| P1 | Implement list decorations (ordered/unordered) | Visual bullets and numbers for markdown lists | `src/extensions/ListDecorations.ts` | WYSIWYG foundation | ⏳ |
| P1 | Add link visual rendering and editing | Clickable links with inline editing capability | `src/extensions/LinkDecorations.ts` | Link parsing utils | ⏳ |
| P1 | Create code block syntax highlighting | Maintain syntax highlighting in WYSIWYG mode | `src/extensions/CodeBlockDecorations.ts` | Language highlighting | ⏳ |
| P1 | Implement blockquote visual styling | Left border and styling for > blockquotes | `src/extensions/BlockquoteDecorations.ts` | CSS styling | ⏳ |
| **P2** | **Mobile UX Optimization** | | | | |
| P2 | Add touch-friendly button sizing | Ensure optimal touch targets (flexible sizing based on button count) | `src/styles/mobile-editor.css` | Responsive design | ⏳ |
| P2 | Create mobile suggestion overlays | Responsive AI suggestion display | `src/components/editor/MobileSuggestionOverlay.tsx` | AI integration | ⏳ |
| P2 | Add mobile keyboard toolbar | Show formatting options above mobile keyboard | `src/components/editor/MobileKeyboardToolbar.tsx` | Mobile detection | ⏳ |
| **P2** | **AI Integration Enhancement** | | | | |
| P2 | Create visual tone indicators | Show tone analysis with color coding in WYSIWYG | `src/components/editor/ToneIndicators.tsx` | Existing tone detection | ⏳ |
| P2 | Enhance spell checking visual feedback | Underline misspelled words with correction popover | `src/components/editor/SpellCheckOverlay.tsx` | Existing spell check | ⏳ |
| **P3** | **Advanced Features** | | | | |
| P3 | Implement table editing support | Basic table creation and editing in WYSIWYG | `src/extensions/TableDecorations.ts` | Table parsing | ⏳ |
| P3 | Add document outline/navigation | Sidebar with heading navigation | `src/components/editor/DocumentOutline.tsx` | Heading extraction | ⏳ |
| P3 | Create export formatting options | Export to various formats (PDF, Word, HTML) | `src/utils/documentExporter.ts` | Export libraries | ⏳ |
| P3 | Implement collaborative cursors | Show other users' cursors in real-time | `src/extensions/CollaborativeCursors.ts` | WebSocket integration | ⏳ |
| **P3** | **Performance & Polish** | | | | |
| P3 | Optimize rendering performance | Lazy loading of decorations, virtual scrolling | `src/utils/performanceOptimizer.ts` | Performance profiling | ⏳ |
| P3 | Add animation transitions | Smooth transitions between modes | `src/styles/editor-animations.css` | CSS animations | ⏳ |
| P3 | Create user preference persistence | Save user's preferred mode and settings | `src/store/preferences/` | LocalStorage utils | ⏳ |
| P3 | Implement accessibility features | Screen reader support, keyboard navigation | `src/utils/accessibility.ts` | ARIA standards | ⏳ |

---

## Technical Architecture Details

### Core WYSIWYG Implementation

Based on the [CodeMirror WYSIWYG discussion](https://discuss.codemirror.net/t/implementing-wysiwyg-markdown-editor-in-codemirror/2403), we'll implement a custom text decoration system using CodeMirror's markText API:

**Text Decoration System:**
```typescript
// src/extensions/WysiwygDecorations.ts
interface DecorationRule {
  regex: RegExp;
  replacement: (match: string) => HTMLElement;
  className: string;
}

class WysiwygRenderer {
  private decorations: DecorationRule[] = [];
  private editor: EditorView;
  
  addDecoration(rule: DecorationRule) { /* */ }
  renderDecorations() { /* */ }
  toggleMode(mode: 'wysiwyg' | 'markdown') { /* */ }
}
```

The approach follows the [HyperMD methodology](https://discuss.codemirror.net/t/implementing-wysiwyg-markdown-editor-in-codemirror/2403) mentioned by @marijn (CodeMirror creator), where "Different line heights should not be a problem. You'll have to do a lot of custom scripting to apply styles to your elements and expand/collapse them at the right moment."

**Responsive Toolbar Design:**
```typescript
// Mobile-first approach with breakpoints
const BREAKPOINTS = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1200px'
};

interface ToolbarConfig {
  mobile: ToolbarButton[];
  desktop: ToolbarButton[];
  collapsedGroups: ToolbarGroup[];
}
```

### AI Integration Points

**Visual Tone Detection:**
- Overlay color-coded indicators on text sections
- Real-time updates as user types
- Integration with existing tone analysis system

**Enhanced Spell Checking:**
- Visual underlines with suggestion popovers
- One-click corrections in WYSIWYG mode
- Integration with existing Harper spell checking

### Mobile-First Design Principles

**Touch Targets:**
- Flexible button sizing based on available space and button count
- Adequate spacing between interactive elements
- Large, easy-to-tap formatting buttons

**Responsive Layout:**
- Collapsible toolbar for small screens
- Adaptive suggestion overlays
- Mobile-optimized editor interface

**Performance Considerations:**
- Lazy loading of complex decorations
- Efficient re-rendering on mode switch
- Optimized for mobile browsers

---

## Integration Points

### Existing Codebase Integration

**Current Editor Component:**
- Enhance `DocumentCodeMirrorEditor.tsx` with WYSIWYG capabilities
- Maintain compatibility with existing autosave functionality
- Preserve current AI integration points

**State Management:**
- Create new editor store with mode state management
- Add formatting preference storage
- Maintain compatibility with current suggestion system

**Styling System:**
- Build on existing Tailwind setup with custom CSS for decorations
- Maintain consistent design language with landing page
- Add mobile-specific styling enhancements

### Reference Implementation

Following the [Inkdrop approach](https://forum.inkdrop.app/t/how-does-inkdrop-implement-the-wysiwyg-markdown-editor/2779), which "renders the content when typing, while preserving the source of the content" using CodeMirror as the foundation.

The [2coffee.dev CodeMirror guide](https://2coffee.dev/en/articles/introduction-to-codemirror-effective-code-and-markdown-editor) provides excellent examples of CodeMirror markdown integration:

```typescript
import { basicSetup, EditorView } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";

let view = new EditorView({
  doc: "Hello\n\n```javascript\nlet x = 'y'\n```",  
  extensions: [
    basicSetup,  
    markdown({ codeLanguages: languages }),  
  ],  
  parent: document.body,  
});
```

### Quality Assurance

**Performance Benchmarks:**
- Document loading time under 2 seconds
- Mode switching under 500ms
- Smooth scrolling with 60fps
- Memory usage optimization for large documents

**Cross-Platform Testing:**
- Mobile device testing across iOS/Android
- Desktop browser compatibility
- Touch interaction validation
- Keyboard navigation support

**User Experience Validation:**
- A/B testing between current and enhanced editor
- User feedback collection for formatting preferences
- Mobile usability testing
- Accessibility compliance verification

---

This enhancement will transform WordWise from a basic markdown editor into a modern, professional document editing platform that rivals industry-standard tools while maintaining the technical elegance that appeals to Product Managers and Software Engineers. 