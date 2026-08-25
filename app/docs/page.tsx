import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { site } from "@/lib/site";
import {
  docPages,
  getDocsByCategory,
} from "@/features/docs/lib/docs-data";
import { DocsSearch } from "@/features/docs/components/docs-search";

export const metadata: Metadata = {
  title: `Documentation — ${site.name}`,
  description:
    "Developer and product documentation for the Next.js Starter Kit: architecture, auth, API, database, CMS features, CLI generators, deployment, performance, and testing.",
  alternates: { canonical: `${site.url}/docs` },
};

export default function DocsIndexPage() {
  const groups = getDocsByCategory();
  const searchable = docPages.map(({ slug, title, description }) => ({
    slug,
    title,
    description,
  }));

  return (
    <article className="py-4">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Documentation</h1>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          Guides and reference for building with the starter kit — from local
          setup through deployment and operations.
        </p>
      </header>

      <DocsSearch docs={searchable} variant="page" />

      <div className="flex flex-col gap-12">
        {groups.map((group) => (
          <section key={group.category} aria-labelledby={`cat-${group.category.replace(/\s+/g, "-").toLowerCase()}`}>
            <h2
              id={`cat-${group.category.replace(/\s+/g, "-").toLowerCase()}`}
              className="mb-4 text-xl font-semibold tracking-tight"
            >
              {group.category}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {group.pages.map((page) => (
                <Link key={page.slug} href={`/docs/${page.slug}`} className="group">
                  <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-accent/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{page.title}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {page.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Badge variant="outline" className="text-xs font-normal">
                        Updated{" "}
                        {new Date(page.updated).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
