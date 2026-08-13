import { Fragment } from "react";

import { parseInline, parseRichText } from "@/lib/content-utils";

function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((part, i) => {
        if (part.type === "bold") return <strong key={i}>{part.value}</strong>;
        if (part.type === "italic") return <em key={i}>{part.value}</em>;
        return <Fragment key={i}>{part.value}</Fragment>;
      })}
    </>
  );
}

/**
 * Renders admin-authored body text. Only the markdown subset in
 * `parseRichText` is honoured, and no raw HTML is ever interpreted.
 */
export function RichText({ source, className = "" }: { source: string; className?: string }) {
  const blocks = parseRichText(source);

  return (
    <div className={`prose-brand ${className}`}>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "h2":
            return (
              <h2 key={i}>
                <Inline text={block.text} />
              </h2>
            );
          case "h3":
            return (
              <h3 key={i}>
                <Inline text={block.text} />
              </h3>
            );
          case "quote":
            return (
              <blockquote key={i}>
                <Inline text={block.text} />
              </blockquote>
            );
          case "ul":
            return (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Inline text={item} />
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Inline text={item} />
                  </li>
                ))}
              </ol>
            );
          default:
            return (
              <p key={i}>
                <Inline text={block.text} />
              </p>
            );
        }
      })}
    </div>
  );
}
