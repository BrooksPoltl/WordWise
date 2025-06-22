# Advisory Comment Management Test

## New Features Implemented

### 1. Hash-Based Permanent Dismissal
- Each advisory comment is now hashed based on its **full sentence** content + category
- OpenAI returns complete sentences instead of text snippets for reliable matching
- Users can permanently dismiss comments for specific sentence + category combinations
- Dismissed comments will never appear again for that exact sentence and category

### 2. Modal View for Comments
- New "View Comments" button appears when advisory comments are available
- Modal shows comments one by one with navigation (Previous/Next)
- Each comment displays:
  - Complete sentence that triggered the comment
  - AI suggestion/explanation
  - Category information
  - Navigation controls
  - Dismissal options

### 3. Two Dismissal Options
- **Skip This Time**: Hides comment temporarily (will reappear on next analysis)
- **Never Show Again**: Permanently dismisses this sentence + category combination

## Recent Improvements

### 🎯 Sentence-Based Matching
**Problem Solved**: OpenAI was returning inconsistent text snippets, making hash-based dismissal unreliable.

**Solution**: Updated OpenAI prompts to return complete sentences from the document:
- Backend now requests full sentences instead of text snippets
- Frontend maps `sentence` field to `originalText` for consistency
- Hash function works with complete sentences for reliable matching
- Position finding uses exact sentence matching in document content

### 🔧 Technical Changes Made
1. **OpenAI Prompts**: All 5 category prompts now ask for complete sentences
2. **Response Mapping**: Backend maps `sentence` → `originalText` in advisory actions
3. **Type Safety**: Added proper TypeScript interfaces and validation
4. **Hash Reliability**: Full sentences provide consistent hash generation

## Testing Instructions

1. **Generate Comments**: Type substantial content (50+ characters) and wait 2 seconds for auto-refresh
2. **Verify Sentences**: Check that advisory comments highlight complete sentences, not fragments
3. **View Inline**: Click on yellow highlighted text to see popover with full sentence context
4. **View in Modal**: Click "View Comments" button in header to see modal interface
5. **Test Navigation**: Use Previous/Next buttons to navigate through comments
6. **Test Temporary Dismissal**: Click "Skip This Time" - comment disappears but may return
7. **Test Permanent Dismissal**: Click "Never Show Again" - comment permanently removed
8. **Verify Persistence**: Edit the same sentence again - permanently dismissed comments should not reappear

## Implementation Details

### Sentence-Based Hash Function
- Combines normalized `sentence.toLowerCase() + "::" + category`
- Uses multiplication-based hash (no bitwise operators for linting compliance)
- Returns base-36 string for compact storage
- Full sentences provide consistent, reliable hashing

### OpenAI Integration
- 5 concurrent requests (one per advisory category)
- Each prompt specifically asks for complete sentences
- Response validation ensures sentences exist in document
- Graceful fallback for malformed responses

### Store Updates
- Added `dismissedHashes` Set to advisory state
- New `dismissCommentPermanently` action with sentence-based hashing
- Automatic filtering of dismissed comments on `setComments`
- Type-safe handling of OpenAI response format

### UI Components
- Enhanced `AdvisoryModal` with navigation and dismissal options
- Updated `EditorHeader` with comment count badge and modal trigger
- Maintained consistent yellow theme throughout
- Full sentence display in modal for better context

## Test Scenarios

### Scenario 1: Sentence-Based Dismissal
1. Get advisory comments on sentence: "This approach is good for our use case."
2. Permanently dismiss "Strengthen Claims" suggestion
3. Edit to: "This approach is really good for our use case."
4. Verify "Strengthen Claims" doesn't appear (same core sentence)

### Scenario 2: Category-Specific Dismissal
1. Get comments on: "We should consider this technical approach carefully."
2. Dismiss "Define Terms" for the sentence containing "technical approach"
3. Write new sentence: "The technical approach requires more analysis."
4. Verify "Define Terms" still appears (different sentence)
5. Verify other categories still work for original sentence

### Scenario 3: Full Sentence Context
1. Generate advisory comments on a paragraph
2. Verify each comment shows a complete, grammatically correct sentence
3. Check that sentences can be found exactly in the document
4. Confirm no partial phrases or fragments are highlighted

## Expected Behavior

✅ **Full Sentences**: OpenAI returns complete sentences, not snippets
✅ **Reliable Hashing**: Consistent hash generation from full sentences
✅ **Exact Matching**: Sentences found precisely in document content
✅ **Modal Interface**: Clean one-by-one comment review with full context
✅ **Permanent Dismissal**: Hash-based filtering prevents re-showing dismissed sentences
✅ **Temporary Dismissal**: Comments hidden until next analysis
✅ **Navigation**: Smooth previous/next with auto-advance on dismissal
✅ **Performance**: Fast hash lookups, concurrent API requests
✅ **Type Safety**: Full TypeScript compliance with proper validation
✅ **UI Consistency**: Yellow theme matches existing design 