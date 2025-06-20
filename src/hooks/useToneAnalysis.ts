import { useCallback, useRef, useState } from 'react';
import { EDITOR_CONFIG } from '../constants/editorConstants';
import { Tone } from '../types';
import { toneAnalyzer } from '../utils/toneAnalyzer';

export const useToneAnalysis = () => {
  const [detectedTone, setDetectedTone] = useState<Tone | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const toneTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect tone from text
  const detectTone = useCallback(
    (text: string) => {
      if (toneTimeoutRef.current) {
        clearTimeout(toneTimeoutRef.current);
      }

      toneTimeoutRef.current = setTimeout(async () => {
        if (isFetching || !text.trim()) {
          return;
        }

        setIsFetching(true);
        try {
          const tone = await toneAnalyzer.analyzeTone(text);
          setDetectedTone(tone);
        } catch (error) {
          console.error('Tone detection failed:', error);
        } finally {
          setIsFetching(false);
        }
      }, EDITOR_CONFIG.TONE_ANALYSIS_DELAY);
    },
    [isFetching],
  );



  return {
    detectedTone,
    detectTone,
  };
}; 