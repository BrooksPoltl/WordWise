import { Suspense, lazy } from 'react';
import { useSuggestionStore } from '../store/suggestion/suggestion.store';
import { SuggestionToggles } from './editor/SuggestionToggles';

const CodeMirrorEditor = lazy(() => import('./editor/CodeMirrorEditor'));

const EditorV2 = () => {
  const suggestionStore = useSuggestionStore();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="p-4 border-b bg-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold">CodeMirror Editor (V2)</h1>
          <p className="text-sm text-gray-500">
            This page contains the new CodeMirror editor with Harper.js
            integration and AI-powered suggestions.
          </p>
        </div>
      </header>
      
      {/* Suggestion Controls */}
      <div className="p-4 border-b bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-700">Writing Suggestions</h2>
            <SuggestionToggles />
          </div>
        </div>
      </div>

      <main className="flex-grow p-4 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="border rounded-lg overflow-hidden">
              <Suspense fallback={<div>Loading Editor...</div>}>
                <CodeMirrorEditor
                  suggestionStore={suggestionStore}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditorV2; 