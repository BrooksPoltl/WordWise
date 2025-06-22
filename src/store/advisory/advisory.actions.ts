import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config';
import { AdvisoryComment } from '../../types';
import { findTextPositionInDocument } from '../../utils/advisoryComments';
import { logger } from '../../utils/logger';

interface OpenAISuggestion {
  sentence?: string;
  originalText?: string;
  explanation?: string;
  reason?: string;
}

const isValidReason = (reason: string): reason is AdvisoryComment['reason'] => {
  const validReasons: AdvisoryComment['reason'][] = [
    'Strengthen a Claim',
    'Define a Key Term/Acronym',
    'Improve Structural Flow',
    'Add a Clear Call to Action',
    'Acknowledge Alternatives'
  ];
  return validReasons.includes(reason as AdvisoryComment['reason']);
};

export const generateAdvisoryCommentsCall = async (
  documentContent: string
): Promise<AdvisoryComment[]> => {
  try {

    
    const requestAdvisoryComments = httpsCallable(functions, 'requestAdvisoryComments');
    const result = await requestAdvisoryComments({ documentContent });
    
    // The result.data contains the array of advisory suggestions from OpenAI
    const suggestions = result.data as OpenAISuggestion[];
    
    if (!Array.isArray(suggestions)) {
      logger.warning('Invalid response format from advisory comments function');
      return [];
    }

    

    // Process each suggestion and find its position in the document
    const comments: AdvisoryComment[] = [];
    
    for (const suggestion of suggestions) {
      try {
        // OpenAI now returns 'sentence' field, map it to 'originalText'
        const sentence = suggestion.sentence || suggestion.originalText || '';
        
        if (!sentence || !suggestion.explanation || !suggestion.reason || !isValidReason(suggestion.reason)) {
          logger.warning('Skipping invalid suggestion:', suggestion);
          // Skip this iteration instead of using continue
        } else {
          // Find the position of this sentence in the document
          const position = findTextPositionInDocument(documentContent, sentence);
          
          if (!position || position.startIndex === -1) {
            logger.warning(`Could not find sentence in document: "${sentence.substring(0, 50)}..."`);
            // Skip this iteration instead of using continue
          } else {
            const comment: AdvisoryComment = {
              id: `advisory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'anchored',
              originalText: sentence, // Map sentence to originalText
              explanation: suggestion.explanation,
              startIndex: position.startIndex,
              endIndex: position.endIndex,
              reason: suggestion.reason, // Now properly typed
              dismissed: false,
            };

            comments.push(comment);
    
          }
        }
      } catch (error) {
        logger.error('Error processing individual suggestion:', error, suggestion);
        // Skip this suggestion and continue with others
      }
    }

    
    return comments;
  } catch (error) {
    logger.error('Failed to generate advisory comments:', error);
    throw new Error('Failed to generate advisory comments');
  }
}; 