import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

// ============================================
// PUBLIC BLOG INDEX (Unit 16.1)
// ============================================

const POSTS_PER_PAGE = 9;

interface BlogIndexPageProps {
  searchParams: Promise<{ page?: string }>;
}

async function getPublishedPosts(page: number) {
  try {
    const where = { status: "PUBLISHED" as const, deletedAt: null };
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          publishedAt: true,
          featured: true,
          author: { select: { name: true } },
          category: { select: { id: true, name: true, slug: true } },
          tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * POSTS_PER_PAGE,
        take: POSTS_PER_PAGE,
      }),
      prisma.post.count({ where }),
    ]);
    return { posts, total };
  } catch (error) {
    console.error("[blog] failed to load posts:", error);
    return { posts: [], total: 0 };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const url = `${site.url}/blog`;
  return {
    title: `Blog — ${site.name}`,
    description: `Articles and updates from ${site.name}.`,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `Blog — ${site.name}`,
      description: `Articles and updates from ${site.name}.`,
      siteName: site.name,
      images: [{ url: `${site.url}${site.ogImage}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Blog — ${site.name}`,
      description: `Articles and updates from ${site.name}.`,
      site: site.twitterHandle,
      creator: site.twitterHandle,
      images: [`${site.url}${site.ogImage}`],
    },
  };
}

export default async function BlogIndexPage({
  searchParams,
}: BlogIndexPageProps) {
  const { page: pageParam } = await searchParams;
  const pageNum = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const { posts, total } = await getPublishedPosts(pageNum);
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-10 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
        <p className="text-lg text-muted-foreground">
          Articles and updates from {site.name}.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <h2 className="text-xl font-semibold">No posts yet</h2>
          <p className="mt-2 text-muted-foreground">
            Check back soon — new articles are on the way.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
              >
                {post.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImage}
                    alt=""
                    loading="lazy"
                    className="aspect-video w-full border-b border-border object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col gap-3 p-4">
                  {post.category && (
                    <Badge variant="secondary" className="w-fit">
                      {post.category.name}
                    </Badge>
                  )}
                  <h2 className="text-xl font-semibold leading-snug">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="underline-offset-4 group-hover:underline"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt && (
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-auto flex flex-col gap-3 pt-2">
                    <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                      <span>{post.author.name ?? "Unknown author"}</span>
                      {post.publishedAt && (
                        <>
                          <span aria-hidden>·</span>
                          <time dateTime={post.publishedAt.toISOString()}>
                            {post.publishedAt.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </time>
                        </>
                      )}
                      {post.featured && (
                        <>
                          <span aria-hidden>·</span>
                          <span>Featured</span>
                        </>
                      )}
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.map(({ tag }) => (
                          <Badge key={tag.id} variant="outline">
                            #{tag.slug}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Blog pagination"
              className="mt-12 flex items-center justify-center gap-2"
            >
              {pageNum > 1 && (
                <Link
                  href={`/blog?page=${pageNum - 1}`}
                  rel="prev"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  ← Previous
                </Link>
              )}
              <span className="px-2 text-sm text-muted-foreground">
                Page {pageNum} of {totalPages}
              </span>
              {pageNum < totalPages && (
                <Link
                  href={`/blog?page=${pageNum + 1}`}
                  rel="next"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Next →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
