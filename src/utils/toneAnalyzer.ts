import { httpsCallable } from 'firebase/functions';
import { functions } from '../config';
import { Tone } from '../types';
import { logger } from './logger';

interface ToneDetectResponse {
  success: boolean;
  tone: Tone | null;
  error?: string;
}

interface ToneRewriteResponse {
  success: boolean;
  text: string;
  error?: string;
}

/**
 * A service for performing tone analysis and rewriting using the Firebase backend.
 */
class ToneAnalyzerService {
  /**
   * Analyzes the tone of a given block of text.
   * @param text - The text to analyze.
   * @returns A promise that resolves to the detected tone.
   */
  public async analyzeTone(text: string): Promise<Tone | null> {
    logger.info('Calling toneDetect function...');
    if (!text.trim()) {
      logger.warning('Text is empty, returning null tone.');
      return null;
    }

    try {
      const detectToneCallable = httpsCallable<
        { text: string },
        ToneDetectResponse
      >(functions, 'toneDetect');

      const result = await detectToneCallable({ text });
      const { success, tone, error } = result.data;

      if (!success) {
        throw new Error(error || 'API error during tone detection');
      }

      logger.info('Tone detected successfully.', { tone });
      return tone;
    } catch (error) {
      logger.error('Error calling toneDetect callable:', error);
      throw error;
    }
  }

  /**
   * Rewrites a block of text to match a specified tone.
   * @param text - The text to rewrite.
   * @param tone - The target tone.
   * @returns A promise that resolves to the rewritten text.
   */
  public async rewriteTone(text: string, tone: Tone): Promise<string> {
    logger.info('Calling toneRewrite function with tone:', { tone });
    try {
      const rewriteTextCallable = httpsCallable<
        { text: string; tone: Tone },
        ToneRewriteResponse
      >(functions, 'toneRewrite');

      const result = await rewriteTextCallable({ text, tone });
      const { success, text: rewrittenText, error } = result.data;

      if (!success) {
        throw new Error(error || 'API error during tone rewrite');
      }

      logger.info('Text rewritten successfully.');
      return rewrittenText;
    } catch (error) {
      logger.error('Error calling toneRewrite callable:', error);
      throw error;
    }
  }
}

export const toneAnalyzer = new ToneAnalyzerService();
