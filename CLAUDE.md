# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run build` - Full build with typecheck, lint, test, and Vite build (ALWAYS run before committing)
- `npm run typecheck` - TypeScript type checking
- `npm run lint` - ESLint code linting
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run emulator` - Start Firebase emulators only
- `npm run setup` - Initialize Firebase emulator setup

### Code Quality Commands (Always Follow Linting Rules - NO IGNORES)
- `npm run check-all` - Run typecheck, lint check, and format check
- `npm run fix-all` - Run lint fix and format fix
- `npm run lint:summary` - Show linting summary

### Important Development Notes
- **NEVER run `npm run dev`** - Use individual commands as needed
- Always run `npm run build` before committing to ensure code quality
- App runs on port 3000, Firebase emulators on various ports (Auth: 9099, Firestore: 8080, UI: 4000)
- Firebase emulator data is preserved in `./emulator-data` between runs

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite (Node 20)
- **State Management**: Zustand stores
- **Backend**: Firebase (Auth, Firestore, Functions)
- **Editor**: CodeMirror 6 with custom extensions
- **Grammar/Spelling**: Harper.js + OpenAI API for AI features
- **Styling**: Tailwind CSS

### Project Structure
WordWise is a Grammarly clone that uses OpenAI for AI features. Currently implemented features include authentication, spell checking, CRUD document operations, and tone checking/updating.

#### State Management with Zustand
- **Auth Store** (`src/store/auth/`): User authentication state with Firebase integration
- **Document Store** (`src/store/document/`): Document CRUD operations and suggestions management
- **Editor Store** (`src/store/editor/`): Editor-specific state
- **Suggestion Store** (`src/store/suggestion/`): Grammar/spelling suggestions with Harper.js integration

#### CodeMirror 6 Integration (Enhanced from Tiptap)
- **Main Component**: `DocumentCodeMirrorEditor.tsx` - Primary editor interface
- **Extensions**: Custom CodeMirror extensions in `src/extensions/`
  - `SuggestionDecorations.ts`: Handles grammar/spelling highlighting with Harper integration
  - `WysiwygDecorations.ts`: WYSIWYG formatting decorations for dual-mode editing
  - `BasicFormattingDecorations.ts`: Basic text formatting
- **Harper Integration**: `src/utils/harperLinter.ts` - Singleton Harper.js linter for grammar checking
- **Editor Components**:
  - `ResponsiveToolbar.tsx`: Mobile-first adaptive toolbar
  - `SuggestionPopover.tsx`: Displays grammar/spelling suggestions
  - `DocumentSettingsBar.tsx`: Document type and context management

#### Firebase Functions Architecture
- **Location**: `functions/src/` (TypeScript)
- **Handlers**: Organized by feature in `functions/src/handlers/`
  - `tone.ts`: AI-powered tone detection and modification
  - `readability.ts`: Text readability analysis and improvements
  - `passive.ts`: Passive voice detection and rewriting
  - `advisory.ts`: AI-powered document advisory comments
  - `userProfile.ts`: User profile management
- **OpenAI Integration**: AI features through OpenAI API for advanced text analysis

### Key Architectural Patterns

#### Component Organization (Max 200 Lines Per File)
```
ExportedComponent.tsx
├── Main component (functional, TypeScript interfaces)
├── Subcomponents
├── Helper functions
├── Static content
└── Type definitions
```

#### Store Structure Pattern
```
store/feature/
├── feature.store.ts     # Main Zustand store definition
├── feature.actions.ts   # Action implementations
├── feature.types.ts     # TypeScript type definitions
└── index.ts            # Exports
```

#### Editor State Flow
1. User types in CodeMirror editor
2. Harper.js analyzes text for grammar/spelling issues (singleton pattern)
3. Suggestions stored in Zustand suggestion store
4. SuggestionDecorations extension highlights issues with CSS classes
5. User accepts/dismisses suggestions via SuggestionPopover components

## Coding Standards

### TypeScript Requirements
- Use TypeScript for all code; prefer interfaces over types
- Avoid enums; use maps instead
- Use functional components with TypeScript interfaces
- Descriptive variable names with auxiliary verbs (`isLoading`, `hasError`)

### Code Quality Standards
- **FOLLOW ALL LINTING RULES NO IGNORES**
- **ALWAYS RUN BUILD AND LINTING BEFORE RESPONDING**
- Keep files under 200 lines - split into helpers and use folders for organization
- Use functional and declarative programming patterns; avoid classes
- Prefer iteration and modularization over code duplication
- Fix things at the cause, not the symptom - no workarounds, no duct tape

### Performance Guidelines
- Minimize `useEffect`, `setState` - favor Zustand stores for easy refactors
- Avoid `setTimeout` unless absolutely necessary
- Minimize API calls if data already received (e.g., spell checking same text)
- Mobile-first responsive design with Tailwind CSS

### Firebase Best Practices
- Implement proper security rules in `firestore.rules`
- Use Firebase SDK's offline persistence for better performance
- Optimize queries to minimize read/write operations

## Major Features & Components

### WYSIWYG Markdown Editor Enhancement
- **Dual-Mode Editing**: Toggle between raw markdown and WYSIWYG views
- **Visual Formatting**: Click Bold to see **bold text**, not `**bold**` syntax
- **Mobile-First Design**: Responsive toolbar with touch-friendly interactions
- **AI Integration**: Tone detection overlay, enhanced spell checking with visual indicators
- **Implementation**: Uses CodeMirror's markText API for visual formatting overlay

### Harper.js Grammar Integration
- **Performance**: Millisecond response times for real-time grammar checking
- **Privacy**: Fully offline after initial WebAssembly load (~2-3 seconds)
- **Architecture**: Singleton WorkerLinter instance managed in `src/utils/harperLinter.ts`
- **Coverage**: Grammar, spelling, style issues, passive voice detection
- **Configuration**: Rules defined in `src/constants/harperLinterConfig.ts`

### AI-Powered Features
- **Advisory Comments**: High-level document feedback via `requestAdvisoryComments` function
- **Tone Analysis**: Detect and modify text tone through OpenAI integration
- **Spell Checking**: Advanced spell checking with AI-powered suggestions
- **Readability Analysis**: Text improvement suggestions

### Document Management
- **Document Settings**: Update document type and context via dropdown/modal
- **Auto-save**: Document changes saved automatically
- **Firebase Integration**: Real-time data synchronization with Firestore
- **User Authentication**: Firebase Auth with Google sign-in support

## Testing

### Test Configuration
- **Framework**: Jest with jsdom environment and ts-jest
- **Setup**: `src/setupTests.ts`
- **Patterns**: `src/**/__tests__/**/*.(ts|tsx)` and `src/**/*.(test|spec).(ts|tsx)`
- **Coverage**: Collects from all TypeScript files in src/
- **Module Resolution**: `@/(.*)` maps to `<rootDir>/src/$1`

### Running Tests
- `npm run test` - Run all tests
- `npm run test:watch` - Watch mode for development
- `npm run test:coverage` - Generate coverage report

## Dictionary Management

### Adding Words to Custom Dictionary
```bash
# Add simple word
node scripts/add-to-dictionary.js hello

# Add word with Hunspell flags for morphology
node scripts/add-to-dictionary.js running /DGSJ

# Validate dictionary alphabetical order
node scripts/add-to-dictionary.js --validate

# Show help and usage information
node scripts/add-to-dictionary.js --help
```

### Dictionary Features
- **Binary Search**: Efficient O(log n) insertion maintaining alphabetical order
- **Duplicate Detection**: Prevents adding existing words
- **Automatic Backups**: Creates timestamped backups before changes
- **Location**: `public/dictionaries/index.dic` used by client-side nspell

## Environment Setup

### Firebase Emulator Configuration
- Run `npm run setup` for first-time Firebase emulator setup
- Emulator data persists in `./emulator-data` directory
- Use `npm run emulator:clean` to reset all data
- Emulator UI available at: http://localhost:4000

### Environment Variables
- Copy `env.example` to `.env` for configuration
- Set `VITE_USE_FIREBASE_EMULATOR=true` for local development
- Firebase config variables prefixed with `VITE_FIREBASE_`
- OpenAI API key configured via Firebase Functions config

### Port Configuration
- **App**: http://localhost:3000 (Vite dev server)
- **Firebase Auth Emulator**: http://localhost:9099
- **Firestore Emulator**: http://localhost:8080
- **Firebase Functions**: http://localhost:5001
- **Firebase UI**: http://localhost:4000

## Future Development Roadmap

### Technical Debt & Improvements
- Complete migration from Tiptap to CodeMirror 6
- Implement full WYSIWYG mode with visual decorations
- Enhance mobile responsiveness across all components
- Optimize Harper.js integration for large documents
- Add comprehensive end-to-end testing suite