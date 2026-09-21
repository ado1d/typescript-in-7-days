import type { ReactNode } from "react";

/**
 * Renders a string with `backtick` spans as inline <code> elements.
 * Also supports **bold** spans.
 */
export function renderRichText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Split on backticks first; odd indexes are code spans
  const parts = text.split("`");
  parts.forEach((part, i) => {
    if (i % 2 === 1) {
      nodes.push(
        <code
          key={`c-${i}`}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] font-medium"
        >
          {part}
        </code>
      );
      return;
    }
    // Handle **bold** within plain text
    const boldParts = part.split("**");
    boldParts.forEach((bold, j) => {
      if (j % 2 === 1) {
        nodes.push(
          <strong key={`b-${i}-${j}`} className="font-semibold text-foreground">
            {bold}
          </strong>
        );
      } else if (bold.length > 0) {
        nodes.push(<span key={`t-${i}-${j}`}>{bold}</span>);
      }
    });
  });
  return nodes;
}
