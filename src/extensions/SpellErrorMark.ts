import { Mark, mergeAttributes } from '@tiptap/core';

/**
 * A Mark used to underline misspelled words. We attach the suggestion id so we
 * can map clicks inside the editor back to the sidebar entry.
 */
const SpellErrorMark = Mark.create({
  name: 'spellError',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'spell-error',
      },
    };
  },

  addAttributes() {
    return {
      suggestionId: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-suggestion-id'),
        renderHTML: (attributes: { suggestionId: string | null }) => {
          if (!attributes.suggestionId) return {};
          return { 'data-suggestion-id': attributes.suggestionId };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-suggestion-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});

export default SpellErrorMark; 