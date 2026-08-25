import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import prisma from "@/lib/prisma";
import { site } from "@/lib/site";
import { PostContent } from "@/features/editor/components/editor-content";
import { PrintButton } from "@/features/print/components/print-button";
import { ShareMenu } from "@/features/social/components/share-menu";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  try {
    return await prisma.post.findFirst({
      where: { slug, status: "PUBLISHED", deletedAt: null },
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });
  } catch (error) {
    console.error("[blog] failed to load post:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: `Post not found — ${site.name}` };
  }

  const description = post.excerpt;
  const url = `${site.url}/blog/${post.slug}`;

  return {
    title: `${post.title} — ${site.name}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description,
      siteName: site.name,
      publishedTime: post.publishedAt?.toISOString(),
      authors: post.author.name ? [post.author.name] : undefined,
      images: post.coverImage
        ? [{ url: post.coverImage }]
        : [{ url: `${site.url}${site.ogImage}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      site: site.twitterHandle,
      creator: site.twitterHandle,
      images: [post.coverImage ?? `${site.url}${site.ogImage}`],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-4">
        {post.category && (
          <Badge variant="secondary" className="w-fit">
            {post.category.name}
          </Badge>
        )}
        <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
        <p className="text-lg text-muted-foreground">{post.excerpt}</p>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{post.author.name ?? "Unknown author"}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.publishedAt?.toISOString()}>
            {post.publishedAt?.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {post.featured && (
            <>
              <span aria-hidden>·</span>
              <span>Featured</span>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PrintButton />
        </div>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map(({ tag }) => (
              <Badge key={tag.id} variant="outline">
                #{tag.slug}
              </Badge>
            ))}
          </div>
        )}
        <Separator />
      </header>

      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt={post.title}
          className="mb-8 w-full rounded-lg border border-border object-cover"
        />
      )}

      {/* Body — TipTap JSON rendered server-side to HTML */}
      <PostContent content={post.content} />

      {/* Share */}
      <ShareMenu
        url={`${site.url}/blog/${post.slug}`}
        title={post.title}
        className="mt-10"
      />

      <footer className="mt-12">
        <Link
          href="/"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Back to home
        </Link>
      </footer>
    </article>
  );
}
