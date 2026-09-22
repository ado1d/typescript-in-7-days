"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import {
  acceptCompletion,
  autocompletion,
  nextSnippetField,
} from "@codemirror/autocomplete";
import { indentWithTab } from "@codemirror/commands";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import {
  EditorSelection,
  Prec,
  StateEffect,
  StateField,
  type Extension,
} from "@codemirror/state";
import {
  Decoration,
  EditorView,
  keymap,
  type Command,
  type DecorationSet,
} from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import { tsCompletionSource } from "./ts-completions";

/**
 * CodeMirror 6-based TypeScript editor for the playground.
 *
 * Fixes the old textarea+overlay cursor drift (CodeMirror owns a single
 * rendering surface, so the caret is always pixel-accurate) and adds a
 * real editing experience: as-you-type autocompletion, auto-close
 * brackets/quotes, bracket pair matching, smart indent, snippets, search
 * and undo/redo.
 */

const MONO_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

/* ------------------------------------------------------------------ */
/* Error-line highlight (driven from server diagnostics)              */
/* ------------------------------------------------------------------ */

const setErrorLine = StateEffect.define<number | null>();

const errorLineField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(value, tr) {
    if (tr.docChanged) value = value.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(setErrorLine)) {
        if (effect.value == null) return Decoration.none;
        const clamped = Math.min(Math.max(effect.value, 1), tr.state.doc.lines);
        const line = tr.state.doc.line(clamped);
        return Decoration.set([Decoration.line({ class: "cm-errorLine" }).range(line.from)]);
      }
    }
    return value;
  },
  provide: (field) => EditorView.decorations.from(field),
});

/* ------------------------------------------------------------------ */
/* Warm-dark theme (matches the Prism palette used by CodeBlock)      */
/* ------------------------------------------------------------------ */

const warmDarkTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#09090b",
      color: "#e4e4e7",
      fontSize: "13px",
      height: "100%",
    },
    ".cm-scroller": {
      fontFamily: MONO_STACK,
      lineHeight: "1.65",
    },
    ".cm-content": {
      caretColor: "#34d399",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#34d399",
      borderLeftWidth: "2px",
    },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "#3f3f46",
    },
    ".cm-gutters": {
      backgroundColor: "#0c0c0f",
      color: "#52525b",
      border: "none",
      borderRight: "1px solid rgba(24, 24, 27, 0.9)",
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(244, 244, 245, 0.035)",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "rgba(244, 244, 245, 0.04)",
      color: "#34d399",
    },
    ".cm-errorLine": {
      backgroundColor: "rgba(244, 63, 94, 0.09)",
    },
    "&.cm-focused .cm-matchingBracket": {
      backgroundColor: "rgba(52, 211, 153, 0.14)",
      outline: "1px solid rgba(52, 211, 153, 0.35)",
      color: "inherit",
    },
    /* autocomplete tooltip */
    ".cm-tooltip": {
      backgroundColor: "#18181b",
      border: "1px solid #3f3f46",
      borderRadius: "8px",
      overflow: "hidden",
      fontFamily: MONO_STACK,
      fontSize: "12px",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
    },
    ".cm-tooltip.cm-tooltip-autocomplete > ul": {
      fontFamily: MONO_STACK,
      fontSize: "12px",
      maxHeight: "10.5em",
    },
    ".cm-tooltip.cm-tooltip-autocomplete > ul > li": {
      color: "#d4d4d8",
    },
    ".cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]": {
      backgroundColor: "#26262b",
      color: "#fafafa",
    },
    ".cm-completionDetail": {
      color: "#a1a1aa",
      fontStyle: "normal",
    },
    ".cm-completionIcon": { color: "#71717a" },
    ".cm-completionIcon-keyword": { color: "#f472b6" },
    ".cm-completionIcon-type": { color: "#c084fc" },
    ".cm-completionIcon-function": { color: "#5eead4" },
    ".cm-completionIcon-method": { color: "#5eead4" },
    ".cm-completionIcon-class": { color: "#34d399" },
    ".cm-completionIcon-constant": { color: "#fb923c" },
    ".cm-completionIcon-variable": { color: "#93c5fd" },
    ".cm-completionIcon-property": { color: "#2dd4bf" },
    ".cm-completionIcon-snippet": { color: "#c084fc" },
    /* search panel */
    ".cm-panels": {
      backgroundColor: "#18181b",
      color: "#d4d4d8",
      borderColor: "#27272a",
      fontFamily: MONO_STACK,
      fontSize: "12px",
    },
    ".cm-panels input, .cm-panels button, .cm-panels label": {
      fontFamily: MONO_STACK,
      fontSize: "12px",
    },
    ".cm-searchMatch": { backgroundColor: "rgba(245, 158, 11, 0.22)" },
    ".cm-searchMatch-selected": { backgroundColor: "rgba(244, 114, 182, 0.35)" },
    /* scrollbars */
    ".cm-scroller::-webkit-scrollbar": { width: "10px", height: "10px" },
    ".cm-scroller::-webkit-scrollbar-thumb": {
      backgroundColor: "#3f3f46",
      borderRadius: "5px",
    },
    ".cm-scroller::-webkit-scrollbar-thumb:hover": { backgroundColor: "#52525b" },
    ".cm-scroller::-webkit-scrollbar-track, .cm-scroller::-webkit-scrollbar-corner": {
      backgroundColor: "transparent",
    },
  },
  { dark: true }
);

const warmDarkHighlight = HighlightStyle.define([
  { tag: [t.lineComment, t.blockComment], color: "#6b7286", fontStyle: "italic" },
  {
    tag: [
      t.keyword,
      t.controlKeyword,
      t.operatorKeyword,
      t.definitionKeyword,
      t.moduleKeyword,
      t.self,
    ],
    color: "#f472b6",
  },
  { tag: [t.string, t.special(t.string), t.regexp, t.escape], color: "#fbbf24" },
  { tag: [t.number, t.bool, t.atom], color: "#fb923c" },
  {
    tag: [
      t.function(t.variableName),
      t.function(t.propertyName),
      t.definition(t.function(t.variableName)),
      t.definition(t.function(t.propertyName)),
      t.labelName,
    ],
    color: "#5eead4",
  },
  {
    tag: [t.className, t.typeName, t.standard(t.name), t.standard(t.variableName)],
    color: "#34d399",
  },
  { tag: [t.propertyName, t.definition(t.propertyName)], color: "#2dd4bf" },
  { tag: t.operator, color: "#93c5fd" },
  { tag: [t.punctuation, t.bracket, t.separator, t.meta], color: "#9ca3af" },
  { tag: [t.variableName, t.definition(t.variableName)], color: "#e4e4e7" },
  { tag: [t.link, t.url], color: "#93c5fd" },
  { tag: t.invalid, color: "#fb7185" },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.heading, color: "#e4e4e7", fontWeight: "bold" },
]);

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

/** Accept an open completion, else advance a snippet field, else indent. */
const tabCommand: Command = (view) =>
  acceptCompletion(view) || nextSnippetField(view);

/**
 * Static basic-setup config. MUST be a stable reference: @uiw dispatches a
 * full state reconfigure whenever this prop's identity changes, which would
 * wipe dynamically-appended state (like active snippet fields) on every
 * keystroke.
 */
const BASIC_SETUP = {
  lineNumbers: true,
  highlightActiveLineGutter: true,
  highlightActiveLine: true,
  foldGutter: false,
  foldKeymap: false,
  autocompletion: false, // custom source provided via extensions
  syntaxHighlighting: false, // custom warm-dark HighlightStyle
  bracketMatching: true,
  closeBrackets: true,
  closeBracketsKeymap: true,
  completionKeymap: true,
  history: true,
  historyKeymap: true,
  defaultKeymap: true,
  searchKeymap: true,
  indentOnInput: true,
  highlightSelectionMatches: true,
  rectangularSelection: true,
  crosshairCursor: true,
  drawSelection: true,
  dropCursor: true,
  allowMultipleSelections: true,
  tabSize: 2,
};

export interface TsEditorApi {
  /** Scroll the given 1-based line into view, place the caret, focus. */
  jumpToLine: (line: number) => void;
  focus: () => void;
}

interface TsEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** 1-based line to highlight as an active compiler error (null = none). */
  errorLine?: number | null;
  onReady?: (api: TsEditorApi) => void;
}

export function TsEditor({ value, onChange, errorLine, onReady }: TsEditorProps) {
  const viewRef = useRef<EditorView | null>(null);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  const extensions = useMemo<Extension[]>(
    () => [
      errorLineField,
      autocompletion({
        override: [tsCompletionSource],
        activateOnTyping: true,
        icons: true,
      }),
      warmDarkTheme,
      syntaxHighlighting(warmDarkHighlight, { fallback: true }),
      javascript({ typescript: true }),
      keymap.of([indentWithTab]),
      Prec.high(
        keymap.of([
          {
            // Tab: accept a completion first (VS Code-like), then move to the
            // next snippet field; otherwise falls through to indentWithTab.
            key: "Tab",
            run: tabCommand,
          },
        ])
      ),
    ],
    []
  );

  useEffect(() => {
    const view = viewRef.current;
    if (view && errorLine !== undefined) {
      view.dispatch({ effects: setErrorLine.of(errorLine) });
    }
  }, [errorLine]);

  const handleCreateEditor = useCallback((view: EditorView) => {
    viewRef.current = view;
    onReadyRef.current?.({
      jumpToLine: (line: number) => {
        const clamped = Math.min(Math.max(1, Math.round(line)), view.state.doc.lines);
        const info = view.state.doc.line(clamped);
        view.dispatch({
          selection: EditorSelection.cursor(info.to),
          effects: EditorView.scrollIntoView(info.from, { y: "center" }),
        });
        view.focus();
      },
      focus: () => view.focus(),
    });
  }, []);

  return (
    <CodeMirror
      value={value}
      height="100%"
      theme="none"
      extensions={extensions}
      onChange={onChange}
      onCreateEditor={handleCreateEditor}
      basicSetup={BASIC_SETUP}
    />
  );
}

export default TsEditor;
