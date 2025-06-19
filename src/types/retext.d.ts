// This file uses module augmentation to extend the base types from the 'nlcst'
// module. This allows us to add properties that are dynamically added by
// retext plugins, providing type safety throughout our app.

import 'nlcst';

declare module 'nlcst' {
  // We are augmenting the Data interface from nlcst to include the optional
  // 'readability' property that is added by the retext-readability plugin.
  // This is an object containing various readability scores.
  interface Data {
    readability?: Record<string, unknown>;
  }
} 