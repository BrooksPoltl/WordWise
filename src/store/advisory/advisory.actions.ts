import { AdvisoryComment } from '../../types';
import { logger } from '../../utils/logger';

// Interface for Firebase function response
interface AdvisoryCommentsResponse {
  originalText: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
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
    
    // Transform API response to AdvisoryComment format
    const comments: AdvisoryComment[] = data.map((comment: AdvisoryCommentsResponse, index: number) => ({
      id: `advisory-${Date.now()}-${index}`,
      type: 'anchored' as const,
      originalText: comment.originalText || '',
      explanation: comment.explanation || '',
      startIndex: typeof comment.startIndex === 'number' ? comment.startIndex : 0,
      endIndex: typeof comment.endIndex === 'number' ? comment.endIndex : 0,
      reason: isValidReason(comment.reason) ? comment.reason : 'Strengthen a Claim',
      dismissed: false,
    }));
    
    return comments;
  } catch (error) {
    logger.error('Error generating advisory comments:', error);
    throw error;
  }
}; 