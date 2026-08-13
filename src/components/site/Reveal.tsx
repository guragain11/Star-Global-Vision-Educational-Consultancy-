import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

/**
 * Reveal-on-scroll wrapper.
 *
 * The element renders with `data-reveal="out"` and flips to `"in"` the first
 * time it crosses the viewport, which triggers the `reveal` keyframes in
 * styles.css. It never flips back, because content that has been read should not
 * re-animate when you scroll up past it.
 *
 * Three deliberate safety valves:
 *  - Server render emits `data-reveal="out"`, so hydration matches exactly.
 *  - If IntersectionObserver is missing, everything shows immediately.
 *  - `prefers-reduced-motion` is handled in CSS, so the markup stays the same.
 */
export function Reveal({
  children,
  as,
  className = "",
  delay = 0,
  stagger = false,
  amount = 0.12,
}: {
  children: ReactNode;
  /** Rendered element. Use `li`, `section` etc. where the semantics demand it. */
  as?: ElementType;
  className?: string;
  /** Milliseconds to hold before rising. Ignored when `stagger` is set. */
  delay?: number;
  /** Cascade the direct children instead of moving the block as one. */
  stagger?: boolean;
  /** Fraction of the element that must be visible before it fires. */
  amount?: number;
}) {
  const Tag = as ?? "div";
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No observer (very old browser, or a test environment), so show it all.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    // Already on screen at mount: skip the observer round-trip so above-the-fold
    // content is not blank for a frame.
    const box = node.getBoundingClientRect();
    if (box.top < window.innerHeight * 0.92 && box.bottom > 0) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { threshold: amount, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [amount]);

  return (
    <Tag
      ref={ref}
      data-reveal={shown ? "in" : "out"}
      className={`${stagger ? "reveal-stagger" : "reveal"} ${className}`}
      style={!stagger && delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
