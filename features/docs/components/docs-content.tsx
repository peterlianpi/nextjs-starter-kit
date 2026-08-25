import { cn } from "@/lib/utils";
import type { DocBlock } from "@/features/docs/lib/docs-data";

/**
 * Server-side renderer for structured doc blocks.
 * Reuses the `.prose-post` typography styles from globals.css.
 */
export function DocsContent({
  body,
  className,
}: {
  body: DocBlock[];
  className?: string;
}) {
  return (
    <div className={cn("prose-post", className)}>
      {body.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} id={slugify(block.text)}>
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} id={slugify(block.text)}>
                {block.text}
              </h3>
            );
          case "p":
            return <p key={i}>{block.text}</p>;
          case "list": {
            const items = block.items.map((item, j) => (
              <li key={j}>{item}</li>
            ));
            return block.ordered ? (
              <ol key={i}>{items}</ol>
            ) : (
              <ul key={i}>{items}</ul>
            );
          }
          case "code":
            return (
              <pre key={i}>
                <code>{block.code}</code>
              </pre>
            );
          case "note":
            return (
              <aside
                key={i}
                role="note"
                className={cn(
                  "rounded-md border px-4 py-3 text-sm not-prose",
                  block.variant === "warning"
                    ? "border-amber-500/40 bg-amber-500/10 text-foreground"
                    : "border-primary/30 bg-primary/5 text-foreground",
                )}
              >
                <span className="mr-2 font-semibold">
                  {block.variant === "warning" ? "Note:" : "Info:"}
                </span>
                {block.text}
              </aside>
            );
          case "table":
            return (
              <table key={i}>
                <thead>
                  <tr>
                    {block.headers.map((h, j) => (
                      <th key={j}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, j) => (
                    <tr key={j}>
                      {row.map((cell, k) => (
                        <td key={k}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
