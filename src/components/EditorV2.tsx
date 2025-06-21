import { Suspense, lazy } from 'react';

const CodeMirrorEditor = lazy(() => import('./editor/CodeMirrorEditor'));

const PLACEHOLDER_CONTENT = `this is a test of the emergancy broadcast system. This is a mispelled word. This is better then that. I go to the gym everyday. Your right, we should test everything. The dog wagged it's tail. Lets go to the park and see the the ducks.

The rain will effect our plans, but despite of the weather, we must continue. It is not save to swim here. My shoes are to loose. I am confidant we will succeed. The team was torn a part by the disagreement. That area is very touristic. He was amongst friends. I will stay here for awhile.

I have a apple. I want to walking. I should of known better. Can you transition this for me? Please check the web site. I will see you anytime. The car of my friend is red. I will ask to him.

I like apples, bananas and oranges. He said, "This is a test". We sell books, CDs, and vinyl records. We also sell books, CDs and vinyl records. There are too many  spaces here. Wait for it.... This is a very good test - a simple one.

I think we should probably proceed with the evaluation. Due to the fact that it was late, we decided to make a decision to go home. This is a very long and rambling sentence that goes on for quite a while without getting to the point, which is really just to demonstrate that the long sentence detector is working as intended and will flag this particular piece of text. If we release this now, we might shoot ourselves in the foot. What the hell is going on?`;

const EditorV2 = () => (
  <div className="flex flex-col h-screen bg-gray-50">
    <header className="p-4 border-b bg-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold">CodeMirror Editor (V2)</h1>
        <p className="text-sm text-gray-500">
          This page contains the new CodeMirror editor with Harper.js
          integration.
        </p>
      </div>
    </header>
    <main className="flex-grow p-4 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-2">Editor</h2>
          <div className="border rounded-lg overflow-hidden">
            <Suspense fallback={<div>Loading Editor...</div>}>
              <CodeMirrorEditor initialContent={PLACEHOLDER_CONTENT} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  </div>
);

export default EditorV2; 