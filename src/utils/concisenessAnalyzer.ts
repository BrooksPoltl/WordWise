import retextEnglish from 'retext-english';
import retextSimplify from 'retext-simplify';
import { unified } from 'unified';
import { Point, Position } from 'unist';
import { VFile } from 'vfile';
import { VFileMessage } from 'vfile-message';
import { ConcisenessSuggestion, SuggestionOption } from '../types';
import { logger } from './logger';

const processor = unified().use(retextEnglish).use(retextSimplify);

const isPosition = (place: Point | Position): place is Position =>
  'start' in place && 'end' in place;

const hasOffset = (
  message: VFileMessage,
): message is VFileMessage & { place: Position | (Point & { offset: number }) } => {
  if (!message.place) return false;
  if (isPosition(message.place)) {
    return (
      message.place.start.offset !== undefined &&
      message.place.end.offset !== undefined
    );
  }
  return (message.place as Point & { offset: number }).offset !== undefined;
};

export const analyzeConciseness = async (
  text: string,
): Promise<ConcisenessSuggestion[]> => {
  try {
    const file = new VFile(text);
    logger.info('Running conciseness processor on text...', { text });

    const tree = processor.parse(file);
    await processor.run(tree, file);

    const positionedMessages = file.messages.filter(hasOffset);

    const suggestions = positionedMessages.map(
      (msg, index): ConcisenessSuggestion => {
        let startOffset: number;
        let endOffset: number;

        if (isPosition(msg.place)) {
          startOffset = msg.place.start.offset ?? 0;
          endOffset = msg.place.end.offset ?? 0;
        } else {
          startOffset = msg.place.offset ?? 0;
          endOffset = startOffset + (msg.actual?.length || 1);
        }

        const suggestionOptions: SuggestionOption[] = msg.expected
          ? msg.expected.map((s, i) => ({
              id: `concise-${startOffset}-${index}-${i}`,
              text: s,
            }))
          : [];

        return {
          id: `concise-${startOffset}-${index}`,
          text: text.slice(startOffset, endOffset),
          word: text.slice(startOffset, endOffset),
          startOffset,
          endOffset,
          suggestions: suggestionOptions,
          type: 'conciseness',
          explanation: msg.message,
        };
      },
    );

    return suggestions;
  } catch (error) {
    logger.error('Error in analyzeConciseness:', error);
    return [];
  }
}; 