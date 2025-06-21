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

const processRetext = async (text: string): Promise<VFile> =>
  processor.process(text);

// Helper function to extract sentence containing the passive voice
const extractSentenceContainingOffset = (text: string, startOffset: number, endOffset: number): string => {
  // Find sentence boundaries around the passive voice phrase
  const beforeText = text.substring(0, startOffset);
  const afterText = text.substring(endOffset);
  
  // Look for sentence start (beginning of text, or after . ! ?)
  const sentenceStartMatch = beforeText.match(/[.!?]\s*([^.!?]*)$/);
  const sentenceStart = sentenceStartMatch 
    ? startOffset - sentenceStartMatch[1].length 
    : 0;
  
  // Look for sentence end (. ! ? or end of text)
  const sentenceEndMatch = afterText.match(/^[^.!?]*[.!?]/);
  const sentenceEnd = sentenceEndMatch 
    ? endOffset + sentenceEndMatch[0].length 
    : text.length;
  
  return text.substring(sentenceStart, sentenceEnd).trim();
};

export const analyzePassive = async (
  text: string,
): Promise<PassiveSuggestion[]> => {
  try {
    const file = await processRetext(text);

    const suggestions: PassiveSuggestion[] = file.messages
      .map((message): PassiveSuggestion | null => {
        const { place, reason } =
          message as unknown as PassiveVFileMessage;

        if (
          place?.start?.offset === undefined ||
          place?.end?.offset === undefined
        ) {
          return null;
        }

        // Extract the full sentence containing the passive voice
        const fullSentence = extractSentenceContainingOffset(
          text, 
          place.start.offset, 
          place.end.offset
        );

        return {
          id: `passive-${place.start.offset}`,
          text: fullSentence, // Send full sentence instead of just the passive phrase
          word: text.substring(place.start.offset, place.end.offset), // The actual passive phrase
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