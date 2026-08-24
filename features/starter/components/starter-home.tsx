import Link from "next/link";
import {
  Shield,
  Zap,
  Code,
  Database,
  Mail,
  LayoutDashboard,
  ArrowRight,
  BookOpen,
  Search,
  Upload,
  Table2,
  FileSpreadsheet,
  Clock,
  Key,
  Webhook,
  Bell,
  BarChart3,
  Settings,
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

const coreFeatures = [
  {
    icon: Shield,
    title: "Authentication",
    description:
      "Better Auth with email/password, email verification, password reset, and session management.",
  },
  {
    icon: LayoutDashboard,
    title: "Admin Panel",
    description:
      "Role-based access control with admin dashboard and user management out of the box.",
  },
  {
    icon: Database,
    title: "Prisma + PostgreSQL",
    description:
      "Type-safe database access with Prisma ORM, migrations, and a clean schema.",
  },
  {
    icon: Code,
    title: "Hono API",
    description:
      "Type-safe API layer with Hono RPC pattern — no manual fetch code needed.",
  },
  {
    icon: Zap,
    title: "TanStack Query",
    description:
      "Server state management with automatic caching, invalidation, and optimistic updates.",
  },
  {
    icon: Mail,
    title: "Email System",
    description:
      "Nodemailer integration with HTML email templates for auth and notifications.",
  },
];

const newFeatures = [
  {
    icon: Search,
    title: "Search",
    description:
      "Full-text search with PostgreSQL, debounced queries, and result highlighting.",
  },
  {
    icon: Upload,
    title: "File Upload",
    description:
      "Drag-and-drop file uploads with validation, progress tracking, and S3/local storage support.",
  },
  {
    icon: Table2,
    title: "Data Tables",
    description:
      "Sortable, filterable, paginated data tables with loading states and empty states.",
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
      "Beautiful timeline component for audit logs and activity feeds with type indicators.",
  },
  {
    icon: Key,
    title: "API Keys",
    description:
      "API key management with permissions, expiration, usage tracking, and prefix identification.",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description:
      "Event-driven webhook system with retry logic, HMAC signatures, and delivery tracking.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description:
      "In-app and email notifications with read/unread status and type categorization.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Data scientist and analyst agent patterns for dashboards, charts, and KPI tracking.",
  },
  {
    icon: Settings,
    title: "User Preferences",
    description:
      "Per-user settings for theme, language, timezone, and notification preferences.",
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

export function StarterHome() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <Badge variant="secondary" className="mb-4">
          Production Ready
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
          {site.name}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          {site.description}
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/signup">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Tech Stack</h2>
          <p className="text-muted-foreground">
            Built with modern, battle-tested tools
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {techStack.map((tech) => (
            <Badge key={tech} variant="outline" className="px-3 py-1">
              {tech}
            </Badge>
          ))}
        </div>
      </section>

      {/* Core Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Core Features</h2>
          <p className="text-muted-foreground">
            Authentication, admin, database, and API — ready out of the box
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coreFeatures.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* New Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Extended Features</h2>
          <p className="text-muted-foreground">
            Search, uploads, tables, exports, webhooks, and more
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {newFeatures.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get up and running in minutes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                1
              </span>
              <span>
                Set up your <code className="text-sm">.env</code> with database
                and email credentials
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                2
              </span>
              <span>
                Run <code className="text-sm">npx prisma migrate dev</code> to
                set up your database
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                3
              </span>
              <span>
                Start the dev server with <code className="text-sm">npm run dev</code>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                4
              </span>
              <span>Build your features using the patterns shown in the codebase</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Build?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Start with authentication, explore the admin panel, then build your
          own features using the established patterns.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button asChild>
            <Link href="/dashboard">
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon className="mr-2 h-4 w-4" /> GitHub
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/docs" target="_blank" rel="noopener noreferrer">
              <BookOpen className="mr-2 h-4 w-4" /> Docs
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} {site.name}. Built with Next.js,
          Prisma, and Better Auth.
        </p>
      </footer>
    </div>
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
