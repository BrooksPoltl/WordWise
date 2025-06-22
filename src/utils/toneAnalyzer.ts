import { httpsCallable } from 'firebase/functions';
import { functions } from '../config';
import { Tone } from '../types';
import { logger } from './logger';

interface ToneDetectResponse {
  success: boolean;
  tone: Tone | null;
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


      return tone;
    } catch (error) {
      logger.error('Error calling toneDetect callable:', error);
      throw error;
    }
  }


}

export const toneAnalyzer = new ToneAnalyzerService();
