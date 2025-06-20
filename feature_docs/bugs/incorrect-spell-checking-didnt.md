# Bug: Incorrect Spell-checking for "didn't"

- **Priority**: Important
- **Status**: Not Started

## Description

The spell-checker incorrectly flags common English contractions, such as "didn't," as spelling errors. This indicates a problem with how the application tokenizes text and/or with the dictionary it uses for spell-checking.

## Code Analysis

The investigation pinpointed the issue to the `useSuggestions.ts` hook and the `nspell` configuration.

1.  **Flawed Word Tokenization**: In `src/hooks/useSuggestions.ts`, the text is split into words using a regular expression that does not account for apostrophes in contractions.

    ```typescript
    // src/hooks/useSuggestions.ts
    const words = text.match(/\b\w+\b/g) || [];
    ```

    The `\w` character class is equivalent to `[A-Za-z0-9_]`, so it does not include the apostrophe (`'`). As a result, a word like "didn't" is incorrectly split into two tokens, "didn" and "t". Both are then checked individually and flagged as errors.

2.  **Underlying Spell-Checker**: The application uses `nspell`, a JavaScript implementation of the Hunspell spell-checker, as seen in `src/utils/browserSpellChecker.ts`. This library is robust, but its accuracy depends entirely on the dictionary files (`.aff`, `.dic`) it is provided. Even if the tokenizer is fixed, the dictionary itself may not contain common contractions, which would still result in them being flagged as errors.

The primary root cause is the incorrect tokenization regex.

## Proposed Solutions

### Solution 1: (Recommended) Fix Tokenizer and Update Dictionary

- **Description**: First, update the regular expression in `useSuggestions.ts` to correctly handle apostrophes within words. The regex should be changed to `/\b[\w']+\b/g`. This will ensure contractions like "didn't" are treated as a single token. Second, since the dictionary files located at `/public/dictionaries/` likely lack contractions, we will need to add a comprehensive list of English contractions to the `.dic` file to prevent them from being flagged.
- **Level of Effort**: Medium. The code change is simple, but updating the dictionary will require sourcing a list of contractions and adding them to the file.
- **Tradeoffs**: This is a comprehensive solution that fixes both the immediate tokenization bug and the likely underlying dictionary deficiency. It improves the spell-checker correctly at its source.
- **Why it's likely the fix**: It directly addresses the two-part problem and is the standard way to improve an `nspell`/Hunspell-based system.
- **Why it might not be the fix**: It's highly likely to be the correct fix.

### Solution 2: Pre-process Contractions

- **Description**: Before sending the text to the spell-checker, implement a pre-processing step that expands contractions into their full form (e.g., "didn't" becomes "did not").
- **Level of Effort**: Medium.
- **Tradeoffs**: This avoids modifying the tokenizer or dictionary but adds a layer of complexity. It also subtly changes the user's text for analysis, which could have unintended side effects. It's a workaround that doesn't fix the core tokenization issue for other words with apostrophes (e.g., possessives).
- **Why it might be the fix**: It would prevent contractions from being flagged as errors.
- **Why it might not be the fix**: It's not a root cause fix and could introduce other issues.

### Solution 3: Replace the Spell-checking Library

- **Description**: Replace the `nspell` library with a more modern, all-in-one spell-checking library that comes with a better default English dictionary and tokenizer.
- **Level of Effort**: High.
- **Tradeoffs**: This would be a major dependency change requiring significant integration effort and testing. While it might solve the problem, it's likely overkill.
- **Why it might be the fix**: A better library would likely handle contractions correctly out of the box.
- **Why it might not be the fix**: The high effort and risk associated with changing a core dependency make this a last resort.

## Conclusion

**Solution 1** is the clear and correct path forward. It addresses the bug at its root by fixing the tokenizer and improving the dictionary. This is the most professional and maintainable way to solve the problem. 