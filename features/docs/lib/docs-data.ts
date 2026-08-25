// ============================================
// DOCS CONTENT DATA
// ============================================
// Curated developer documentation stored as structured TS data (no MDX
// toolchain). Rendered server-side by `features/docs/components/docs-content.tsx`.
// Do NOT import source context files here — content is distilled manually.

export type DocBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "code"; lang?: string; code: string }
  | { type: "note"; variant: "info" | "warning"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export type DocCategory =
  | "Getting Started"
  | "Architecture"
  | "Features"
  | "Operations";

export type DocPage = {
  slug: string;
  title: string;
  description: string;
  category: DocCategory;
  updated: string; // ISO date
  body: DocBlock[];
};

export const REPO_URL = "https://github.com/peterlianpi/nextjs-starter-kit";

const CATEGORY_ORDER: DocCategory[] = [
  "Getting Started",
  "Architecture",
  "Features",
  "Operations",
];

export function getDocSlugs(): string[] {
  return docPages.map((d) => d.slug);
}

export function getDoc(slug: string): DocPage | undefined {
  return docPages.find((d) => d.slug === slug);
}

/** All pages in canonical reading order, for prev/next navigation. */
export function getDocNeighbors(slug: string): {
  prev: Pick<DocPage, "slug" | "title"> | null;
  next: Pick<DocPage, "slug" | "title"> | null;
} {
  const idx = docPages.findIndex((d) => d.slug === slug);
  return {
    prev: idx > 0 ? docPages[idx - 1] : null,
    next: idx >= 0 && idx < docPages.length - 1 ? docPages[idx + 1] : null,
  };
}

/** Docs grouped by category, preserving CATEGORY_ORDER then file order. */
export function getDocsByCategory(): Array<{
  category: DocCategory;
  pages: Array<Pick<DocPage, "slug" | "title" | "description" | "updated">>;
}> {
  return CATEGORY_ORDER.map((category) => ({
    category,
    pages: docPages
      .filter((d) => d.category === category)
      .map(({ slug, title, description, updated }) => ({
        slug,
        title,
        description,
        updated,
      })),
  })).filter((g) => g.pages.length > 0);
}

export const docPages: DocPage[] = [
  // ---------------------------------------------------------------
  {
    slug: "getting-started",
    title: "Getting Started",
    description:
      "Set up the starter kit locally: prerequisites, environment variables, database migration, and first run.",
    category: "Getting Started",
    updated: "2026-08-25",
    body: [
      {
        type: "p",
        text: "This guide gets a fresh clone running locally with auth, admin panel, and uploads working end-to-end.",
      },
      { type: "h2", text: "Prerequisites" },
      {
        type: "list",
        items: [
          "Bun (the package manager for this project — package.json uses bun.lock)",
          "PostgreSQL 14+ running locally or remotely",
          "Node.js is not required directly; Bun handles the runtime tooling",
        ],
      },
      { type: "h2", text: "Setup" },
      {
        type: "code",
        lang: "bash",
        code: "bun install\ncp .env.example .env   # fill in DATABASE_URL and secrets\nbunx prisma migrate dev\nbun run dev",
      },
      {
        type: "p",
        text: "Open http://localhost:3000, sign up at /signup, verify your email, and you land on /dashboard.",
      },
      { type: "h2", text: "Environment variables" },
      {
        type: "table",
        headers: ["Variable", "Purpose"],
        rows: [
          ["DATABASE_URL", "Postgres connection (standard postgres:// URL)"],
          [
            "BETTER_AUTH_SECRET",
            "Secret used to sign Better Auth sessions/tokens",
          ],
          ["EMAIL_PROVIDER", '"nodemailer" or "resend" — email abstraction'],
          ["UPLOAD_PROVIDER", '"cloudinary" | "r2" | "s3" | "local"'],
          ["NEXT_PUBLIC_SITE_URL", "Canonical site URL used in metadata"],
        ],
      },
      {
        type: "note",
        variant: "info",
        text: ".env is gitignored. .env.example is the only template committed to the repo.",
      },
      { type: "h2", text: "Useful commands" },
      {
        type: "table",
        headers: ["Command", "What it does"],
        rows: [
          ["bun run dev", "Start the dev server"],
          ["bun run lint", "ESLint check"],
          ["bun run build", "Production build"],
          ["bun run db:test", "Database connection smoke test"],
          ["bun run db:seed", "Seed demo users, posts, categories, tags, org"],
          ["bun run db:studio", "Prisma Studio"],
          ["bun test:e2e", "Playwright end-to-end suite"],
        ],
      },
      { type: "h2", text: "Your first run, step by step" },
      {
        type: "list",
        ordered: true,
        items: [
          "Install Bun (curl -fsSL https://bun.sh/install | bash on macOS/Linux; the official installer on Windows)",
          "Clone the repo and run bun install",
          "Create a local Postgres database (any 14+ instance) and copy its standard postgres:// URL",
          "cp .env.example .env, then fill DATABASE_URL, BETTER_AUTH_SECRET (any long random string for dev), and NEXT_PUBLIC_SITE_URL=http://localhost:3000",
          "For email in dev, set EMAIL_PROVIDER=nodemailer with any SMTP creds — or use Resend test keys; verification links print to the server log if email is not configured",
          "Run bunx prisma migrate dev to create all tables from schema.prisma",
          "Optionally run bun run db:seed for loginable demo accounts (admin@example.com / editor@example.com / mod@example.com / user@example.com — all use password demo1234)",
          "Run bun run db:test to confirm the connection works before starting the app",
          "Start bun run dev and open http://localhost:3000",
        ],
      },
      { type: "h3", text: "Sign up and reach the dashboard" },
      {
        type: "list",
        ordered: true,
        items: [
          "Go to /signup and create an account with email + password",
          "Check your inbox (or dev logs) for the verification link and open it",
          "Log in at /login — you are redirected to the protected /dashboard",
          "Promote your account to admin to unlock /admin: update the user's role field directly via bun run db:studio, or use an existing admin session to assign roles at /admin/users",
          "Visit /admin to manage users and the media library",
        ],
      },
      {
        type: "note",
        variant: "info",
        text: 'If something fails at startup, it is almost always DATABASE_URL format. Use plain postgres://user:pass@host:5432/db — never prisma+postgres://.',
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    slug: "project-structure",
    title: "Project Structure",
    description:
      "Feature-sliced layout of the repository: app routes, feature modules, lib services, and Prisma schema.",
    category: "Getting Started",
    updated: "2026-08-25",
    body: [
      {
        type: "p",
        text: "The repo follows feature-sliced design on top of the Next.js App Router. Each domain lives in its own slice with clear boundaries.",
      },
      {
        type: "code",
        lang: "text",
        code: `app/                 # App Router pages + route groups
  (protected)/       # requires a server-side session check
  api/[[...route]]/  # single Hono catch-all API surface
features/<feature>/  # domain modules
  components/ hooks/ lib/ schemas/ types/ api/
components/ui/       # shadcn/ui primitives (do not modify)
lib/                 # site.ts, auth.ts, prisma.ts, services/
prisma/              # schema.prisma (source of truth), seed, migrations
action/              # Server Actions for mutations
providers/           # React providers (theme via next-themes)
scripts/             # Laravel-style generators (make.ts)
docs/                # engineering runbooks (DEPLOYMENT, PERFORMANCE)
context/             # AI-assistant project context`,
      },
      { type: "h2", text: "Key rules" },
      {
        type: "list",
        items: [
          "Server Components are the default; add \"use client\" only for interactivity",
          "All API endpoints mount through the Hono catch-all — no ad-hoc route handlers",
          "components/ui/ is treated as generated shadcn output and must not be edited",
          "Site metadata comes from lib/site.ts — never hardcode it in layouts",
        ],
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    slug: "authentication",
    title: "Authentication & RBAC",
    description:
      "Better Auth setup, email verification, password reset, protected route groups, and role-based access control.",
    category: "Architecture",
    updated: "2026-08-25",
    body: [
      {
        type: "p",
        text: "Authentication is handled entirely by Better Auth: server config in lib/auth.ts, client in lib/auth-client.ts. Sessions are validated server-side before any sensitive operation.",
      },
      { type: "h2", text: "Capabilities" },
      {
        type: "list",
        items: [
          "Email/password sign-up with email verification links",
          "Forgot / reset password flows",
          "admin plugin (USER/ADMIN roles) plus extended RBAC roles",
          "emailOTP plugin for one-time verification codes",
          "Rate limiting configured in the server config",
        ],
      },
      { type: "h2", text: "Roles" },
      {
        type: "table",
        headers: ["Role", "Typical access"],
        rows: [
          ["USER", "Own dashboard and settings"],
          ["VIEWER / EDITOR / MODERATOR", "Escalating content permissions"],
          ["ADMIN", "/admin user management, media library"],
          ["SUPER_ADMIN", "Full administrative control"],
        ],
      },
      { type: "h2", text: "Route protection" },
      {
        type: "p",
        text: "Protected pages live under the (protected)/ route group whose layout performs the session check once per request. Admin APIs re-verify the role server-side — client-side checks are never trusted alone.",
      },
      {
        type: "note",
        variant: "warning",
        text: "Every mutation boundary (Hono endpoint or Server Action) must validate input with Zod and check auth/ownership before acting.",
      },
      { type: "h2", text: "Email templates" },
      {
        type: "p",
        text: "Verification and password-reset emails use templates from features/mail/lib/templates.ts, sent through the provider abstraction in lib/services/email.ts (Nodemailer or Resend via EMAIL_PROVIDER).",
      },
      { type: "h2", text: "How to use it" },
      { type: "h3", text: "Sign up / log in from a client component" },
      {
        type: "code",
        lang: "ts",
        code: `import { authClient, useSession } from "@/lib/auth-client";

// Sign up (sends the verification email automatically)
const { data, error } = await authClient.signUp.email({
  email, password, name,
});

// Sign in
await authClient.signIn.email({ email, password });

// React hook — session state anywhere in the client tree
const { data: session } = useSession();
session?.user?.emailVerified; // boolean
(session?.user as { role?: string }).role; // current role`,
      },
      { type: "h3", text: "Protect a server route or page" },
      {
        type: "p",
        text: "The (protected)/ layout already does this for every page inside it. To check a session in any other Server Component or Route Handler, use the server-side API:",
      },
      {
        type: "code",
        lang: "ts",
        code: `import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const session = await auth.api.getSession({
  headers: await headers(), // forwards the request cookies
});
if (!session?.user) redirect("/login");`,
      },
      { type: "h3", text: "Guard admin surfaces" },
      {
        type: "code",
        lang: "ts",
        code: `import { checkIsAdmin } from "@/lib/auth/admin";

// Server Component / layout gate
if (!(await checkIsAdmin())) redirect("/dashboard");

// Permission-level checks also live here:
// canSetRole(), canBanUsers(), canUploadFiles(), hasPermission(...)
import { hasPermission } from "@/lib/auth/admin";`,
      },
      { type: "h3", text: "Enable Google sign-in" },
      { type: "p", text: "Google OAuth is optional and enabled automatically once the credentials are present in the environment." },
      {
        type: "list",
        items: [
          "Create an OAuth client at console.cloud.google.com → APIs & Services → Credentials",
          "Add an Authorized redirect URI: https://nextjs-starter-kit-gules.vercel.app/api/auth/callback/google (plus http://localhost:3000/api/auth/callback/google for local dev)",
          "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables",
          "Redeploy so the new env vars are picked up — the Google buttons appear on /login and /signup only when both are set",
          "While the OAuth consent screen is in Testing mode, only explicitly listed test users can sign in with Google",
        ],
      },
      {
        type: "note",
        variant: "warning",
        text: "Client-side role checks are cosmetic only. Every Hono endpoint re-reads the session from cookies server-side (see lib/auth/api-helpers.ts) before returning data.",
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    slug: "api-and-rpc",
    title: "API & Hono RPC",
    description:
      "Single Hono catch-all API surface, Zod validation, consistent response shape, and type-safe RPC clients.",
    category: "Architecture",
    updated: "2026-08-25",
    body: [
      {
        type: "p",
        text: "All API endpoints mount through one catch-all route handler: app/api/[[...route]]/route.ts. Sub-route modules (posts, admin, upload, webhooks, api-keys, notifications, search, health, cron) are chained onto the base Hono app.",
      },
      {
        type: "note",
        variant: "info",
        text: "Because everything mounts under basePath /api, RPC calls go through client.api.posts.* etc., even though the files live at the route root.",
      },
      { type: "h2", text: "Endpoint rules" },
      {
        type: "list",
        items: [
          'Validate request input with @hono/zod-validator before any logic runs',
          "Enforce auth and ownership before any mutation",
          'Return a consistent shape: { success: boolean, data?: T, error?: { code, message } }',
          "Export AppType from route.ts so clients get full type inference",
        ],
      },
      { type: "h2", text: "Calling the API" },
      {
        type: "code",
        lang: "ts",
        code: `import { hc } from "hono/client";
import type { AppType } from "@/app/api/[[...route]]/route";

const client = hc<AppType>(""); // same-origin; basePath handled internally
const res = await client.api.posts.$get();
const { success, data } = await res.json();`,
      },
      { type: "h2", text: "Health check" },
      {
        type: "p",
        text: "A health endpoint exists at /api/health for uptime monitoring and cron-based service checks.",
      },
      { type: "h2", text: "Add a new endpoint" },
      {
        type: "p",
        text: "Create a sub-route module, then chain it onto the base app in route.ts. Follow the posts.ts pattern:",
      },
      {
        type: "code",
        lang: "ts",
        code: `// 1. app/api/[[...route]]/widgets.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "@/lib/auth";

export const widgets = new Hono()
  .get("/", async (c) => {
    // ...query via lib/prisma.ts singleton
    return c.json({ success: true, data: [] });
  })
  .post(
    "/",
    zValidator("json", z.object({ title: z.string().min(1) })),
    async (c) => {
      const session = await auth.api.getSession({ headers: c.req.raw.headers });
      if (!session?.user)
        return c.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "Auth required" } },
          401,
        );
      const body = c.req.valid("json");
      // ...create
      return c.json({ success: true, data: { id: "new-id", ...body } }, 201);
    },
  );

// 2. In route.ts, chain it:
// app.route("/widgets", widgets);`,
      },
      { type: "h2", text: "Consume it from the client" },
      {
        type: "note",
        variant: "warning",
        text: "The basePath gotcha: all routes mount under /api (basePath in route.ts), so RPC paths are client.api.<segment>.* even though files live at the route root. client.api.widgets is /api/widgets — never write client.widgets.",
      },
      {
        type: "code",
        lang: "ts",
        code: `import { client } from "@/lib/api/hono-client"; // hc<AppType>("") singleton

// GET /api/widgets
const res = await client.api.widgets.$get();
const { success, data } = await res.json();

// POST /api/widgets — fully typed payload + response
const created = await client.api.widgets.$post({
  json: { title: "Hello" },
});
const { data: widget } = await created.json();`,
      },
      { type: "h2", text: "Common patterns" },
      {
        type: "list",
        items: [
          "Pair the RPC call with TanStack Query for caching/invalidation in client components",
          "Call Server Components directly with Prisma instead of fetch-ing your own API when no client interactivity is needed",
          "Log mutations to the audit log via lib/services/activity.ts",
        ],
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    slug: "database",
    title: "Database (Prisma 7)",
    description:
      "Prisma 7 with the prisma-client generator, pg driver adapter, singleton client, and core data models.",
    category: "Architecture",
    updated: "2026-08-25",
    body: [
      {
        type: "p",
        text: "prisma/schema.prisma is the single source of truth. The project uses the modern prisma-client generator (not prisma-client-js), outputs to lib/generated/prisma, and connects through @prisma/adapter-pg.",
      },
      { type: "h2", text: "Conventions" },
      {
        type: "list",
        items: [
          'provider = "prisma-client" — never prisma-client-js',
          "Import from ./generated/prisma/client — always with the /client suffix",
          "No url in the datasource block — connection config lives in prisma.config.ts",
          "Standard TCP URLs (postgres://...) only — never prisma+postgres://",
          "Use the global singleton from lib/prisma.ts; never instantiate PrismaClient directly",
          "Wrap all database calls in try-catch blocks",
        ],
      },
      { type: "h2", text: "Core models" },
      {
        type: "table",
        headers: ["Domain", "Models"],
        rows: [
          ["Identity", "User (role, ban, soft delete), Session, Account, Verification"],
          ["Organizations", "Organization, Member, Invitation"],
          ["Blog", "Post, Category, Tag, PostTag"],
          ["Ops", "SystemMetric, Notification, AuditLog, RateLimit"],
          ["Preferences", "UserPreferences"],
          ["Integrations", "ApiKey, Webhook, WebhookDelivery, FileUpload"],
        ],
      },
      { type: "h2", text: "Workflow" },
      {
        type: "code",
        lang: "bash",
        code: "bunx prisma migrate dev   # after schema changes\nbun prisma generate      # regenerate client (also runs postinstall)\nbun run db:test          # connection smoke test\nbun run db:studio        # browse data",
      },
      {
        type: "note",
        variant: "info",
        text: "Only metadata and URLs live in the database; uploaded binaries go to blob storage (Cloudinary/R2/S3/local) tracked by the FileUpload model.",
      },
      { type: "h2", text: "Adding a model + migration" },
      {
        type: "code",
        lang: "bash",
        code: '# 1. Edit prisma/schema.prisma — add your model\n#    model Product {\n#      id        String   @id @default(cuid())\n#      name      String\n#      createdAt DateTime @default(now())\n#    }\nbunx prisma migrate dev --name add_product  # 2. creates + applies migration, regenerates client\nbun run db:test                             # 3. smoke-test the connection',
      },
      {
        type: "p",
        text: 'The generated client lands in lib/generated/prisma. Import the singleton and query immediately:',
      },
      {
        type: "code",
        lang: "ts",
        code: `import prisma from "@/lib/prisma";

export async function listProducts() {
  try {
    return await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  } catch (error) {
    console.error("[listProducts]", error);
    return []; // never let DB errors crash a page render
  }
}`,
      },
      {
        type: "note",
        variant: "warning",
        text: "Do not add url to the datasource block or use prisma+postgres:// URLs — connection config lives in prisma.config.ts as a plain TCP postgres:// string.",
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    slug: "cms-features",
    title: "CMS Features",
    description:
      "Rich text editor (TipTap), image cropping pipeline, print styles, social sharing, and theme presets.",
    category: "Features",
    updated: "2026-08-25",
    body: [
      {
        type: "p",
        text: "The kit ships a small CMS workstream: DB-stored blog posts with an admin editor, media cropping, print-friendly rendering, social sharing, and multiple color themes.",
      },
      { type: "h2", text: "Rich text editor" },
      {
        type: "p",
        text: "features/editor/ wraps TipTap with schemas, hooks, and components. Posts are stored as TipTap JSON in the Post model and rendered server-side to HTML via @tiptap/html, styled by the shared .prose-post class in globals.css.",
      },
      { type: "h2", text: "Media & cropping" },
      {
        type: "p",
        text: "features/media/ provides a crop pipeline (react-easy-crop based): uploaded images pass through UploadWithCrop before storage, and the admin media library manages records. Editor-side image insertion can reuse the crop hook via uploadImageFile() in features/editor/hooks/use-editor.ts.",
      },
      { type: "h2", text: "Print" },
      {
        type: "p",
        text: "A PrintButton component triggers window.print(); centralized @media print rules in globals.css force light tokens, hide chrome elements, expand link URLs, and prevent awkward page breaks.",
      },
      { type: "h2", text: "Social sharing" },
      {
        type: "p",
        text: "features/social/ offers ShareButtons (X, Facebook, LinkedIn, WhatsApp via react-share) and a ShareMenu that uses the native navigator.share on capable devices with a copy-link fallback. Blog post metadata already emits full Open Graph/Twitter tags from generateMetadata.",
      },
      { type: "h2", text: "Themes" },
      {
        type: "p",
        text: "Four oklch presets (Default, Sepia, Nord, Rosé Pine) are defined as token sets under [data-theme] selectors in globals.css. The preset list lives in lib/site.ts (themePresets); persistence is localStorage-only via features/nav/lib/theme-preset.ts, applied as dataset.theme on <html>. Light/Dark/System mode comes from next-themes.",
      },
      { type: "h2", text: "How to use it" },
      { type: "h3", text: "Author a post end-to-end" },
      {
        type: "list",
        ordered: true,
        items: [
          "Log in as an admin and go to /admin/posts",
          "Click New post — the TipTap editor opens with title + slug + content fields; type rich text (headings, lists, code blocks, images) directly",
          "Click Save/Publish — content is stored as TipTap JSON on the Post record with status PUBLISHED and a unique slug",
          "View the public page at /blog/<slug> — rendered server-side to HTML and styled by .prose-post",
          "Use ShareButtons / ShareMenu at the bottom of the post page for X/Facebook/LinkedIn/WhatsApp or native sharing, and PrintButton for a print-optimized layout",
        ],
      },
      { type: "h3", text: "Upload a cropped image" },
      {
        type: "list",
        ordered: true,
        items: [
          "Open /admin/media and upload any PNG/JPEG/WebP under 10MB",
          "The UploadWithCrop modal appears — drag/zoom to frame the crop region",
          "Confirming uploads through lib/services/upload.ts to the active UPLOAD_PROVIDER and records metadata in FileUpload; the new item is prepended to the grid",
          "In the editor, image insertion goes through uploadImageFile() in features/editor/hooks/use-editor.ts — that hook is the documented place to wire in editor-side cropping",
        ],
      },
      { type: "h3", text: "Switch themes programmatically" },
      {
        type: "code",
        lang: "ts",
        code: `import { setThemePreset, getThemePreset } from "@/features/nav/lib/theme-preset";
// or let users do it via the ModeToggle dropdown in the navbar

setThemePreset("nord"); // sets document.documentElement.dataset.theme
getThemePreset();       // reads localStorage key "theme-preset"; falls back to default`,
      },
      {
        type: "note",
        variant: "info",
        text: "Presets stack on top of light/dark mode: pick Sepia + Dark and every token resolves from the [data-theme=\"sepia\"] palette's dark values. Any UI built only from tokens (bg-muted, border-border, text-foreground...) inherits presets automatically.",
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    slug: "cli-generators",
    title: "CLI Generators",
    description:
      "Laravel-inspired artisan make:* scaffolding scripts for models, migrations, controllers, components, and more.",
    category: "Features",
    updated: "2026-08-25",
    body: [
      {
        type: "p",
        text: "scripts/make.ts implements Laravel-style generators tuned to this repo's conventions. They scaffold correctly-shaped files so you don't copy-paste boilerplate.",
      },
      {
        type: "table",
        headers: ["Command", "Generates"],
        rows: [
          ["bun run make:model -- <Name>", "Prisma model snippet + typed module stub"],
          ["bun run make:migration -- <name>", "Migration skeleton"],
          ["bun run make:controller -- <name>", "Hono sub-route module wired to Zod validators"],
          ["bun run make:component -- <name>", "Component in the appropriate features/ slice"],
          ["bun run make:action -- <name>", "Server Action with Zod validation"],
          ["bun run make:seeder -- <name>", "Prisma seeder file"],
          ["bun run make:hook -- <name>", "Client hook in features/<feature>/hooks/"],
          ["bun run make:schema -- <name>", "Zod schema module"],
        ],
      },
      {
        type: "note",
        variant: "warning",
        text: "Generated migrations still need bunx prisma migrate dev to apply, and generated Prisma model snippets must be added to schema.prisma manually before generating the client.",
      },
      { type: "h2", text: "A realistic workflow" },
      {
        type: "p",
        text: "Adding a Product domain, from scaffold to typed service usage:",
      },
      {
        type: "code",
        lang: "bash",
        code: "bun run make:model -- Product        # prints a Prisma model snippet + module stub\nbun run make:migration -- add-product  # migration skeleton in prisma/migrations flow",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Paste the generated model snippet into prisma/schema.prisma and adjust fields/relations",
          "Run bunx prisma migrate dev --name add_product to apply the schema change",
          "The client regenerates into lib/generated/prisma automatically (or run bun prisma generate)",
          "Query it anywhere via the singleton: import prisma from \"@/lib/prisma\"; then await prisma.product.findMany() — fully typed",
          "Expose it over the API with a Hono sub-route (see API & Hono RPC) or a Server Action",
          "Seed sample rows with bun run make:seeder -- product, fill the generated seeder, run it via tsx",
        ],
      },
      {
        type: "note",
        variant: "warning",
        text: "Generators write files; they never edit schema.prisma or run migrations for you. Always finish with bunx prisma migrate dev.",
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    slug: "deployment",
    title: "Deployment",
    description:
      "Deploying to Vercel with Resend for transactional email and AWS S3 for uploads; Neon recommended for Postgres.",
    category: "Operations",
    updated: "2026-08-25",
    body: [
      {
        type: "p",
        text: "Target platform is Vercel (zero-config Next.js deploy — no vercel.json needed). Production defaults: Resend for email, AWS S3 for uploads, managed Postgres over standard TCP (Neon recommended). Full details: docs/DEPLOYMENT.md.",
      },
      {
        type: "note",
        variant: "info",
        text: "Current production deployment: https://nextjs-starter-kit-gules.vercel.app (first deploy 2026-08-25) — use as the live reference when setting NEXT_PUBLIC_* URL variables.",
      },
      { type: "h2", text: "Provider configuration" },
      {
        type: "table",
        headers: ["Concern", "Env var", "Production value"],
        rows: [
          ["Email", 'EMAIL_PROVIDER', '"resend"'],
          ["Uploads", 'UPLOAD_PROVIDER', '"s3"'],
          ["Database", "DATABASE_URL", "Managed Postgres TCP URL (Neon)"],
        ],
      },
      { type: "h2", text: "Resend" },
      {
        type: "list",
        items: [
          "RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_FROM_NAME",
          "Use a verified sending domain in production",
          "Test addresses: delivered@resend.dev, bounced@resend.dev",
          "Rate limit: 5 requests/second per team",
        ],
      },
      { type: "h2", text: "S3" },
      {
        type: "list",
        items: [
          "S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET_NAME, S3_PUBLIC_DOMAIN",
          "Signed URLs supported via @aws-sdk/s3-request-presigner",
          "R2 works through the same SDK (region auto) if you switch providers",
        ],
      },
      { type: "h2", text: "Checklist" },
      {
        type: "list",
        ordered: true,
        items: [
          "Provision the database and set DATABASE_URL (standard postgres:// URL)",
          "Run migrations against the production database",
          "Set BETTER_AUTH_SECRET and NEXT_PUBLIC_SITE_URL to the real domain",
          "Configure Resend + S3 credentials",
          "Deploy to Vercel and verify /api/health",
        ],
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    slug: "performance-methodology",
    title: "Performance Methodology",
    description:
      "Evidence-first performance loop: measure → diagnose → optimize → verify, with classification rules and baselines.",
    category: "Operations",
    updated: "2026-08-25",
    body: [
      {
        type: "p",
        text: "Performance changes in this repo are evidence-driven. Never optimize without a measured baseline. Full runbook: docs/PERFORMANCE.md.",
      },
      { type: "h2", text: "The loop" },
      {
        type: "list",
        ordered: true,
        items: [
          "Observe — reproduce the symptom and record it",
          "Measure — capture baseline numbers (Metric + Before + Target stated before changing anything)",
          "Profile — find where time/bundle/memory actually goes",
          "Correlate — connect profile output to the symptom",
          "Hypothesize → Validate — prove the cause before fixing",
          "Fix → Verify — re-measure against the baseline",
        ],
      },
      { type: "h2", text: "Ground rules" },
      {
        type: "list",
        items: [
          "Label findings FACT / INFERENCE / HYPOTHESIS / RECOMMENDATION — never present inference as fact",
          "No timeout bumps, no speculative indexes (EXPLAIN ANALYZE first), no blind caching, no framework swaps without profiling evidence",
          '"Insufficient evidence to optimize" is a valid outcome',
          "Prefer Server Components for data fetching; dynamic-import heavy client components",
          "Invalidate caches explicitly with revalidatePath / revalidateTag",
        ],
      },
      {
        type: "note",
        variant: "info",
        text: "Every optimization PR states: Metric, Before value, Target value, and the After measurement proving the change worked.",
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    slug: "testing",
    title: "Testing",
    description:
      "Playwright end-to-end suite covering auth flows, protected routes, and admin access; lint/build gates.",
    category: "Operations",
    updated: "2026-08-25",
    body: [
      {
        type: "p",
        text: "End-to-end tests use Playwright (@playwright/test) with specs in tests/e2e/. The chromium headless shell must be installed locally before running.",
      },
      {
        type: "code",
        lang: "bash",
        code: "bunx playwright install chromium   # one-time browser setup\nbun run build                     # build before e2e\nbun test:e2e                      # run the suite",
      },
      { type: "h2", text: "Coverage" },
      {
        type: "list",
        items: [
          "Auth flows (sign-up, login, logout)",
          "Protected routes redirect anonymous visitors",
          "Admin access control",
          "Both light and dark themes",
        ],
      },
      { type: "h2", text: "Verification gates" },
      {
        type: "table",
        headers: ["Gate", "Command"],
        rows: [
          ["Lint", "bun run lint"],
          ["Build", "bun run build"],
          ["DB smoke", "bun run db:test"],
          ["E2E", "bun test:e2e"],
        ],
      },
      {
        type: "note",
        variant: "warning",
        text: "Unit/integration testing beyond Playwright E2E is minimal today; external services (email, storage) should be mocked when added.",
      },
    ],
  },
];
