# Bug: Readability Algorithm Needs to be Reset

- **Priority**: Low
- **Status**: Not Started

## Description

A configuration value in the readability analysis algorithm was changed for testing purposes and needs to be reverted to its original production value. The bug report specifies the value should be "5".

## Code Analysis

The investigation led to the `retext-readability` configuration within `src/utils/readabilityAnalyzer.ts`.

```typescript
// src/utils/readabilityAnalyzer.ts

const processor = retext()
  .use(retextEnglish)
  .use(retextReadability, {
    age: 14,
    minWords: 25,      // Likely candidate for the change
    threshold: 1 / 7,  // Invalid candidate for the value "5"
  });
```

The configuration object for `retextReadability` has two relevant parameters: `minWords` and `threshold`.

-   **`minWords`**: This is the minimum number of words a sentence must have to be checked for readability. It is currently set to `25`, a high value likely used to reduce the number of suggestions during testing. The value `5` is a valid and sensible production value for this parameter.
-   **`threshold`**: This is a value between 0 and 1 that determines the tolerance for readability deviation. The value `5` is invalid for this parameter, as it is outside the allowed range.

The bug report is slightly ambiguous, but given that `5` is a valid value for `minWords` and an invalid one for `threshold`, it is highly probable that the intent was to change `minWords`. Changing `minWords` from 25 to 5 would make the readability check more sensitive, which aligns with reverting a setting that was relaxed for testing.

## Proposed Solutions

### Solution 1: (Recommended) Change `minWords` to 5

- **Description**: In `src/utils/readabilityAnalyzer.ts`, update the `retextReadability` configuration by changing the `minWords` property from `25` to `5`.
- **Level of Effort**: Low.
- **Tradeoffs**: This will cause the readability analysis to run on much shorter sentences, likely increasing the number of suggestions. This is assumed to be the desired production behavior.
- **Why it's likely the fix**: This is the most logical interpretation of the bug report. The number `5` is valid for `minWords`, and changing it back from `25` represents a clear reversion from a less-strict testing value to a more-strict production value.
- **Why it might not be the fix**: If the author of the bug report mistakenly meant to refer to the `threshold` and had a misunderstanding of its valid range, this change would not match their (incorrect) intent. However, this solution is the only one that is both technically valid and logically consistent with the report.

### Solution 2: Guess a New `threshold`

- **Description**: Assume the bug report was mistaken about the value but correct about the parameter, and change the `threshold` to a stricter value than `1/7`, such as `3/7`.
- **Level of Effort**: Low.
- **Tradeoffs**: This is a pure guess. It ignores the explicit number provided in the bug report and is unlikely to be what the author intended.
- **Why it might be the fix**: It would make the readability check stricter.
- **Why it might not be the fix**: It is not based on the available data and is likely incorrect.

### Solution 3: Ask for Clarification

- **Description**: Pause the fix and ask the author of the bug report to clarify whether they meant `minWords` or `threshold`.
- **Level of Effort**: Low.
- **Tradeoffs**: This would ensure correctness but would delay the fix. Given the high probability that Solution 1 is correct, and the low cost of reverting it if wrong, it's more efficient to proceed with the logical choice.
- **Why it might be the fix**: It avoids any chance of an incorrect change.
- **Why it might not be the fix**: It's a passive approach that delays resolution.

## Conclusion

**Solution 1** is the most professional and logical path forward. It interprets the available, albeit slightly ambiguous, data in the most reasonable way and results in a technically valid and sensible change that aligns with the likely intent of the bug report. 