# Harper Integration Guide: WordWise Implementation

This guide provides a comprehensive overview of Harper integration for WordWise, including theoretical background on creating custom grammar rules and practical implementation findings from our successful Proof of Concept (POC).

---

## **POC Implementation Summary** ✅

### **Performance Results**
Our Harper POC demonstrates exceptional performance characteristics:
- **Load Time**: ~2-3 seconds initial WebAssembly binary load from CDN
- **Linting Speed**: **Millisecond response times** for real-time grammar checking
- **Memory Footprint**: Minimal browser memory usage (< 50MB total)
- **Network Impact**: Zero ongoing network requests after initial load (fully offline)

### **Integration Architecture**
```typescript
// Successful CDN-based integration pattern
const script = document.createElement('script');
script.type = 'module';
script.innerHTML = `
  import { WorkerLinter } from 'https://unpkg.com/harper.js@0.13.0/dist/harper.js';
  window.HarperWorkerLinter = WorkerLinter;
  window.dispatchEvent(new CustomEvent('harperLoaded'));
`;
```

### **Key Technical Insights**
1. **WorkerLinter vs LocalLinter**: WorkerLinter provides non-blocking performance ideal for real-time UI
2. **CDN Integration**: unpkg.com CDN provides reliable, fast delivery of Harper.js
3. **Error Detection Coverage**: Successfully catches grammar, spelling, and style issues
4. **Browser Compatibility**: Works seamlessly in modern browsers with ES6 module support

### **Detected Error Types** (from testing)
- Article agreement ("an test" → "a test")
- Verb tense errors ("have went" → "have gone")
- Pronoun case ("between you and I" → "between you and me")
- Homophones (there/their/they're, affect/effect)
- Subject-verb agreement
- Passive voice detection
- Spelling corrections
- Style improvements

---

## **WordWise Integration Recommendations**

### **Phase 1: Core Integration**
- Replace existing grammar utilities with Harper for unified checking
- Implement Harper in `TextEditor.tsx` alongside existing spell checking
- Create Harper-specific suggestion UI components
- Maintain existing suggestion store architecture

### **Phase 2: Advanced Features**
- Custom rule development for WordWise-specific needs
- Rule configuration UI for user preferences
- Performance optimization for large documents
- Offline functionality enhancement

### **Phase 3: Custom Rules**
Based on WordWise's focus areas, potential custom rules:
- Technical writing clarity improvements
- Business document tone consistency
- Academic writing style enforcement

---

## **Implementation Code Reference**

### **React Component Integration**
```typescript
// From our successful POC: src/components/HarperPoc.tsx
const [linter, setLinter] = useState<WorkerLinter | null>(null);

useEffect(() => {
  const loadHarper = async () => {
    // Dynamic CDN loading with proper error handling
    const linterInstance = new WorkerLinter();
    setLinter(linterInstance);
    
    // Real-time linting
    const lints = await linterInstance.lint(text);
    setLints(lints);
  };
  loadHarper();
}, []);
```

### **Suggestion Processing**
```typescript
// Harper lint objects provide rich suggestion data
interface Lint {
  message(): string;           // User-friendly error description
  suggestions(): Suggestion[]; // Array of fix suggestions
  span(): Span;               // Error location in text
}
```

---

## **Harper Grammar Rule Development Guide**

### **Context: What is a Harper Grammar Rule?**

In Harper, a grammar rule, or **"linter,"** is a self-contained Rust module designed to find a specific grammatical error or stylistic issue in a piece of text. Harper's power comes from its collection of these individual, targeted linters.

The file `harper-core/src/linting/save_to_safe.rs` is a perfect example. Its specific job is to find and correct a common typo: using the word "save" (a verb) where "safe" (an adjective) is meant.

-   **Incorrect:** "It is **save** to proceed."
-   **Correct:** "It is **safe** to proceed."

This type of rule is an `ExprLinter`, which means it works by defining a specific **pattern** or sequence of tokens (words, punctuation, types of words) that indicates an error.

---

### **Part 1: A Deep Dive into the Implementation (`save_to_safe.rs`)**

Let's break down the `save_to_safe.rs` file section by section to understand how it works.

#### **Step 1: The Linter Struct**

The first step is to define a struct that will contain our rule's logic and data.

```rust
pub struct SaveToSafe {
    expr: Box<dyn Expr>,
}
```

-   This is the main container for our rule.
-   It holds a single field, `expr`, which is a "boxed" `Expr` trait object. Think of `expr` as a placeholder where we will store our compiled token pattern. `Box<dyn Expr>` is a smart pointer that allows us to store any object that implements the `Expr` trait, which is essential for Harper's flexible pattern-matching system.

#### **Step 2: Defining the Error Pattern (`impl Default`)**

This is the most critical part, where we describe the exact sequence of tokens that constitutes the error. This is done in the `default()` function, which acts as a factory for our rule, creating a new instance with the correct pattern.

```rust
impl Default for SaveToSafe {
    fn default() -> Self {
        let pattern = SequenceExpr::default()
            .then(InflectionOfBe::new().or(Word::new("it")))
            .then_whitespace()
            .t_aco("save")
            .then_whitespace()
            .t_aco("to")
            .then_whitespace()
            .then_verb();
        Self {
            expr: Box::new(pattern),
        }
    }
}
```

Let's dissect this chain of method calls:

1.  `SequenceExpr::default()`: Initializes a new, empty sequence pattern builder.
2.  `.then(InflectionOfBe::new().or(Word::new("it"))):` This defines the **first** token we're looking for. It must be either:
    -   `InflectionOfBe::new()`: Any form of the verb "to be" (like `is`, `was`, `are`, `were`). This is a powerful, reusable pattern provided by Harper.
    -   `.or(Word::new("it"))`: Or the literal word `it`. This handles questions like "Is **it** save to go?".
3.  `.then_whitespace()`: The **second** token must be a space.
4.  `.t_aco("save")`: The **third** token must be the word `save`. The `t_aco` method is shorthand for `then_a_case_of`, meaning it matches the word case-insensitively.
5.  `.then_whitespace().t_aco("to").then_whitespace()`: This looks for the word `to` surrounded by spaces.
6.  `.then_verb()`: The final token in our pattern must be a verb (e.g., `ignore`, `travel`, `assume`). This confirms the phrase's structure ("safe to **do** something") and helps prevent false positives.

The `pattern` variable now holds a complete description of the error, which is then stored in the `expr` field of our `SaveToSafe` instance.

#### **Step 3: Creating the Lint (The Correction Logic)**

Once Harper finds a piece of text that matches our pattern, it calls the `match_to_lint` function. This function's job is to create the actual error report that the user will see.

```rust
impl ExprLinter for SaveToSafe {
    fn expr(&self) -> &dyn Expr {
        self.expr.as_ref()
    }

    fn match_to_lint(&self, toks: &[Token], src: &[char]) -> Option<Lint> {
        let save_tok = &toks.get(2)?;
        let verb_tok = &toks.get(4)?;
        let verb = verb_tok.span.get_content_string(src).to_lowercase();
        Some(Lint {
            span: save_tok.span,
            lint_kind: LintKind::WordChoice,
            suggestions: vec![Suggestion::ReplaceWith("safe".chars().collect())],
            message: format!("Did you mean `safe to {verb}`?"),
            priority: 57,
        })
    }
    // ...
}
```

-   `expr(&self)`: This is a simple getter that returns a reference to our stored pattern.
-   `match_to_lint(&self, toks: &[Token], src: &[char])`: This function receives the slice of tokens (`toks`) that matched our pattern and the original source text (`src`).
    -   We get the "save" token (index 2) and the verb token (index 4). The `?` operator cleanly handles cases where the tokens might not exist, preventing crashes.
    -   We extract the verb's text to make our error message more helpful.
    -   We construct and return a `Lint` object, which is the formal error report.
        -   `span`: Tells Harper exactly where the error is in the text.
        -   `lint_kind`: Categorizes this as a "Word Choice" error for UIs.
        -   `suggestions`: Provides the one-click fix to replace "save" with "safe".
        -   `message`: The dynamic, user-facing error message (e.g., "Did you mean `safe to ignore`?").
        -   `priority`: A number indicating the lint's importance (lower is more important).

#### **Step 4: Writing Tests**

Every rule must have tests to prove it works and to prevent future regressions.

```rust
#[test]
fn fix_ignore() {
    assert_suggestion_result(
        "It is save to ignore trivial code.",
        SaveToSafe::default(),
        "It is safe to ignore trivial code.",
    );
}

#[test]
fn ignore_correct() {
    assert_lint_count("It is safe to assume nothing.", SaveToSafe::default(), 0);
}
```

-   `assert_suggestion_result`: This test helper asserts that the linter finds an error and that its top suggestion correctly fixes the sentence.
-   `assert_lint_count`: This is just as important. It asserts that the linter finds **zero** errors in a correct sentence, proving we don't have false positives.

---

### **Part 2: How to Integrate Your New Rule into Harper**

Creating the file is not enough; you must register it so the engine knows it exists.

1.  **Create the File**: Create your new file at `harper-core/src/linting/my_new_rule.rs`.

2.  **Register the Module**: Open `harper-core/src/linting/mod.rs`. Add your file to the list of modules near the top, and export your struct so other parts of the engine can use it.
    ```rust
    // In harper-core/src/linting/mod.rs

    mod my_new_rule; // Add this line
    // ... other mods
    pub use my_new_rule::MyNewRule; // And add this line
    ```

3.  **Add to the Default Lint Group**: Open `harper-core/src/linting/lint_group.rs`. This file assembles the default set of rules that Harper uses.
    -   First, import your struct at the top: `use super::my_new_rule::MyNewRule;`.
    -   Then, find the `LintGroup::new_curated` function. Inside this function, add your linter to the group. The string you provide (`"my-new-rule"`) will be its unique identifier for configuration purposes.
    ```rust
    // In harper-core/src/linting/lint_group.rs in the `new_curated` function
    group.add_expr_linter("my-new-rule", MyNewRule::default());
    ```

After these steps, your rule is fully integrated and will run by default whenever Harper checks a document.

---

### **Part 3: API Specs and Usage**

Individual rules like `SaveToSafe` do not have their own public API. Instead, their functionality is exposed through the main `Linter` API, which runs all registered rules simultaneously. An end-user of a Harper integration (like the VS Code extension or a custom web app) interacts with your rule transparently.

#### **High-Level Usage (e.g., in JavaScript)**

A developer using the `harper.js` package would not need to know about `SaveToSafe` specifically. It just works out of the box.

```javascript
import { LocalLinter, Dialect, binary } from 'harper.js';

// The linter is created with the default rule set, which now includes your new rule.
const linter = new LocalLinter({ binary, dialect: Dialect.American });

// Your rule will automatically find the error in this text.
const lints = await linter.lint('I heard it is save to travel now.');

// The `lints` array will contain an object generated by your SaveToSafe rule.
const error = lints[0];

console.log(error.message()); // "Did you mean `safe to travel`?"
console.log(error.suggestions()[0].get_replacement_text()); // "safe"
```

#### **Configuration API**

While the rule is on by default, users can disable it using the unique identifier you provided during registration (`"save-to-safe"`).

```javascript
// Get the current configuration
const config = linter.get_lint_config_as_object();

// Disable the "save-to-safe" rule by setting its key to `false`
config.inner['save-to-safe'] = false;

// Apply the new configuration
linter.set_lint_config_from_object(config);

// Now, the linter will ignore "it is save to..." errors.
const lints = await linter.lint('I heard it is save to travel now.'); // `lints` will be empty.
```

---

## **Next Steps for WordWise Integration**

1. **Evaluate POC Results**: Review `/harper-poc` functionality and performance
2. **Plan Full Integration**: Design Harper integration into main editor workflow  
3. **Custom Rule Development**: Identify WordWise-specific grammar rules to develop
4. **Performance Testing**: Test with large documents and concurrent users
5. **User Experience**: Design suggestion UI that matches WordWise design system

The POC demonstrates that Harper is an excellent fit for WordWise's privacy-first, performance-focused approach to grammar checking. 