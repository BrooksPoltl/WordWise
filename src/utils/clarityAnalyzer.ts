import retextEnglish from 'retext-english';
import retextEquality from 'retext-equality';
import { unified } from 'unified';
import { Point, Position } from 'unist';
import { VFile } from 'vfile';
import { VFileMessage } from 'vfile-message';
import { ClaritySuggestion } from '../types';
import { logger } from './logger';
import { weaselWordExplanations } from './weaselWordExplanations';

const processor = unified().use(retextEnglish).use(retextEquality);

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

export const analyzeClarity = async (
  text: string,
): Promise<ClaritySuggestion[]> => {
  try {
    const file = new VFile(text);
    logger.info('Running clarity processor on text...', { text });

    const tree = processor.parse(file);
    await processor.run(tree, file);

    logger.info(
      '[Clarity Analyzer] Raw messages from retext:',
      file.messages,
    );

    const positionedMessages = file.messages.filter(hasOffset);

    logger.info(
      '[Clarity Analyzer] Filtered messages with position:',
      positionedMessages,
    );

    const suggestions = positionedMessages.map((msg): ClaritySuggestion => {
      let startOffset: number;
      let endOffset: number;

      if (isPosition(msg.place)) {
        startOffset = msg.place.start.offset ?? 0;
        endOffset = msg.place.end.offset ?? 0;
      } else {
        startOffset = msg.place.offset ?? 0;
        // If there's no end, we assume it's a single point
        endOffset = startOffset + (msg.actual?.length || 1);
      }

      const explanation =
        weaselWordExplanations[msg.ruleId as string] || msg.message;

      return {
        id: `clarity-${startOffset}-${endOffset}`,
        text: text.slice(startOffset, endOffset),
        word: text.slice(startOffset, endOffset),
        startOffset,
        endOffset,
        suggestions: [{ id: 'remove', text: 'Remove weasel word' }],
        type: 'weasel_word',
        title: 'Clarity',
        explanation: `"${text.slice(startOffset, endOffset)}" is a weasel word. ${explanation}`,
      };
    });

    return suggestions;
  } catch (error) {
    logger.error('Error in analyzeClarity:', error);
    return [];
  }
}; 