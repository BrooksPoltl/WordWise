# WordWise

A modern AI-powered writing assistant built with React, CodeMirror, and Firebase. WordWise provides real-time grammar checking, spelling correction, tone analysis, and AI-powered advisory comments to help users improve their writing.

## 🚀 Features

### Core Writing Features
- **Real-time Grammar & Spell Checking**: Powered by Harper.js with instant suggestions
- **AI-Enhanced Spell Checking**: Advanced corrections using OpenAI API
- **Tone Analysis & Rewriting**: Automatically detect and modify text tone
- **Passive Voice Detection**: Identify and rewrite passive voice constructions
- **Readability Analysis**: Improve text clarity and readability
- **Advisory Comments**: High-level AI feedback on document structure and content

### Document Management
- **CRUD Operations**: Create, read, update, and delete documents
- **Auto-save**: Automatic document saving with debounced updates
- **Document Context**: Add context to documents for better AI suggestions
- **Document Types**: Support for various document types (PRDs, HLDs, LLDs, etc.)
- **Real-time Collaboration**: Firebase-powered real-time document synchronization

### User Experience
- **Authentication**: Secure user registration and login with Firebase Auth
- **User Onboarding**: Role-based onboarding with persona customization
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Offline Support**: Client-side dictionary and Harper.js for offline grammar checking

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript and Vite
- **Editor**: CodeMirror 6 with custom extensions
- **State Management**: Zustand for global state
- **Backend**: Firebase (Auth, Firestore, Functions)
- **AI Integration**: OpenAI API for advanced features
- **Styling**: Tailwind CSS
- **Grammar Engine**: Harper.js (WebAssembly)
- **Build Tool**: Vite with Node.js 20

### System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │  Firebase        │    │   OpenAI API    │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ CodeMirror  │ │◄──►│ │  Firestore   │ │    │ │ GPT-4o-mini │ │
│ │   Editor    │ │    │ │  Database    │ │    │ │   Models    │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Zustand     │ │    │ │  Functions   │ │◄──►│ │ Advisory    │ │
│ │   Stores    │ │    │ │  (Node.js)   │ │    │ │ Comments    │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Harper.js   │ │    │ │  Auth        │ │    │ │ Tone        │ │
│ │ (WASM)      │ │    │ │  Service     │ │    │ │ Analysis    │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔧 Quick Start

### Prerequisites
- Node.js 20 or higher
- Firebase CLI
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/wordwise.git
   cd wordwise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```

4. **Configure Firebase and OpenAI**
   - Add your Firebase configuration to `.env`
   - Add your OpenAI API key to Firebase Functions environment

5. **Initialize Firebase emulator**
   ```bash
   npm run setup
   ```

6. **Start development environment**
   ```bash
   npm run dev
   ```

## 🔥 API Documentation

### Firebase Functions Endpoints

All API endpoints are Firebase Functions accessible via the Firebase SDK's `httpsCallable`.

#### Authentication
- **Base URL**: `https://your-project.cloudfunctions.net/`
- **Authentication**: Firebase Auth required for all endpoints
- **Format**: JSON request/response

#### Available Endpoints

##### 1. Tone Analysis
```typescript
// Endpoint: toneDetect
const toneDetect = httpsCallable(functions, 'toneDetect');

// Request
interface ToneDetectRequest {
  text: string;
}

// Response
interface ToneDetectResponse {
  success: boolean;
  tone: 'Friendly' | 'Professional' | 'Humorous' | 'Serious' | 'Academic' | 'Persuasive' | 'Empathetic';
  confidence?: number;
  error?: string;
}

// Example usage
const result = await toneDetect({ text: "Your document content here" });
```

##### 2. Advisory Comments
```typescript
// Endpoint: getDocumentComments
const getDocumentComments = httpsCallable(functions, 'getDocumentComments');

// Request
interface DocumentCommentsRequest {
  documentId: string;
  documentContent: string;
  documentType?: string;
  documentContext?: string;
  userContext?: string;
}

// Response
interface DocumentCommentsResponse {
  success: boolean;
  comments: Array<{
    sentence: string;
    explanation: string;
    reason: string;
  }>;
  error?: string;
}

// Example usage
const result = await getDocumentComments({
  documentId: "doc123",
  documentContent: "Your document content",
  documentType: "PRD",
  documentContext: "Product requirements document for new feature",
  userContext: "Product Manager working on mobile app features"
});
```

##### 3. Readability Improvement
```typescript
// Endpoint: readabilityRewrite
const readabilityRewrite = httpsCallable(functions, 'readabilityRewrite');

// Request
interface ReadabilityRewriteRequest {
  text: string;
}

// Response
interface ReadabilityRewriteResponse {
  success: boolean;
  text: string;
  error?: string;
}
```

##### 4. Passive Voice Rewriting
```typescript
// Endpoint: passiveRewrite
const passiveRewrite = httpsCallable(functions, 'passiveRewrite');

// Request
interface PassiveRewriteRequest {
  text: string;
}

// Response
interface PassiveRewriteResponse {
  success: boolean;
  text: string;
  error?: string;
}
```

##### 5. User Profile Management
```typescript
// Endpoint: updateUserProfile
const updateUserProfile = httpsCallable(functions, 'updateUserProfile');

// Request
interface UpdateUserProfileRequest {
  role: 'Product Manager' | 'Software Engineer';
  persona?: string; // Optional, max 1000 characters
}

// Response
interface UpdateUserProfileResponse {
  success: boolean;
  message: string;
  data: {
    role: string;
    persona?: string;
  };
  error?: string;
}
```

### Error Handling

All API endpoints follow a consistent error handling pattern:

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Common error codes:
// - 'unauthenticated': User not authenticated
// - 'invalid-argument': Invalid request data
// - 'permission-denied': Insufficient permissions
// - 'not-found': Resource not found
// - 'internal': Internal server error
```

## 👥 User Experience

### User Journey

#### 1. Authentication & Onboarding
- **Sign Up/Sign In**: Firebase Auth with email/password or Google OAuth
- **Role Selection**: Choose professional role (Product Manager, Software Engineer, etc.)
- **Persona Setup**: Optional persona description for personalized AI suggestions
- **Dashboard Introduction**: Feature showcase and getting started guide

#### 2. Document Management
- **Create Document**: New document with title, content, and optional context
- **Document List**: View all documents with search and filter capabilities
- **Document Settings**: Configure document type and context for better AI suggestions
- **Auto-save**: Changes saved automatically with visual feedback

#### 3. Writing & Editing Experience
- **Real-time Checking**: Grammar and spelling suggestions appear as you type
- **Suggestion Popovers**: Click on highlighted text for detailed suggestions
- **Tone Analysis**: Automatic tone detection with rewriting options
- **Advisory Comments**: High-level feedback on document structure and content

#### 4. AI-Powered Features
- **Context-Aware Suggestions**: AI adapts to document type and user role
- **Advisory Categories**:
  - 🔵 Context-aware: Implementation Feasibility, Domain Expertise, Risk Assessment, Competitive Context
  - 🟡 Standard: Strengthen Claims, Define Terms, Improve Flow, Add CTAs, Acknowledge Alternatives
- **Tone Detection**: Automatic analysis of writing tone
- **Readability**: Suggestions for clearer, more concise writing

### User Interface Components

#### Editor Interface
- **Header**: Document title, settings, and user profile
- **Toolbar**: Formatting options and suggestion toggles
- **Editor**: CodeMirror-based rich text editor with syntax highlighting
- **Suggestion Overlays**: Floating popovers for detailed suggestions
- **Status Bar**: Document statistics and save status

#### Dashboard
- **Welcome Section**: Personalized greeting and quick actions
- **Feature Showcase**: AI capabilities and writing analysis tools
- **Document List**: Recent documents with preview and actions
- **Analytics**: Writing score and improvement suggestions

## 🎨 Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── AuthWrapper.tsx           # Authentication wrapper
│   ├── Dashboard.tsx             # Main dashboard
│   ├── DocumentEditor.tsx        # Document editing interface
│   ├── DocumentList.tsx          # Document list view
│   ├── LandingPage.tsx          # Marketing landing page
│   ├── Login.tsx                # Authentication forms
│   ├── SignUp.tsx               # User registration
│   ├── Onboarding.tsx           # User onboarding flow
│   ├── Profile.tsx              # User profile management
│   ├── NewDocumentModal.tsx     # New document creation
│   ├── dashboard/               # Dashboard components
│   │   ├── AIAssistantCard.tsx  # AI features showcase
│   │   ├── SmartAnalysisCard.tsx # Writing analysis tools
│   │   └── FeatureShowcaseSection.tsx # Feature highlights
│   ├── editor/                  # Editor components
│   │   ├── CodeMirrorEditor.tsx # Main editor component
│   │   ├── DocumentCodeMirrorEditor.tsx # Document-specific editor
│   │   ├── EditorHeader.tsx     # Editor header with controls
│   │   ├── DocumentSettingsBar.tsx # Document settings
│   │   ├── FormattingButtons.tsx # Text formatting tools
│   │   ├── ResponsiveToolbar.tsx # Mobile-responsive toolbar
│   │   ├── SuggestionPopover.tsx # Suggestion details
│   │   ├── AdvisoryPopover.tsx  # Advisory comment details
│   │   ├── PassiveSuggestionPopover.tsx # Passive voice suggestions
│   │   ├── SuggestionToggles.tsx # Suggestion visibility controls
│   │   ├── AdvisoryCard.tsx     # Advisory comment card
│   │   ├── AdvisoryModal.tsx    # Advisory comments modal
│   │   └── UpdateContextModal.tsx # Document context editor
│   └── landing/                 # Landing page components
│       ├── HeroSection.tsx      # Hero section
│       ├── FeatureSection.tsx   # Feature highlights
│       ├── CTASection.tsx       # Call-to-action
│       ├── Footer.tsx           # Site footer
│       └── Navbar.tsx           # Navigation bar
```

### State Management (Zustand)

#### Auth Store
```typescript
interface AuthStore {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  signUp: (userData: UserCreatePayload) => Promise<void>;
  signIn: (credentials: UserLoginPayload) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
}
```

#### Document Store
```typescript
interface DocumentStore {
  documents: Document[];
  currentDocument: Document | null;
  loading: boolean;
  error: string | null;
  suggestions: GrammarSuggestion[];
  dismissedSuggestionIds: Set<string>;
  
  fetchDocuments: (userId: string) => Promise<void>;
  fetchDocument: (documentId: string) => Promise<void>;
  createDocument: (userId: string, payload: DocumentCreatePayload) => Promise<Document>;
  updateDocument: (payload: DocumentUpdatePayload) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  setCurrentDocument: (document: Document | null) => void;
  clearError: () => void;
}
```

#### Suggestion Store
```typescript
interface SuggestionStore {
  grammar: GrammarSuggestion[];
  clarity: ClaritySuggestion[];
  conciseness: ConcisenessSuggestion[];
  readability: ReadabilitySuggestion[];
  passive: PassiveSuggestion[];
  visibility: {
    grammar: boolean;
    clarity: boolean;
    conciseness: boolean;
    readability: boolean;
    passive: boolean;
  };
  
  setSuggestions: (suggestions: any) => void;
  toggleVisibility: (type: string) => void;
  clearSuggestions: () => void;
}
```

#### Advisory Store
```typescript
interface AdvisoryStore {
  comments: AdvisoryComment[];
  isLoading: boolean;
  error: string | null;
  
  refreshComments: (content: string, documentId: string, type: string, context: string, userContext: string) => Promise<void>;
  dismissComment: (commentId: string) => void;
  clearComments: () => void;
}
```

### CodeMirror Extensions

#### Custom Extensions
- **SuggestionDecorations**: Highlight grammar and spelling errors
- **AdvisoryDecorations**: Highlight text for advisory comments
- **BasicFormattingDecorations**: Support for bold, italic, headers
- **Harper Linter**: Real-time grammar checking with Harper.js

#### Extension Architecture
```typescript
// Example: Suggestion Decorations Extension
import { Extension } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';

export function createSuggestionDecorationExtension(
  suggestions: GrammarSuggestion[]
): Extension {
  return [
    EditorView.decorations.from(
      suggestionDecorations(suggestions)
    ),
    // Click handling for suggestions
    EditorView.domEventHandlers({
      click: (event, view) => {
        // Handle suggestion clicks
      }
    })
  ];
}
```

### Styling System

#### Tailwind CSS Configuration
- **Mobile-first**: Responsive design starting from mobile
- **Design Tokens**: Consistent colors, spacing, and typography
- **Component Classes**: Reusable utility combinations
- **Theme Configuration**: Custom color palette and extensions

#### Responsive Design Patterns
```css
/* Mobile-first approach */
.editor-container {
  @apply p-4 md:p-6 lg:p-8;
  @apply text-sm md:text-base;
  @apply grid grid-cols-1 lg:grid-cols-2;
}

/* Suggestion popovers */
.suggestion-popover {
  @apply bg-white border border-gray-200 shadow-lg rounded-lg p-4;
  @apply max-w-xs md:max-w-sm lg:max-w-md;
  @apply z-50;
}
```

## 🛠️ Development

### Development Scripts
```bash
# Start development environment
npm run dev              # Start emulators + dev server

# Build and quality checks
npm run build            # Full build with typecheck, lint, test
npm run typecheck        # TypeScript type checking
npm run lint             # ESLint code linting
npm run test             # Run Jest tests
npm run test:watch       # Run tests in watch mode

# Code formatting
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run fix-all          # Fix linting and formatting issues

# Firebase emulators
npm run emulator         # Start Firebase emulators only
npm run emulator:clean   # Start emulators with fresh data
npm run setup            # Initialize Firebase emulator setup
```

### Project Structure
```
WordWise/
├── src/                    # React application source
│   ├── components/         # React components
│   ├── store/             # Zustand state management
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript definitions
│   ├── extensions/        # CodeMirror extensions
│   ├── constants/         # Application constants
│   ├── themes/            # UI themes
│   └── config/            # Configuration files
├── functions/             # Firebase Functions
│   ├── src/
│   │   ├── handlers/      # API endpoint handlers
│   │   ├── utils/         # Utility functions
│   │   └── index.ts       # Function exports
│   └── package.json       # Functions dependencies
├── public/                # Static assets
│   └── dictionaries/      # Spell checking dictionaries
├── scripts/               # Build and utility scripts
├── feature_docs/          # Feature documentation
└── emulator-data/         # Firebase emulator data
```

### Testing

#### Test Configuration
- **Framework**: Jest with React Testing Library
- **Environment**: jsdom for DOM testing
- **Coverage**: Automatic coverage collection
- **Mocking**: Firebase services and external APIs

#### Test Structure
```typescript
// Example test file
describe('DocumentEditor', () => {
  beforeEach(() => {
    // Setup test environment
  });

  test('should render editor with initial content', () => {
    // Test implementation
  });

  test('should handle suggestion clicks', () => {
    // Test implementation
  });
});
```

### Dictionary Management

#### Adding Words to Custom Dictionary
```bash
# Add simple word
node scripts/add-to-dictionary.js hello

# Add word with morphological flags
node scripts/add-to-dictionary.js running /DGSJ

# Validate dictionary
node scripts/add-to-dictionary.js --validate
```

#### Hunspell Flags
- `/S` - Plural forms
- `/M` - Noun usage
- `/G` - Gerund forms (-ing)
- `/D` - Past tense forms (-ed)
- `/J` - Adjective forms
- `/R` - Comparative forms (-er)
- `/T` - Superlative forms (-est)

## 🚀 Deployment

### Build Process
```bash
# Production build
npm run build

# Deploy to Firebase
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

### Environment Configuration

#### Development (.env)
```env
VITE_USE_FIREBASE_EMULATOR=true
VITE_FIREBASE_PROJECT_ID=demo-wordwise
VITE_FIREBASE_API_KEY=demo-api-key
VITE_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
```

#### Production
```env
VITE_USE_FIREBASE_EMULATOR=false
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
```

### Firebase Configuration

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /documents/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
  }
}
```

#### Functions Environment
```bash
# Set OpenAI API key
firebase functions:config:set openai.api_key="your-api-key"

# Deploy functions
firebase deploy --only functions
```

## 🔮 Future Features

### Planned Enhancements
- **Advanced AI Comments**: More sophisticated document analysis
- **Collaborative Editing**: Real-time multi-user editing
- **Document Templates**: Pre-built templates for common document types
- **Advanced Analytics**: Detailed writing metrics and improvements
- **Export Options**: PDF, Word, and other format exports
- **Plugin System**: Extensible architecture for custom features

### Technical Roadmap
- **WYSIWYG Editor**: Enhanced visual editing capabilities
- **Performance Optimization**: Faster loading and rendering
- **Mobile App**: Native mobile applications
- **API Expansion**: Public API for third-party integrations

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on how to submit pull requests, report issues, and contribute to the project.

## 📞 Support

For questions, issues, or support:
- Create an issue on GitHub
- Check our documentation
- Contact the development team

---

**WordWise** - Empowering better writing through AI-driven insights and real-time assistance.
