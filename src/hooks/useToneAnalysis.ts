import { useCallback, useRef, useState } from 'react';
import { EDITOR_CONFIG } from '../constants/editorConstants';
import { Tone } from '../types';
import { toneAnalyzer } from '../utils/toneAnalyzer';

export const useToneAnalysis = () => {
  const [detectedTone, setDetectedTone] = useState<Tone | null>(null);
  const toneTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);
  const setDetectedToneRef = useRef(setDetectedTone);

  // Keep ref updated with latest setter
  setDetectedToneRef.current = setDetectedTone;

  // Immediate tone analysis (no debounce) for initial loads
  const detectToneImmediate = useCallback(
    async (text: string) => {
      if (isFetchingRef.current || !text.trim()) {
        return;
      }

      isFetchingRef.current = true;
      try {
        const tone = await toneAnalyzer.analyzeTone(text);
        setDetectedToneRef.current(tone);
      } catch (error) {
        console.error('Tone detection failed:', error);
      } finally {
        isFetchingRef.current = false;
      }
    },
    [], // Empty dependency array to keep the function stable
  );

  // Debounced tone analysis for real-time editing
  const detectTone = useCallback(
    (text: string) => {
      if (toneTimeoutRef.current) {
        clearTimeout(toneTimeoutRef.current);
      }

      toneTimeoutRef.current = setTimeout(async () => {
        if (isFetchingRef.current || !text.trim()) {
          return;
        }

        isFetchingRef.current = true;
        try {
          const tone = await toneAnalyzer.analyzeTone(text);
          setDetectedToneRef.current(tone);
        } catch (error) {
          console.error('Tone detection failed:', error);
        } finally {
          isFetchingRef.current = false;
        }
      }, EDITOR_CONFIG.TONE_ANALYSIS_DELAY);
    },
    [], // Empty dependency array to keep the function stable
  );

  return {
    detectedTone,
    detectTone,
    detectToneImmediate,
  };
}; 