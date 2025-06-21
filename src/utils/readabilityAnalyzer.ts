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
    age: 14,
    minWords: 25,
    threshold: 1 / 7,
  });

export const analyzeReadability = async (
  text: string,
): Promise<ReadabilitySuggestion[]> => {
  try {
    const file = await processor.process(text);

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
          id: `readability-${place.start.offset}-${place.end.offset}`,
          text: String(actual),
          word: String(actual),
          startOffset: place.start.offset,
          endOffset: place.end.offset,
          type: 'readability',
          title: 'Readability',
          explanation: `This sentence is difficult to read (${reason.split(' ')[0]} readability score). Consider breaking it into shorter sentences or simplifying the language.`,
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