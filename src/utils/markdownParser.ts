import retextEnglish from 'retext-english';
import { unified } from 'unified';
import { Node } from 'unist';
import { VFile } from 'vfile';

// Define the structure of our parsed nodes if necessary
// For now, we'll rely on the default nodes from retext

/**
 * A simple markdown parser using the unified and retext ecosystem.
 * This is the foundation for our WYSIWYG editor's visual mode.
 *
 * @param text The markdown text to parse.
 * @returns The VFile processed by the pipeline.
 */
export const parseMarkdown = (text: string): VFile => {
  const processor = unified()
    .use(retextEnglish);
    // Add more retext plugins here for syntax highlighting, etc.

  const vfile = new VFile(text);
  const ast = processor.parse(vfile);
  processor.runSync(ast, vfile);

  return vfile;
};

/**
 * Type guard to check if an object is a unist Node.
 * @param data The object to check.
 * @returns True if the object is a Node, false otherwise.
 */
export const isNode = (data: unknown): data is Node => typeof data === 'object' && data !== null && 'type' in data; 