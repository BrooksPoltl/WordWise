// Helper function to get sentence boundaries as start/end positions
export const getSentenceBoundaries = (text: string, startOffset: number, endOffset: number): { start: number; end: number } => {
  const beforeText = text.substring(0, startOffset);
  const afterText = text.substring(endOffset);
  
  // Look for sentence start (beginning of text, or after . ! ? followed by optional whitespace)
  const sentenceStartMatch = beforeText.match(/[.!?]\s*([^.!?]*)$/);
  const sentenceStart = sentenceStartMatch 
    ? startOffset - sentenceStartMatch[1].length 
    : 0;
  
  // Look for sentence end - find the next sentence terminator and include it
  // First, check if there's a sentence terminator in the afterText
  const sentenceEndMatch = afterText.match(/^[^.!?]*[.!?]/);
  let sentenceEnd: number;
  
  if (sentenceEndMatch) {
    // Found a sentence terminator after the passive phrase - include the punctuation
    sentenceEnd = endOffset + sentenceEndMatch[0].length;
  } else {
    // No terminator found in afterText, look for one starting from endOffset in the full text
    const remainingText = text.substring(endOffset);
    const terminatorMatch = remainingText.match(/[.!?]/);
    if (terminatorMatch && terminatorMatch.index !== undefined) {
      sentenceEnd = endOffset + terminatorMatch.index + 1; // +1 to include the punctuation
    } else {
      // No punctuation found, go to end of text
      sentenceEnd = text.length;
    }
  }
  
  return { start: sentenceStart, end: sentenceEnd };
}; 