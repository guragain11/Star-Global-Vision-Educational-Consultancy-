import { useEffect, useState, type CSSProperties, type ElementType } from "react";

/**
 * A headline whose words rise into place one after another.
 *
 * Splitting happens here rather than in CSS because there is no CSS way to select
 * a word. Each word becomes an inline-block span carrying its index as `--i`, and
 * the `words` utility in styles.css turns that into a delay — so one rule handles
 * a headline of any length instead of a wall of nth-child selectors.
 *
 * Three things this gets right that a naive split does not:
 *  - The text stays one continuous string for a screen reader and for
 *    select-and-copy, because the spaces ride along inside the spans.
 *  - `text-wrap: balance` still applies: the spans are inline-block *words*, not
 *    lines, so the browser breaks where it always would.
 *  - Server render matches hydration exactly (`data-reveal="out"` on both sides),
 *    and reduced-motion is handled entirely in CSS.
 *
 * `highlightWords` paints that many trailing words with the sun gradient, which is
 * the pattern every hero on this site already uses.
 */
export function SplitWords({
  text,
  highlightWords = 0,
  as,
  className = "",
}: {
  text: string;
  /** How many words at the end to paint with `text-gradient-sun`. */
  highlightWords?: number;
  as?: ElementType;
  className?: string;
}) {
  const Tag = as ?? "span";
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // A hero headline is above the fold by definition, so there is nothing to
    // observe — animate on mount. The one frame of delay from the effect is what
    // makes the animation visible at all rather than already finished.
    setShown(true);
  }, []);

  // Split keeping the separators, then glue each run of whitespace onto the word
  // before it: an inline-block span containing only a space collapses to nothing,
  // which would run the whole headline together.
  const words: string[] = [];
  for (const chunk of text.split(/(\s+)/)) {
    if (!chunk) continue;
    if (/^\s+$/.test(chunk) && words.length > 0) words[words.length - 1] += chunk;
    else words.push(chunk);
  }

  const highlightFrom = highlightWords > 0 ? words.length - highlightWords : words.length;

  return (
    <Tag data-reveal={shown ? "in" : "out"} className={`words ${className}`}>
      {words.map((word, i) => (
        <span
          key={`${i}-${word}`}
          style={{ "--i": i } as CSSProperties}
          className={i >= highlightFrom ? "text-gradient-sun" : undefined}
        >
          {word}
        </span>
      ))}
    </Tag>
  );
}
