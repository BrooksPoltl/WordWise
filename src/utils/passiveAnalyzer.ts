import { retext } from 'retext';
import retextEnglish from 'retext-english';
import retextPassive from 'retext-passive';
import { Position } from 'unist';
import { VFile } from 'vfile';

import { PassiveSuggestion } from '../types';
import { logger } from './logger';

interface PassiveVFileMessage {
  reason: string;
  actual: string;
  place?: Position;
}

const processor = retext().use(retextEnglish).use(retextPassive);

const processRetext = async (text: string): Promise<VFile> => {
  return processor.process(text);
};

export const analyzePassive = async (
  text: string,
): Promise<PassiveSuggestion[]> => {
  try {
    const file = await processRetext(text);

    const suggestions: PassiveSuggestion[] = file.messages
      .map((message): PassiveSuggestion | null => {
        const { place, actual, reason } =
          message as unknown as PassiveVFileMessage;

        if (
          place?.start?.offset === undefined ||
          place?.end?.offset === undefined
        ) {
          return null;
        }

        return {
          id: `passive-${place.start.offset}`,
          text: String(actual),
          startOffset: place.start.offset,
          endOffset: place.end.offset,
          type: 'passive',
          explanation: reason,
        };
      })
      .filter((s): s is PassiveSuggestion => s !== null);

    logger.success('Passive analysis complete.', {
      count: suggestions.length,
    });
    return suggestions;
  } catch (error) {
    logger.error('Error analyzing for passive voice:', error);
    return [];
  }
}; 