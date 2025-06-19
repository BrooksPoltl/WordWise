import retextEnglish from 'retext-english';
import retextEquality from 'retext-equality';
import { unified } from 'unified';
// eslint-disable-next-line import/no-extraneous-dependencies
import { VFile } from 'vfile';
import { ClaritySuggestion } from '../types';

type VFileMessage = VFile['messages'][number];

interface RetextMessageWithPosition extends VFileMessage {
  position: {
    start: { offset: number };
    end: { offset: number };
  };
}

const processor = unified().use(retextEnglish).use(retextEquality);

const hasPosition = (
  message: VFileMessage,
): message is RetextMessageWithPosition => {
  const msg = message as RetextMessageWithPosition;
  return (
    msg.position !== undefined &&
    typeof msg.position.start.offset === 'number' &&
    typeof msg.position.end.offset === 'number'
  );
};

export const analyzeClarity = async (
  text: string,
): Promise<ClaritySuggestion[]> => {
  try {
    const file = await processor.process(text);

    return file.messages.filter(hasPosition).map((msg, index) => {
      const { start, end } = (msg as RetextMessageWithPosition).position;

      return {
        id: `clarity-${start.offset}-${index}`,
        text: text.slice(start.offset, end.offset),
        startOffset: start.offset,
        endOffset: end.offset,
        suggestions: [], // retext-equality doesn't provide suggestions
        type: 'weasel_word',
        explanation: msg.message,
      };
    });
  } catch (error) {
    console.error('Error analyzing clarity:', error);
    return [];
  }
}; 