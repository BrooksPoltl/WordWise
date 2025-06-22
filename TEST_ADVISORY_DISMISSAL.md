# Advisory Comment Management Test - Document-Level Storage

## ✅ Document-Level Dismissed Hashes

### **🎯 Key Improvement: Document-Specific Dismissals**
Comments are now dismissed **per document** rather than globally. This means:
- Dismissing a comment in Document A won't affect Document B
- Each document maintains its own dismissal history
- Better organization and user control

### 1. Hash-Based Permanent Dismissal (Document-Level)
- Each advisory comment is hashed based on its **full sentence** content + category
- Dismissed hashes are stored per document ID: `Record<documentId, Set<hashes>>`
- Users can permanently dismiss comments for specific sentence + category combinations within a document
- Dismissed comments will never appear again for that exact sentence and category **in that specific document**

### 2. Modal View for Comments
- New "View Comments" button appears when advisory comments are available
- Modal shows comments one by one with navigation (Previous/Next)
- Each comment displays:
  - Complete sentence that triggered the comment
  - AI suggestion/explanation
  - Category information
  - Navigation controls
  - Document-specific dismissal options

### 3. Two Dismissal Options (Document-Scoped)
- **Skip This Time**: Hides comment temporarily (will reappear on next analysis in this document)
- **Never Show Again**: Permanently dismisses this sentence + category combination **for this document only**

## Recent Improvements

### 🗂️ Document-Level Storage Architecture
**Problem Solved**: Global dismissals were affecting all documents, which wasn't user-friendly.

**Solution**: Implemented document-scoped dismissed hash storage:

```typescript
// Before: Global dismissals
dismissedHashes: Set<string>

// After: Document-specific dismissals  
dismissedHashesByDocument: Record<string, Set<string>>
```

### 🔧 Technical Changes Made
1. **Store Structure**: Changed from single Set to Record mapping documentId → Set<hashes>
2. **Function Signatures**: All advisory functions now require `documentId` parameter
3. **Persistence**: localStorage stores dismissed hashes per document
4. **Filtering**: Comments filtered based on current document's dismissed hashes only

### 📊 Storage Structure
```json
{
  "advisory-store": {
    "state": {
      "dismissedHashesByDocument": {
        "doc-123": ["a1b2c3", "d4e5f6"],
        "doc-456": ["g7h8i9", "j0k1l2"],
        "doc-789": ["m3n4o5"]
      }
    }
  }
}
```

## Testing Instructions

1. **Create Multiple Documents**: Have at least 2 documents with similar content
2. **Generate Comments**: Type substantial content (50+ characters) and wait 2 seconds for auto-refresh
3. **Verify Document Isolation**: 
   - Dismiss a comment in Document A
   - Switch to Document B with similar content
   - Verify the same comment type still appears in Document B
4. **Test Permanent Dismissal**: Click "Never Show Again" in Document A
5. **Verify Persistence**: 
   - Refresh the page
   - Return to Document A - dismissed comment should not reappear
   - Check Document B - comment should still be available
6. **Cross-Document Verification**: Same sentence + category should be independently dismissible per document

## Implementation Details

### Document-Scoped Hash Function
- Same hash algorithm: `sentence.toLowerCase() + "::" + category`
- Storage per document: `dismissedHashesByDocument[documentId].add(hash)`
- Filtering per document: Only checks current document's dismissed hashes

### Updated Function Signatures
```typescript
// All functions now require documentId
setComments(comments: AdvisoryComment[], documentId: string)
dismissCommentPermanently(comment: AdvisoryComment, documentId: string)
refreshComments(documentContent: string, documentId: string)
useAdvisoryAutoRefresh(content: string, documentId: string, options?)
```

### Persistence Logic
```typescript
partialize: (state) => ({ 
  dismissedHashesByDocument: Object.fromEntries(
    Object.entries(state.dismissedHashesByDocument).map(([docId, hashes]) => [
      docId,
      Array.from(hashes) // Set → Array for JSON
    ])
  )
}),
onRehydrateStorage: () => (state) => {
  // Convert Arrays back to Sets for each document
  const rehydratedHashes = {};
  Object.entries(state.dismissedHashesByDocument).forEach(([docId, hashes]) => {
    rehydratedHashes[docId] = new Set(hashes); // Array → Set
  });
  return { ...state, dismissedHashesByDocument: rehydratedHashes };
}
```

## Test Scenarios

### Scenario 1: Document Isolation
1. **Document A**: Get advisory comment on "This approach is good."
2. **Document A**: Permanently dismiss "Strengthen Claims" suggestion
3. **Document B**: Write same sentence: "This approach is good."
4. **Document B**: Verify "Strengthen Claims" still appears (different document)
5. **Document A**: Verify "Strengthen Claims" doesn't appear (dismissed)

### Scenario 2: Cross-Document Independence
1. **Document A**: Dismiss "Define Terms" for sentence containing "API"
2. **Document B**: Write sentence with "API"
3. **Document B**: Verify "Define Terms" still appears for "API"
4. **Document B**: Dismiss "Strengthen Claims" for different sentence
5. **Document A**: Verify only "Define Terms" is dismissed, "Strengthen Claims" still works

### Scenario 3: Persistence Per Document
1. **Document A**: Dismiss multiple comments permanently
2. **Document B**: Dismiss different comments permanently  
3. **Refresh page**
4. **Document A**: Verify only A's dismissals persist
5. **Document B**: Verify only B's dismissals persist
6. **Create Document C**: Verify no dismissals (clean slate)

## Expected Behavior

✅ **Document Isolation**: Dismissals in one document don't affect others
✅ **Independent History**: Each document maintains its own dismissal record
✅ **Persistent Storage**: Document-specific dismissals survive page refreshes
✅ **Clean New Documents**: New documents start with no dismissals
✅ **Full Sentences**: OpenAI returns complete sentences, not snippets
✅ **Reliable Hashing**: Consistent hash generation from full sentences per document
✅ **Modal Interface**: Clean one-by-one comment review with document context
✅ **Performance**: Fast hash lookups per document, concurrent API requests
✅ **Type Safety**: Full TypeScript compliance with proper validation
✅ **UI Consistency**: Yellow theme matches existing design

### localStorage Structure
```
advisory-store: {
  dismissedHashesByDocument: {
    "doc-abc123": ["hash1", "hash2", "hash3"],
    "doc-def456": ["hash4", "hash5"], 
    "doc-ghi789": ["hash6"]
  }
}
```

Each document ID maps to an array of dismissed comment hashes, providing complete isolation between documents while maintaining persistence across browser sessions. 