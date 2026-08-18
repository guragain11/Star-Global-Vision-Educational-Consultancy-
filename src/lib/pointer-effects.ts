import { useEffect, type PointerEvent as ReactPointerEvent } from "react";

/**
 * Cursor-following glow and tilt, from one listener for the whole page.
 *
 * The alternative — a hook per card — means dozens of `pointermove` listeners on
 * a grid page and a ref on every card. This attaches a single passive listener to
 * the document and walks up from the event target to the nearest `.spotlight` or
 * `.tilt` element instead, writing four custom properties that the CSS in
 * styles.css reads. Nothing re-renders: no React state is involved, so a moving
 * cursor never costs a reconciliation.
 *
 * Bails out entirely on touch devices and under `prefers-reduced-motion`, so the
 * listener does not exist at all where the effect would not be painted. Most of
 * this site's visitors are on a phone, so that is the common path.
 */
export function usePointerEffects(): void {
  useEffect(() => {
    const fine = window.matchMedia?.("(hover: hover) and (pointer: fine)");
    const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!fine?.matches || calm?.matches) return;

    let frame = 0;
    let pending: PointerEvent | null = null;

    const apply = () => {
      frame = 0;
      const event = pending;
      pending = null;
      if (!event) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const node = target.closest<HTMLElement>(".spotlight, .tilt");
      if (!node) return;

      const box = node.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;

      // 0..1 within the element, which is all either effect needs.
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;

      node.style.setProperty("--mx", `${(x * 100).toFixed(2)}%`);
      node.style.setProperty("--my", `${(y * 100).toFixed(2)}%`);

      if (node.classList.contains("tilt")) {
        // Centre-relative, so the card leans away from the cursor's side. Five
        // degrees: enough to read as a response, small enough that text edges
        // stay crisp.
        node.style.setProperty("--ry", `${((x - 0.5) * 5).toFixed(2)}deg`);
        node.style.setProperty("--rx", `${((0.5 - y) * 5).toFixed(2)}deg`);
      }
    };

    const onMove = (event: PointerEvent) => {
      pending = event;
      // One update per frame at most. A raw pointermove handler can fire several
      // hundred times a second on a high-polling mouse.
      frame ||= requestAnimationFrame(apply);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}

/**
 * Magnetic pull for a single button, wired through a ref.
 *
 * Unlike the glow above this one needs the element's own bounds on enter and a
 * reset on leave, and it is used on a handful of primary CTAs rather than every
 * card, so a per-element listener is the honest trade here.
 */
export function magneticProps(strength = 6): {
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerLeave: (event: ReactPointerEvent<HTMLElement>) => void;
} {
  return {
    onPointerMove: (event) => {
      const node = event.currentTarget;
      const box = node.getBoundingClientRect();
      const dx = (event.clientX - (box.left + box.width / 2)) / (box.width / 2);
      const dy = (event.clientY - (box.top + box.height / 2)) / (box.height / 2);
      // Clamped, so a wide button cannot slide further than it is tall.
      node.style.setProperty("--tx", `${(Math.max(-1, Math.min(1, dx)) * strength).toFixed(2)}px`);
      node.style.setProperty("--ty", `${(Math.max(-1, Math.min(1, dy)) * strength).toFixed(2)}px`);
    },
    onPointerLeave: (event) => {
      const node = event.currentTarget;
      node.style.removeProperty("--tx");
      node.style.removeProperty("--ty");
    },
  };
}
