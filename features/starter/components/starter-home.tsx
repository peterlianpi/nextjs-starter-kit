import Link from "next/link";
import {
  ShieldCheck,
  Users,
  KeyRound,
  FileText,
  Palette,
  Mail,
  Database,
  Code2,
  Zap,
  ArrowRight,
  BookOpen,
  Search,
  Upload,
  Table2,
  FileSpreadsheet,
  Clock,
  Webhook,
  Bell,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { site } from "@/lib/site";
import { Reveal } from "./motion/reveal";
import { HeroBackground } from "./hero-background";

/** Real public repository — kept in sync with features/docs REPO_URL source. */
const GITHUB_URL = "https://github.com/peterlianpi/nextjs-starter-kit";

type Feature = {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
};

const featureGroups: Array<{
  id: string;
  title: string;
  tagline: string;
  features: Feature[];
}> = [
  {
    id: "auth-access",
    title: "Auth & Access",
    tagline: "Secure sessions and role-based control out of the box",
    features: [
      {
        icon: ShieldCheck,
        title: "Authentication",
        description:
          "Better Auth with email/password, Google OAuth, email verification, password reset, and session management.",
      },
      {
        icon: KeyRound,
        title: "RBAC & API Keys",
        description:
          "Six roles from USER to SUPER_ADMIN, permission helpers, plus hashed API keys with expiration and usage tracking.",
      },
      {
        icon: Users,
        title: "Organizations",
        description:
          "Multi-tenant organizations with memberships and an invitation flow backed by dedicated models.",
      },
    ],
  },
  {
    id: "content-media",
    title: "Content & Media",
    tagline: "Publish, upload, and personalize — all DB-backed",
    features: [
      {
        icon: FileText,
        title: "Blog CMS",
        description:
          "TipTap rich text editor, posts with categories and tags, server-rendered pages, print styles, and social sharing.",
      },
      {
        icon: Upload,
        title: "Multi-Provider Uploads",
        description:
          "Image cropping pipeline and pluggable storage: Cloudinary, Cloudflare R2, AWS S3, or local disk via one env var.",
      },
      {
        icon: Palette,
        title: "Theme Presets",
        description:
          "Light/dark/system modes on top of four oklch palettes — Default, Sepia, Nord, Rosé Pine — switchable from the navbar.",
      },
      {
        icon: Mail,
        title: "Email Notifications",
        description:
          "Transactional email through Nodemailer or Resend behind a single abstraction; templates for auth and alerts included.",
      },
    ],
  },
  {
    id: "developer-experience",
    title: "Developer Experience",
    tagline: "Typed end-to-end, from schema to UI",
    features: [
      {
        icon: Database,
        title: "Prisma 7 + PostgreSQL",
        description:
          "Type-safe database access with the modern prisma-client generator, pg driver adapter, migrations, and seed script.",
      },
      {
        icon: Code2,
        title: "Hono RPC API",
        description:
          "One typed catch-all API surface with Zod validation — call endpoints from the client without writing fetch code.",
      },
      {
        icon: Zap,
        title: "Modern React Stack",
        description:
          "React 19 Server Components, TanStack Query caching, React Hook Form + Zod validation, Tailwind v4 + shadcn/ui.",
      },
    ],
  },
];

const extendedFeatures: Feature[] = [
  {
    icon: Search,
    title: "Search",
    description:
      "Full-text search with PostgreSQL, debounced queries, and result highlighting.",
  },
  {
    icon: Table2,
    title: "Data Tables",
    description:
      "Sortable, filterable, paginated data tables with loading and empty states.",
  },
  {
    icon: FileSpreadsheet,
    title: "Export",
    description:
      "One-click export to CSV or JSON with proper formatting and file download.",
  },
  {
    icon: Clock,
    title: "Activity Timeline",
    description:
      "Timeline component for audit logs and activity feeds with type indicators.",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description:
      "Event-driven webhooks with retry logic, HMAC signatures, and delivery tracking.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description:
      "In-app and email notifications with read/unread status and type categories.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Dashboards, charts, and KPI tracking built with recharts patterns.",
  },
];

const techStack = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind CSS v4",
  "shadcn/ui",
  "Prisma 7",
  "PostgreSQL",
  "Better Auth",
  "Hono",
  "TanStack Query",
  "React Hook Form",
  "Zod",
  "Nodemailer",
  "Recharts",
  "Playwright",
];

const quickStartSteps = [
  {
    label: "Install dependencies",
    command: "bun install",
  },
  {
    label: "Configure your environment",
    command: "cp .env.example .env   # fill DATABASE_URL + secrets",
  },
  {
    label: "Set up the database",
    command: "bunx prisma migrate dev",
  },
  {
    label: "Start the dev server",
    command: "bun run dev",
  },
];

export function StarterHome() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <HeroBackground />
        <Reveal className="container relative mx-auto px-4 pb-16 pt-14 text-center sm:pb-20 sm:pt-24">
          <Badge
            variant="secondary"
            className="mb-4 inline-flex min-h-[44px] items-center gap-1.5 px-3"
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-emerald-500"
            />
            Production Ready — deployed on Vercel
          </Badge>
          <h1 className="mb-6 text-balance bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl">
            {site.name}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {site.description}
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="lg" className="min-h-[44px] w-full sm:w-auto">
              <Link href="/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              size="lg"
              className="min-h-[44px] w-full sm:w-auto"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </Reveal>
      </section>

      {/* Tech Stack */}
      <section className="container mx-auto px-4 py-12 sm:py-16" aria-labelledby="tech-stack-heading">
        <div className="mb-8 text-center">
          <h2 id="tech-stack-heading" className="mb-2 text-xl font-bold sm:text-2xl">
            Tech Stack
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Built with modern, battle-tested tools
          </p>
        </div>
        <ul className="flex flex-wrap justify-center gap-2">
          {techStack.map((tech) => (
            <li key={tech}>
              <Badge variant="outline" className="px-3 py-1 text-xs sm:text-sm">
                {tech}
              </Badge>
            </li>
          ))}
        </ul>
      </section>

      {/* Feature groups */}
      {featureGroups.map((group) => (
        <section
          key={group.id}
          className="container mx-auto px-4 py-12 sm:py-16"
          aria-labelledby={`${group.id}-heading`}
        >
          <div className="mb-8 text-center sm:mb-10">
            <h2
              id={`${group.id}-heading`}
              className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl"
            >
              {group.title}
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              {group.tagline}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {group.features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.08}>
                <FeatureCard feature={feature} />
              </Reveal>
            ))}
          </div>
        </section>
      ))}

      {/* Extended Features */}
      <section
        className="container mx-auto px-4 py-12 sm:py-16"
        aria-labelledby="extended-heading"
      >
        <div className="mb-8 text-center sm:mb-10">
          <h2 id="extended-heading" className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Extended Features
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Search, uploads, tables, exports, webhooks, and more
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {extendedFeatures.map((feature, i) => (
            <Reveal key={feature.title} delay={(i % 4) * 0.08}>
              <FeatureCard feature={feature} compact />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section
        className="container mx-auto px-4 py-12 sm:py-16"
        aria-labelledby="quick-start-heading"
      >
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle id="quick-start-heading">Quick Start</CardTitle>
            <CardDescription>
              Get up and running in minutes with Bun
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickStartSteps.map((step, i) => (
              <div key={step.label} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 overflow-x-auto break-words text-sm sm:text-base">
                  {step.label}:{" "}
                  <code className="whitespace-nowrap rounded bg-muted px-1.5 py-0.5 text-xs sm:text-sm">
                    {step.command}
                  </code>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-12 text-center sm:py-16">
        <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
          Ready to Build?
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-sm text-muted-foreground sm:text-base">
          Start with authentication, explore the admin panel, then build your
          own features using the established patterns.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button asChild size="lg" className="min-h-[44px] w-full sm:w-auto">
            <Link href="/dashboard">
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            size="lg"
            className="min-h-[44px] w-full sm:w-auto"
          >
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <GithubIcon className="mr-2 h-4 w-4" /> GitHub
            </a>
          </Button>
          <Button
            variant="outline"
            asChild
            size="lg"
            className="min-h-[44px] w-full sm:w-auto"
          >
            <Link href="/docs">
              <BookOpen className="mr-2 h-4 w-4" /> Docs
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto flex flex-col items-center gap-3 px-4 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} {site.name}. Built by{" "}
            {site.creator}.
          </p>
          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link
              href="/docs"
              className="min-h-[44px] leading-[44px] transition-colors hover:text-foreground"
            >
              Docs
            </Link>
            <Link
              href="/blog"
              className="min-h-[44px] leading-[44px] transition-colors hover:text-foreground"
            >
              Blog
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <GithubIcon className="h-4 w-4" /> GitHub
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  feature,
  compact = false,
}: {
  feature: Feature;
  compact?: boolean;
}) {
  const Icon = feature.icon;
  return (
    <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <CardHeader>
        <Icon className="mb-2 h-7 w-7 text-primary sm:h-8 sm:w-8" aria-hidden="true" />
        <CardTitle className="text-base sm:text-lg">{feature.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className={compact ? "text-sm" : "text-sm sm:text-base"}>
          {feature.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

/**
 * Inline GitHub mark SVG — lucide-react 1.x removed brand icons.
 * Preserves the visual intent of the removed `Github` icon on the repo link button.
 */
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
