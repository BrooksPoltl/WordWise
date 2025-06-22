import { Range } from '@codemirror/state';
import { Decoration } from '@codemirror/view';
import { Heading } from 'mdast';
import { Node } from 'unist';

// Define the decorations for basic formatting.
// These are simple CSS classes that we can target in our stylesheet.
const boldDecoration = Decoration.mark({ class: 'cm-bold' });
const italicDecoration = Decoration.mark({ class: 'cm-italic' });
const header1Decoration = Decoration.mark({ class: 'cm-header-1' });
const header2Decoration = Decoration.mark({ class: 'cm-header-2' });
const header3Decoration = Decoration.mark({ class: 'cm-header-3' });
const blockquoteDecoration = Decoration.line({ class: 'cm-blockquote' });
const codeBlockDecoration = Decoration.mark({ class: 'cm-code-block' });
const listItemDecoration = Decoration.line({ class: 'cm-list-item' });
const linkDecoration = Decoration.mark({ class: 'cm-link' });
// const tableDecoration = Decoration.widget({}); // Removed to fix lint error, table case returns null for now
const tableRowDecoration = Decoration.line({ class: 'cm-table-row' });
const tableCellDecoration = Decoration.mark({ class: 'cm-table-cell' });

// A map to get the correct header decoration based on depth.
const headerDecorations: { [key: number]: Decoration } = {
    1: header1Decoration,
    2: header2Decoration,
    3: header3Decoration,
    // Add more header levels if needed
};

/**
 * Creates a decoration for a given node.
 * @param node - The AST node.
 * @returns A Range<Decoration> or null if no decoration is needed.
 */
export const getDecorationForNode = (node: Node): Range<Decoration> | null => {
    if (!node.position || node.position.start.offset === undefined || node.position.end.offset === undefined) {
        return null;
    }

    const from = node.position.start.offset;
    const to = node.position.end.offset;

    switch (node.type) {
        case 'strong':
            return boldDecoration.range(from, to);
        case 'emphasis':
            return italicDecoration.range(from, to);
        case 'blockquote':
            return blockquoteDecoration.range(from, to);
        case 'code':
            return codeBlockDecoration.range(from, to);
        case 'listItem':
            return listItemDecoration.range(from, to);
        case 'link':
            return linkDecoration.range(from, to);
        case 'table':
            // For tables, we decorate its children (rows)
            // This case might be more about structure if direct decoration is needed
            return null; // Or a minimal decoration if tables themselves need a class
        case 'tableRow':
            return tableRowDecoration.range(from, to);
        case 'tableCell':
            return tableCellDecoration.range(from, to);
        case 'heading': {
            const headingNode = node as Heading;
            const { depth } = headingNode;
            const headerDecoration = headerDecorations[depth];
            if (headerDecoration) {
                return headerDecoration.range(from, to);
            }
            break;
        }
        default:
            return null;
    }
    
    return null;
}; 