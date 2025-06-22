import remarkParse from 'remark-parse';
import remarkRetext from 'remark-retext';
import retextEnglish from 'retext-english';
import { unified } from 'unified';
import { Node } from 'unist';

// Define the processor pipeline
const markdownProcessor = unified()
  .use(remarkParse)
  .use(
    remarkRetext,
    unified().use(retextEnglish),
  );

/**
 * Parses a markdown string and returns a unist Node (the AST).
 * The AST will be compatible with retext.
 * @param markdown - The markdown string to parse.
 * @returns The root unist Node of the parsed AST.
 */
export const parseMarkdown = (markdown: string): Node => {
  const ast = markdownProcessor.parse(markdown);
  return ast;
};

/**
 * A type guard to check if a node is a valid unist Node.
 * @param node - The node to check.
 * @returns True if the node is a valid unist Node.
 */
export const isNode = (node: unknown): node is Node =>
    typeof node === 'object' && node !== null && 'type' in node; 