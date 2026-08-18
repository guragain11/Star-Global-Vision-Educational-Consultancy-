import { useEffect, useRef, useState } from "react";

/**
 * A number that counts up the first time it scrolls into view.
 *
 * Renders the final value on the server and as the initial client state, so the
 * real figure is in the HTML for crawlers and for anyone without JavaScript —
 * the animation only ever replaces a number that was already correct. It also
 * means hydration matches, since both sides start from `to`.
 *
 * Driven by requestAnimationFrame rather than a CSS counter: `@property`-based
 * counting still needs a JS trigger for the scroll-into-view part, and this way
 * the easing matches the rest of the site.
 */
export function Counter({
  to,
  suffix = "",
  prefix = "",
  duration = 1400,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  /** Milliseconds for the whole count. Longer than a transition on purpose. */
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Someone who asked for less motion gets the final number, immediately.
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    let frame = 0;
    let start: number | null = null;

    // Drop to zero as soon as we know motion is wanted, rather than when the
    // element scrolls in. Otherwise the final value would sit visible at the
    // edge of the viewport and then visibly reset before counting.
    setValue(0);

    const step = (now: number) => {
      start ??= now;
      const t = Math.min(1, (now - start) / duration);
      // Same ease-out curve as --ease-brand, so the count decelerates like
      // everything else on the page.
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(to * eased));
      if (t < 1) frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect();
            frame = requestAnimationFrame(step);
          }
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {/* Locale pinned rather than left to the runtime: the server and the browser
          must format 3500 identically or hydration reports a mismatch. */}
      {value.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
