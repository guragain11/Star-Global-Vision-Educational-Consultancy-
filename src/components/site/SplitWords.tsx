import { Fragment, useEffect, useState, type CSSProperties, type ElementType } from "react";

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
 *    select-and-copy, because the separating spaces sit between the spans.
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

  // The space goes *between* the spans, not inside them. Each span is
  // `display: inline-block`, which makes it its own block container, and CSS drops
  // whitespace at the end of a block container's last line — so a space glued onto
  // the end of a word vanishes and the whole headline runs together. A bare text
  // node between two inline-blocks renders as a normal space, and still reads as
  // one continuous string for a screen reader and for select-and-copy.
  const words = text.split(/\s+/).filter(Boolean);

  const highlightFrom = highlightWords > 0 ? words.length - highlightWords : words.length;

  return (
    <Tag data-reveal={shown ? "in" : "out"} className={`words ${className}`}>
      {words.map((word, i) => (
        <Fragment key={`${i}-${word}`}>
          {i > 0 && " "}
          <span
            style={{ "--i": i } as CSSProperties}
            className={i >= highlightFrom ? "text-gradient-sun" : undefined}
          >
            {word}
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}
