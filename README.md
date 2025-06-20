# WordWise

A modern grammar and spell checking application built with React, Tiptap, and Firebase.

## Features

### Current Features
- **Authentication**: User registration and login
- **Spell Checking**: Real-time spell checking with AI-powered suggestions
- **Document Operations**: Create, read, update, and delete documents
- **Tone Analysis**: Detect and modify the tone of text
- **Real-time Editing**: Live text editing with immediate feedback

### AI-Powered Features
- **Spell Checking**: Advanced spell checking using OpenAI API
- **Tone Detection**: Automatically detect the tone of written content
- **Tone Rewriting**: Transform text to match desired tones

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Editor**: Tiptap (ProseMirror-based rich text editor)
- **State Management**: Zustand
- **Backend**: Firebase (Firestore, Functions, Auth)
- **AI**: OpenAI API
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## Architecture

### Spell Checking Implementation

The spell checking system has been completely redesigned to use ProseMirror's decoration system for better performance and reliability:

#### New Decoration-Based Approach
- **Robust Highlighting**: Uses ProseMirror decorations that automatically adapt to text changes
- **Accurate Positioning**: Reliable offset-to-position conversion
- **Performance Optimized**: Decorations are efficiently managed and updated
- **Click Handling**: Built-in click detection for spell suggestions

#### Key Components
- `SpellCheckDecorations` extension: Handles all decoration logic
- Real-time API integration with OpenAI
- Automatic decoration updates when text changes
- Proper cleanup and memory management

#### Benefits Over Previous Implementation
- **No offset drift**: Decorations automatically map through document changes
- **Better performance**: No complex DOM manipulation or HTML parsing
- **Cleaner code**: Simpler, more maintainable implementation
- **Fewer bugs**: Leverages ProseMirror's battle-tested decoration system

### Project Structure

```
src/
├── components/
│   ├── TextEditor.tsx          # Main editor with spell checking
│   ├── SuggestionSidebar.tsx   # AI-powered suggestions display
│   └── ...
├── extensions/
│   └── SpellCheckDecorations.ts # New decoration-based spell checking
├── store/
│   ├── authStore.ts
│   ├── documentStore.ts
│   └── userStore.ts
├── utils/
│   ├── spellChecker.ts         # Spell checking service
│   ├── toneAnalyzer.ts         # Tone analysis utilities
│   └── ...
└── types/
    └── index.ts                # TypeScript definitions
```

## Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Configure Firebase**: Set up your Firebase project
4. **Configure OpenAI**: Add your OpenAI API key
5. **Start development server**: `npm run dev`

## Firebase Configuration

Create a `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

## OpenAI Configuration

Add your OpenAI API key to Firebase Functions environment:

```bash
firebase functions:config:set openai.api_key="your_openai_api_key"
```

## Development

```bash
# Start development server
npm run dev

# Start Firebase emulators
npm run emulator

# Build for production
npm run build
```

## Dictionary Management

WordWise includes a powerful dictionary management script that allows you to add words to the Hunspell dictionary file while maintaining proper alphabetical order using binary search algorithms.

### Dictionary Script Usage

The dictionary management script is located at `scripts/add-to-dictionary.js` and provides the following functionality:

#### Adding Words

```bash
# Add a simple word
node scripts/add-to-dictionary.js hello

# Add a word with Hunspell flags
node scripts/add-to-dictionary.js running /DGSJ

# Add a noun that can be plural
node scripts/add-to-dictionary.js computer /SM
```

#### Common Hunspell Flags

- `/S` - Plural forms
- `/M` - Can be used as a noun
- `/G` - Gerund forms (-ing)
- `/D` - Past tense forms (-ed)
- `/J` - Adjective forms
- `/R` - Comparative forms (-er)
- `/T` - Superlative forms (-est)

#### Validation and Help

```bash
# Validate dictionary alphabetical order
node scripts/add-to-dictionary.js --validate

# Show help and usage information
node scripts/add-to-dictionary.js --help
```

### Features

- **Binary Search**: Efficient O(log n) insertion to maintain alphabetical order
- **Duplicate Detection**: Prevents adding words that already exist
- **Automatic Backups**: Creates timestamped backups before making changes
- **Flag Support**: Full support for Hunspell morphological flags
- **Error Handling**: Comprehensive error checking and user feedback
- **Validation**: Built-in dictionary integrity checking

### Dictionary Location

The script manages the dictionary file at:
```
public/dictionaries/index.dic
```

This file is used by the client-side spell checker (`nspell`) for real-time spell checking without sending data to external servers.

## Future Features

- **Clarity Suggestions**: AI-powered clarity and readability improvements
- **Document Templates**: Generate specific document types (PRDs, HLDs, LLDs)
- **Data Recommendations**: AI suggestions for supporting arguments with data
- **Comment System**: Collaborative commenting similar to Quip
- **Document Descriptions**: AI-generated helpful descriptions for documents
- **Advanced Filtering**: Filter suggestions by type and severity
