import { Tone } from '../types';

interface ToneDetectResponse {
  success: boolean;
  tone: Tone;
  confidence?: number;
  error?: string;
}

interface ToneRewriteResponse {
  success: boolean;
  text: string;
  error?: string;
}

class ToneAnalyzerService {
  private readonly debounceMs = 3000;

  private debounceTimer: NodeJS.Timeout | null = null;

  private lastCheckedText = '';

  private cachedTone: Tone | null = null;

  public detectTone(text: string, callback: (tone: Tone | null) => void): void {
    // If text hasn't changed, return cached tone
    if (text === this.lastCheckedText && this.cachedTone) {
      callback(this.cachedTone);
      return;
    }

    // Debounce API calls
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      try {
        const tone = await this.performDetect(text);
        this.lastCheckedText = text;
        this.cachedTone = tone;
        callback(tone);
      } catch (error) {
        console.error('Tone detection failed:', error);
        callback(null);
      }
    }, this.debounceMs);
  }

  public async rewriteText(text: string, tone: Tone): Promise<string> {
    const response = await fetch(`${this.getFunctionsUrl()}/spellCheck`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'toneRewrite', text, tone }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result: ToneRewriteResponse = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'API error');
    }

    return result.text;
  }

  // Private helpers
  private async performDetect(text: string): Promise<Tone | null> {
    // Guard against empty text
    if (!text.trim()) return null;

    const response = await fetch(`${this.getFunctionsUrl()}/spellCheck`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'toneDetect', text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result: ToneDetectResponse = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'API error');
    }

    return result.tone;
  }

  private getFunctionsUrl(): string {
    if (
      typeof window !== 'undefined' &&
      window.location.hostname === 'localhost'
    ) {
      return 'http://localhost:5001/wordwise-34da3/us-central1';
    }
    return 'https://us-central1-wordwise-34da3.cloudfunctions.net';
  }
}

export const toneAnalyzer = new ToneAnalyzerService();
