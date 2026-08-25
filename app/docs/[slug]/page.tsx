import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { site } from "@/lib/site";
import {
  REPO_URL,
  getDoc,
  getDocNeighbors,
  getDocSlugs,
} from "@/features/docs/lib/docs-data";
import {
  DocsContent,
} from "@/features/docs/components/docs-content";

interface DocPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getDocSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);

  if (!doc) {
    return { title: `Not found — ${site.name}` };
  }

  const url = `${site.url}/docs/${doc.slug}`;
  return {
    title: `${doc.title} — Docs | ${site.name}`,
    description: doc.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: doc.title,
      description: doc.description,
      siteName: site.name,
    },
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = getDoc(slug);

  if (!doc) {
    notFound();
  }

  const { prev, next } = getDocNeighbors(slug);
  const editUrl = `${REPO_URL}/edit/main/features/docs/lib/docs-data.ts`;

  return (
    <article className="mx-auto w-full max-w-3xl py-4">
      <header className="mb-6">
        <Badge variant="secondary" className="mb-3 w-fit">
          {doc.category}
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">{doc.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{doc.description}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            Last updated{" "}
            <time dateTime={doc.updated}>
              {new Date(doc.updated).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </span>
          <Button asChild variant="ghost" size="sm">
            <a href={editUrl} target="_blank" rel="noopener noreferrer">
              Edit on GitHub ↗
            </a>
          </Button>
        </div>
        <Separator className="mt-6" />
      </header>

      <DocsContent body={doc.body} />

      {/* Prev / next navigation */}
      <Separator className="my-10" />
      <nav
        aria-label="Pagination"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        {prev ? (
          <Link
            href={`/docs/${prev.slug}`}
            className="group rounded-md border border-border px-4 py-3 transition-colors hover:bg-accent/30"
          >
            <span className="block text-xs text-muted-foreground">← Previous</span>
            <span className="text-sm font-medium group-hover:underline">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span aria-hidden />
        )}
        {next && (
          <Link
            href={`/docs/${next.slug}`}
            className="group rounded-md border border-border px-4 py-3 text-right transition-colors hover:bg-accent/30"
          >
            <span className="block text-xs text-muted-foreground">Next →</span>
            <span className="text-sm font-medium group-hover:underline">
              {next.title}
            </span>
          </Link>
        )}
      </nav>

      <footer className="mt-8">
        <Link
          href="/docs"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← All documentation
        </Link>
      </footer>
    </article>
  );
}
