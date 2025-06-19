import { retext } from 'retext';
import retextEnglish from 'retext-english';
import retextReadability from 'retext-readability';
import { Position } from 'unist';

import { ReadabilitySuggestion } from '../types';
import { logger } from './logger';

// A type that reflects the expected shape of a message from retext-readability
interface ReadabilityVFileMessage {
  reason: string;
  actual: string;
  place?: Position;
}

const processor = retext()
  .use(retextEnglish)
  .use(retextReadability, {
    // Using a more reasonable but still sensitive configuration.
    age: 14,
    minWords: 10,
    threshold: 1 / 7,
  });

export const analyzeReadability = async (
  text: string,
): Promise<ReadabilitySuggestion[]> => {
  try {
    const file = await processor.process(text);

    logger.debug('[ReadabilityAnalyzer] VFile messages:', file.messages);

    const suggestions: ReadabilitySuggestion[] = file.messages
      .map((message): ReadabilitySuggestion | null => {
        const { place, actual, reason } =
          message as unknown as ReadabilityVFileMessage;

        // A message without a position cannot be mapped to an inline suggestion.
        if (
          place?.start?.offset === undefined ||
          place?.end?.offset === undefined
        ) {
          return null;
        }

        return {
          id: `readability-${place.start.offset}`,
          text: String(actual),
          startOffset: place.start.offset,
          endOffset: place.end.offset,
          type: 'readability',
          explanation: reason,
        };
      })
      .filter((s): s is ReadabilitySuggestion => s !== null);

    logger.success('Readability analysis complete.', {
      count: suggestions.length,
    });
    return suggestions;
  } catch (error) {
    logger.error('Error analyzing readability:', error);
    return [];
  }
}; 