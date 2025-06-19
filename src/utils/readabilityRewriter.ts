import { httpsCallable } from 'firebase/functions';
import { functions } from '../config';
import { logger } from './logger';

interface ReadabilityRewriteResponse {
  success: boolean;
  text: string;
  error?: string;
}

const rewriteSentence = async (text: string): Promise<string> => {
  logger.info('Calling readabilityRewrite function...');
  if (!text.trim()) {
    logger.warning('Sentence is empty, cannot rewrite.');
    return '';
  }

  try {
    const rewriteSentenceCallable = httpsCallable<
      { text: string },
      ReadabilityRewriteResponse
    >(functions, 'readabilityRewrite');

    const result = await rewriteSentenceCallable({ text });
    const { success, text: rewrittenText, error } = result.data;

    if (!success) {
      throw new Error(error || 'API error during readability rewrite');
    }

    logger.info('Sentence rewritten successfully.');
    return rewrittenText;
  } catch (error) {
    logger.error('Error calling readabilityRewrite callable:', error);
    throw error;
  }
};

export const readabilityRewriter = {
  rewriteSentence,
}; 