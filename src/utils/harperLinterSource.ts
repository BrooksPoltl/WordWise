import { Diagnostic } from '@codemirror/lint';
import { StateEffect, StateField } from '@codemirror/state';
import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
} from '@codemirror/view';
import {
    getLinter,
    HarperLint,
    ignoreLint,
    isLintIgnored,
} from './harperLinter';

export const setHarperDiagnostics = StateEffect.define<Diagnostic[]>();
export const harperDiagnostics = StateField.define<Diagnostic[]>({
  create: () => [],
  update(value, tr) {
    let newValue = value;
    for (const effect of tr.effects) {
      if (effect.is(setHarperDiagnostics)) {
        return effect.value;
      }
    }
    // Adjust diagnostic positions on document changes
    newValue = newValue
      .map(d => ({ ...d, from: tr.changes.mapPos(d.from), to: tr.changes.mapPos(d.to) }))
      .filter(d => d.from < d.to);

    return newValue;
  },
});

export const harperLinterPlugin = ViewPlugin.fromClass(
  class {
    debounceTimeout: NodeJS.Timeout | number = -1;

    constructor(private readonly view: EditorView) {
      this.runLinter();
    }

    update(update: ViewUpdate) {
      if (update.docChanged) {
        clearTimeout(this.debounceTimeout as number);
        this.debounceTimeout = setTimeout(() => this.runLinter(), 400);
      }
    }

    destroy() {
      clearTimeout(this.debounceTimeout as number);
    }

    runLinter = async () => {
      const linterInstance = await getLinter();
      if (!linterInstance) {
        this.view.dispatch({ effects: setHarperDiagnostics.of([]) });
        return;
      }

      const docString = this.view.state.doc.toString();
      const lints = await linterInstance.lint(docString);
      const diagnostics: Diagnostic[] = lints
        .filter(lint => !isLintIgnored(lint))
        .map((lint: HarperLint) => {
          const span = lint.span();
          return {
            from: span.start,
            to: span.end,
            severity: 'warning',
            message: lint.message(),
            actions: [
              ...lint.suggestions().map(s => ({
                name: s.get_replacement_text(),
                apply: (v: EditorView, from: number, to: number) => {
                  v.dispatch({
                    changes: { from, to, insert: s.get_replacement_text() },
                  });
                },
              })),
              {
                name: 'Ignore',
                apply: () => {
                  ignoreLint(lint);
                  this.runLinter();
                },
              },
            ],
          };
        });

      if (this.view.state.doc.toString() === docString) {
        this.view.dispatch({ effects: setHarperDiagnostics.of(diagnostics) });
      }
    };
  },
);

const suggestionUnderline = Decoration.mark({
  class: 'cm-lintRange cm-lintRange-warning',
});
export const harperLintDeco = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(value, tr) {
    const diagnostics = tr.state.field(harperDiagnostics);
    let newValue = value.map(tr.changes);

    const builder = [];
    for (const d of diagnostics) {
      if (d.from < d.to) {
        builder.push(suggestionUnderline.range(d.from, d.to));
      }
    }
    newValue = Decoration.set(builder, true);
    return newValue;
  },
  provide: f => EditorView.decorations.from(f),
}); 