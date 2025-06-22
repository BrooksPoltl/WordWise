import { AdvisoryComment } from '../../types';
import { logger } from '../../utils/logger';

// Interface for Firebase function response
interface AdvisoryCommentsResponse {
  originalText: string;
  explanation: string;
  reason: string;
}

// Type guard for valid reasons
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

// Firebase function call to generate advisory comments
export const generateAdvisoryCommentsCall = async (documentContent: string): Promise<AdvisoryComment[]> => {
  try {
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    const functions = getFunctions();
    const requestAdvisoryComments = httpsCallable(functions, 'requestAdvisoryComments');
    
    const result = await requestAdvisoryComments({ documentContent });
    const data = result.data as AdvisoryCommentsResponse[];

    if (!Array.isArray(data)) {
      logger.warning('Invalid advisory comments response format:', data);
      return [];
    }

    // Transform API response to AdvisoryComment format with validation
    const validComments: AdvisoryComment[] = [];
    
    data.forEach((comment, index) => {
      // Find the text position in the document content
      const startIndex = documentContent.indexOf(comment.originalText);
      const endIndex = startIndex !== -1 ? startIndex + comment.originalText.length : 0;
      
      // Validate that we found the text
      if (startIndex === -1) {
        logger.warning(`Could not find text in document for comment ${index}:`, {
          searchText: comment.originalText?.substring(0, 50),
          reason: comment.reason
        });
        return;
      }
      
      // Double-check the match
      const actualText = documentContent.slice(startIndex, endIndex);
      const matches = actualText === comment.originalText;
      
      if (!matches) {
        logger.warning(`Text extraction mismatch for comment ${index}:`, {
          expected: comment.originalText?.substring(0, 50),
          actual: actualText?.substring(0, 50),
          reason: comment.reason
        });
        return;
      }
      
      validComments.push({
        id: `advisory-${Date.now()}-${index}`,
        type: 'anchored' as const,
        originalText: comment.originalText || '',
        explanation: comment.explanation || '',
        startIndex,
        endIndex,
        reason: isValidReason(comment.reason) ? comment.reason : 'Strengthen a Claim',
        dismissed: false,
      });
    });

    logger.info(`Generated ${validComments.length} advisory comments from ${data.length} API responses`);
    return validComments;
  } catch (error) {
    logger.error('Error generating advisory comments:', error);
    throw error;
  }
}; 