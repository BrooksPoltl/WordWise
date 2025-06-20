# Bug: Proper Nouns Are Getting Flagged

- **Priority**: Medium
- **Status**: Not Started

## Description

The spell-checker incorrectly flags proper nouns (e.g., names of people, places, companies) as spelling errors. This happens because the static dictionary used by the application does not, and cannot, contain an exhaustive list of all possible proper nouns.

## Code Analysis

The investigation confirmed that the application uses the `nspell` library with a static set of dictionary files located in `/public/dictionaries/`. There is a developer script, `scripts/add-to-dictionary.js`, for manually adding words to this dictionary, but there is no feature for end-users to manage a personal dictionary or ignore words.

The core of the issue is that the spell-checking logic in `src/hooks/useSuggestions.ts` indiscriminately checks every word against this static dictionary. Since proper nouns are not in the dictionary, they are correctly identified as "unknown" and flagged as errors.

The problem isn't a bug in the spell-checker itself, but a limitation of its design. Without a mechanism to recognize or learn proper nouns, these false positives are inevitable.

## Proposed Solutions

### Solution 1: (Recommended) Use Heuristics to Detect Proper Nouns

- **Description**: Modify the logic in `src/hooks/useSuggestions.ts`. Before a word is sent to the spell-checker, apply a heuristic to determine if it's likely a proper noun. The rule would be: **if a word is capitalized and it is *not* the first word of its sentence, assume it is a proper noun and skip the spell-check.** This requires identifying sentence boundaries, for which we can use the existing `getSentenceBoundaries` utility.
- **Level of Effort**: Medium. The main complexity involves iterating through sentences and words correctly, but the core utility already exists.
- **Tradeoffs**: This is a pragmatic and effective solution that will eliminate the vast majority of false positives on proper nouns. Its main limitation is that it won't detect proper nouns at the beginning of a sentence, but this is an acceptable trade-off to avoid building a full-blown dictionary feature.
- **Why it's likely the fix**: It's a standard, well-established heuristic for improving spell-checkers and directly targets the most common manifestation of this bug.
- **Why it might not be the fix**: It's a heuristic, so it won't be perfect. Some edge cases will be missed, but it will be a major improvement.

### Solution 2: Implement a User Dictionary Feature

- **Description**: Build a complete "personal dictionary" feature. This would involve:
    1.  Adding an "Add to Dictionary" button in the suggestion popover.
    2.  Creating a new collection in Firestore to store dictionary words for each user.
    3.  Modifying the `browserSpellChecker` to load and use words from the user's personal dictionary in addition to the main dictionary.
- **Level of Effort**: High.
- **Tradeoffs**: This is the most comprehensive and "correct" long-term solution, giving users full control. However, it is a significant feature, not a simple bug fix, and is likely more effort than is warranted for this specific issue at this time.
- **Why it might be the fix**: It would permanently solve the problem for any word a user chooses to add.
- **Why it might not be the fix**: Its complexity makes it a poor choice for a quick bug-fixing cycle.

### Solution 3: Ignore All Capitalized Words

- **Description**: Implement a very simple, blunt rule in `useSuggestions.ts`: if a word begins with a capital letter, do not spell-check it.
- **Level of Effort**: Low.
- **Tradeoffs**: This is a poor solution. While it would stop proper nouns from being flagged, it would also disable spell-checking for the first word of every sentence, which is a significant regression in functionality.
- **Why it might be the fix**: It's a quick way to stop the flagging of proper nouns.
- **Why it might not be the fix**: It introduces a new, more severe bug by failing to check many legitimate misspellings.

## Conclusion

**Solution 1** is the best course of action. It's an intelligent, targeted fix that addresses the core of the problem in a pragmatic way. It leverages existing utilities and provides a significant improvement to the user experience without the overhead of building a major new feature. 