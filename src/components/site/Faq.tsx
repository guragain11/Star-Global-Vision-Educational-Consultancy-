import { Plus } from "lucide-react";
import { useState } from "react";

import type { FaqItem } from "@/lib/seo";

/**
 * Accordion FAQ list. Uses buttons rather than <details> so the open state can
 * be single-select and animated consistently across browsers.
 *
 * The answer panel always stays mounted and collapses via a 0fr → 1fr grid row,
 * which is the only way to animate to an unknown content height in CSS. Because
 * it stays mounted, `inert` takes the collapsed copy out of the tab order and
 * the accessibility tree, and `aria-controls` never points at a missing node.
 */
export function FaqList({ items }: { items: readonly FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="grid gap-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className={`overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow] duration-300 ${
              isOpen
                ? "border-primary/35 shadow-soft"
                : "border-border shadow-hair hover:border-primary/25"
            }`}
          >
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                className="press flex w-full items-center justify-between gap-4 px-6 py-5 text-left hover:bg-secondary/40"
              >
                <span
                  className={`text-sm font-semibold transition-colors md:text-base ${
                    isOpen ? "text-primary" : ""
                  }`}
                >
                  {item.q}
                </span>
                <span
                  className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                    isOpen ? "bg-accent-soft" : "bg-secondary"
                  }`}
                >
                  <Plus
                    className={`size-4 text-accent transition-transform duration-300 ease-brand ${
                      isOpen ? "rotate-[135deg]" : ""
                    }`}
                  />
                </span>
              </button>
            </h3>

            <div
              id={`faq-panel-${i}`}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows] duration-400 ease-brand ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-border px-6 py-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
