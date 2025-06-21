import React, { useEffect, useState } from 'react';

interface Lint {
  message(): string;
}

interface WorkerLinter {
  lint(text: string): Promise<Lint[]>;
}

declare global {
  interface Window {
    HarperWorkerLinter?: new () => WorkerLinter;
  }
}

const HarperPoc: React.FC = () => {
  const [text, setText] = useState('This is an test');
  const [lints, setLints] = useState<Lint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [linter, setLinter] = useState<WorkerLinter | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHarper = async () => {
      try {
        // Load Harper from CDN using script tag
        const script = document.createElement('script');
        script.type = 'module';
        script.innerHTML = `
          import { WorkerLinter } from 'https://unpkg.com/harper.js@0.13.0/dist/harper.js';
          window.HarperWorkerLinter = WorkerLinter;
          window.dispatchEvent(new CustomEvent('harperLoaded'));
        `;
        document.head.appendChild(script);
        
        // Wait for Harper to load
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Harper loading timeout'));
          }, 10000);
          
          window.addEventListener('harperLoaded', () => {
            clearTimeout(timeout);
            resolve();
          }, { once: true });
        });
        
        // Create linter instance
        const WorkerLinter = window.HarperWorkerLinter;
        if (!WorkerLinter) {
          throw new Error('Harper WorkerLinter not found');
        }
        const linterInstance = new WorkerLinter();
        setLinter(linterInstance);
        setIsLoading(false);
        
        // Initial lint of the default text
        const initialLints = await linterInstance.lint(text);
        console.log('initialLints', initialLints);
        setLints(initialLints);
      } catch (err) {
        console.error('Failed to load Harper:', err);
        setError('Failed to load Harper grammar checker');
        setIsLoading(false);
      }
    };

    loadHarper();
  }, [text]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    if (linter) {
      try {
        const newLints = await linter.lint(newText);
        setLints(newLints);
      } catch (err) {
        console.error('Failed to lint text:', err);
      }
    }
  };

  const renderSuggestions = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Loading Harper...</p>
          </div>
        </div>
      );
    }
    
    if (lints.length === 0) {
      return <p className="text-gray-500 text-sm">No grammar issues found!</p>;
    }
    
    return (
      <ul className="space-y-2">
        {lints.map((lint) => {
          const message = lint.message();
          //@ts-ignore
          console.log('span', lint.span());
        //   //@ts-ignore
        //   console.log('span', lint.span());
          //@ts-ignore
        //   console.log('lint_kind_pretty', lint.lint_kind_pretty());
          //@ts-ignore
          console.log('get_problem_text', lint.get_problem_text());
          //@ts-ignore
          console.log('suggestions', lint.suggestions());
          return (
            <li key={`lint-${message}-${Math.random()}`} className="p-2 bg-white rounded border border-gray-200">
              <p className="text-sm text-gray-700">{message}</p>
            </li>
          );
        })}
      </ul>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Harper Grammar Checker POC</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Harper Grammar Checker POC</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <p className="text-gray-600 mb-4">
            This is a simple proof of concept demonstrating Harper.js integration. 
            Harper is a fast, privacy-first grammar checker that runs entirely in your browser.
            Start typing in the text box below to see grammar suggestions in real-time.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
                Text Input
              </label>
              <textarea
                id="text-input"
                value={text}
                onChange={handleInputChange}
                className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Start typing to see grammar suggestions..."
                disabled={isLoading}
                aria-describedby="text-input-description"
              />
              <p id="text-input-description" className="sr-only">
                Enter text to check for grammar issues using Harper
              </p>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2" id="suggestions-label">
                Grammar Suggestions
              </div>
              <div 
                className="h-64 p-3 bg-gray-50 border border-gray-300 rounded-lg overflow-y-auto"
                role="region"
                aria-labelledby="suggestions-label"
              >
                {renderSuggestions()}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">About Harper</h3>
          <p className="text-sm text-blue-700">
            Harper is an open-source, privacy-first grammar checker that runs entirely in your browser. 
            It&apos;s fast, lightweight, and doesn&apos;t send your text to any servers. Perfect for WordWise&apos;s 
            privacy-focused approach to writing assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HarperPoc; 