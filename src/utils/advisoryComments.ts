import { AdvisoryComment } from '../types';

/**
 * Get all text nodes in an element
 */
const getTextNodesInElement = (element: HTMLElement): Text[] => {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  let node;
  // eslint-disable-next-line no-cond-assign
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text);
  }
  
  return textNodes;
};

/**
 * Find advisory comment at a given position
 */
export const findAdvisoryCommentAtPosition = (
  comments: AdvisoryComment[],
  position: number
): AdvisoryComment | null => {
  const comment = comments.find(
    (c) =>
      !c.dismissed &&
      c.startIndex <= position &&
      c.endIndex >= position
  );

  return comment || null;
};

/**
 * Validate advisory comment indices against document content
 */
export const validateAdvisoryComment = (
  comment: AdvisoryComment,
  documentContent: string
): boolean => {
  // Check if indices are within document bounds
  if (comment.startIndex < 0 || comment.endIndex > documentContent.length) {
    return false;
  }
  
  // Check if start index is before end index
  if (comment.startIndex >= comment.endIndex) {
    return false;
  }
  
  // Check if original text matches document content at the specified position
  const actualText = documentContent.slice(comment.startIndex, comment.endIndex);
  return actualText === comment.originalText;
};

/**
 * Filter valid advisory comments for the current document
 */
export const filterValidAdvisoryComments = (
  comments: AdvisoryComment[],
  documentContent: string
): AdvisoryComment[] => (
  comments.filter(comment => validateAdvisoryComment(comment, documentContent))
);

/**
 * Calculate popover position for advisory comment
 */
export const calculateAdvisoryPopoverPosition = (
  comment: AdvisoryComment,
  editorElement: HTMLElement
): { x: number; y: number } | null => {
  try {
    // Find the text node containing the advisory comment
    const range = document.createRange();
    
    // This is a simplified version - in a real implementation,
    // you'd need to traverse the DOM to find the exact text node
    const textNodes = getTextNodesInElement(editorElement);
    let currentOffset = 0;
    
    for (const textNode of textNodes) {
      const nodeLength = textNode.textContent?.length || 0;
      
      if (currentOffset + nodeLength > comment.startIndex) {
        const startInNode = Math.max(0, comment.startIndex - currentOffset);
        const endInNode = Math.min(nodeLength, comment.endIndex - currentOffset);
        
        range.setStart(textNode, startInNode);
        range.setEnd(textNode, endInNode);
        
        const rect = range.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top
        };
      }
      
      currentOffset += nodeLength;
    }
    
    return null;
  } catch (error) {
    console.error('Error calculating advisory popover position:', error);
    return null;
  }
};

/**
 * Get visible (non-dismissed) advisory comments
 */
export const getVisibleAdvisoryComments = (
  comments: AdvisoryComment[]
): AdvisoryComment[] => (
  comments.filter(comment => !comment.dismissed)
);

export const findTextPositionInDocument = (
  documentContent: string,
  targetText: string
): { startIndex: number; endIndex: number } | null => {
  if (!targetText || targetText.length < 20) {
    return null;
  }

  const cleanTargetText = targetText.trim();
  const startIndex = documentContent.indexOf(cleanTargetText);
  
  if (startIndex === -1) {
    return null;
  }

  const endIndex = startIndex + cleanTargetText.length;
  
  return { startIndex, endIndex };
}; 