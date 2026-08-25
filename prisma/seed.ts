import { PrismaClient } from "../lib/generated/prisma/client";
import { PostStatus, UserRole } from "../lib/generated/prisma/enums";
import { hashPassword } from "better-auth/crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const DEMO_PASSWORD = "demo1234";

const slugify = (input: string) =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ----------------------------------------
// Demo users (all login with demo1234)
// ----------------------------------------

const DEMO_USERS: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}[] = [
  {
    id: "user_demo_admin",
    name: "Ada Admin",
    email: "admin@example.com",
    role: "SUPER_ADMIN",
  },
  {
    id: "user_demo_editor",
    name: "Eli Editor",
    email: "editor@example.com",
    role: "EDITOR",
  },
  {
    id: "user_demo_mod",
    name: "Mona Moderator",
    email: "mod@example.com",
    role: "MODERATOR",
  },
  {
    id: "user_demo_user",
    name: "Ursula User",
    email: "user@example.com",
    role: "USER",
  },
];

// ----------------------------------------
// Taxonomy
// ----------------------------------------

const CATEGORIES = [
  {
    name: "Getting Started",
    description: "First steps, setup guides, and onboarding walkthroughs.",
  },
  {
    name: "Advanced Topics",
    description: "Deep dives into patterns, performance, and architecture.",
  },
  {
    name: "DevOps",
    description: "Deployment, monitoring, and operational practices.",
  },
];

const TAGS = ["react", "typescript", "nextjs", "prisma", "security"];

// ----------------------------------------
// Posts — TipTap-compatible HTML bodies
// ----------------------------------------

type SeedPost = {
  title: string;
  excerpt: string;
  content: string;
  status: PostStatus;
  featured?: boolean;
  authorEmail: string;
  categoryName: string;
  tagSlugs: string[];
};

const htmlBody = (intro: string): string => `
<h2>Introduction</h2>
<p>${intro}</p>
<ul>
  <li>A concrete, production-ready setup</li>
  <li>Patterns that scale with your team</li>
  <li>Pitfalls to avoid along the way</li>
</ul>
<h2>Implementation</h2>
<p>The core of the approach is small and deliberate. Start from the data model, expose it through a typed API layer, and compose the UI on top:</p>
<pre><code class="language-ts">const posts = await prisma.post.findMany({
  where: { status: "PUBLISHED" },
  include: { author: true, tags: true },
  orderBy: { publishedAt: "desc" },
});</code></pre>
<p>From here you can extend with validation, caching, or richer queries without restructuring anything.</p>
<h2>Conclusion</h2>
<p>Small decisions compound. Apply the pattern, measure the result, and iterate.</p>
`;

const POSTS: SeedPost[] = [
  {
    title: "Welcome to the Starter Kit",
    excerpt:
      "A guided tour of what ships out of the box: auth, admin, API, blog, and more.",
    content: htmlBody(
      "This starter kit bundles authentication, an admin panel, a typed Hono API, and DB-backed blog content so you can start building features instead of foundations.",
    ),
    status: PostStatus.PUBLISHED,
    featured: true,
    authorEmail: "admin@example.com",
    categoryName: "Getting Started",
    tagSlugs: ["nextjs", "react"],
  },
  {
    title: "Signing In With the Demo Accounts",
    excerpt:
      "Every seeded account shares one password — learn which role does what.",
    content: htmlBody(
      "Four loginable demo accounts are seeded with distinct roles: SUPER_ADMIN, EDITOR, MODERATOR, and USER. All use the same password so you can test RBAC boundaries quickly.",
    ),
    status: PostStatus.PUBLISHED,
    authorEmail: "editor@example.com",
    categoryName: "Getting Started",
    tagSlugs: ["security"],
  },
  {
    title: "Modeling Blog Content in Prisma 7",
    excerpt:
      "Posts, categories, tags, and many-to-many relations modeled for real content workflows.",
    content: htmlBody(
      "Content lives in the database, not in files. The Post model carries TipTap-compatible HTML, while Category and Tag provide taxonomy via the PostTag join table.",
    ),
    status: PostStatus.PUBLISHED,
    authorEmail: "editor@example.com",
    categoryName: "Advanced Topics",
    tagSlugs: ["prisma", "typescript"],
  },
  {
    title: "Securing Every Mutation Boundary",
    excerpt:
      "Session checks, Zod validation, and audit logs form three layers of defense.",
    content: htmlBody(
      "Every protected operation validates the session server-side, parses input with Zod, and records an audit log entry. Skipping any one layer is how incidents start.",
    ),
    status: PostStatus.PUBLISHED,
    featured: true,
    authorEmail: "mod@example.com",
    categoryName: "Advanced Topics",
    tagSlugs: ["security", "react"],
  },
  {
    title: "Draft: Zero-Downtime Deploys on Vercel",
    excerpt:
      "Work-in-progress notes on migration ordering and preview environments.",
    content: htmlBody(
      "Draft notes on shipping schema changes safely: expand-and-contract migrations, preview deploys, and smoke tests before promotion to production.",
    ),
    status: PostStatus.DRAFT,
    authorEmail: "admin@example.com",
    categoryName: "DevOps",
    tagSlugs: ["nextjs"],
  },
  {
    title: "Monitoring Services With SystemMetric",
    excerpt:
      "How hourly health checks land in SystemMetric and surface on the dashboard.",
    content: htmlBody(
      "Cron jobs record per-service status and response time into SystemMetric every hour. The dashboard reads the last 24 hours to draw the availability timeline.",
    ),
    status: PostStatus.DRAFT,
    authorEmail: "user@example.com",
    categoryName: "DevOps",
    tagSlugs: ["typescript", "prisma"],
  },
];

async function seedUsers(hashedPassword: string) {
  const usersByEmail: Record<string, string> = {};
  for (const u of DEMO_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, emailVerified: true },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: true,
        role: u.role,
      },
    });
    // Credential Account row makes the user loginable via Better Auth.
    const accountId = `account_${u.id}`;
    const existingAccount = await prisma.account.findUnique({
      where: { id: accountId },
    });
    if (existingAccount) {
      await prisma.account.update({
        where: { id: accountId },
        data: {
          password: hashedPassword,
          // Self-heal legacy rows: Better Auth v1.7 requires accountId === user.id
          // and issuer === "local:credential" for credential sign-in.
          accountId: u.id,
          issuer: "local:credential",
        },
      });
    } else {
      await prisma.account.create({
        data: {
          id: accountId,
          accountId: u.id,
          providerId: "credential",
          userId: u.id,
          issuer: "local:credential",
          password: hashedPassword,
        },
      });
    }
    usersByEmail[u.email] = u.id;
    console.log(`✅ User ${u.email} (${u.role}) ready`);
  }
  return usersByEmail;
}

async function main() {
  console.log("🌱 Starting database seed...\n");

  const hashedPassword = await hashPassword(DEMO_PASSWORD);

  try {
    // 1. Users + credential accounts
    const usersByEmail = await seedUsers(hashedPassword);

    // 2. Categories
    const categoriesByName: Record<string, string> = {};
    for (const category of CATEGORIES) {
      const created = await prisma.category.upsert({
        where: { slug: slugify(category.name) },
        update: {},
        create: {
          name: category.name,
          slug: slugify(category.name),
          description: category.description,
        },
      });
      categoriesByName[category.name] = created.id;
    }
    console.log(`✅ ${CATEGORIES.length} categories ready`);

    // 3. Tags
    const tagsBySlug: Record<string, string> = {};
    for (const tag of TAGS) {
      const created = await prisma.tag.upsert({
        where: { slug: tag },
        update: {},
        create: { name: tag, slug: tag },
      });
      tagsBySlug[tag] = created.id;
    }
    console.log(`✅ ${TAGS.length} tags ready`);

    // 4. Posts (upsert by slug; keep existing tag links on re-run)
    for (const post of POSTS) {
      const slug = slugify(post.title);
      const existing = await prisma.post.findUnique({ where: { slug } });
      if (!existing) {
        await prisma.post.create({
          data: {
            title: post.title,
            slug,
            excerpt: post.excerpt,
            content: post.content,
            status: post.status,
            publishedAt: post.status === "PUBLISHED" ? new Date() : null,
            featured: post.featured ?? false,
            metaTitle: `${post.title} | Starter Kit Blog`,
            metaDescription: post.excerpt,
            authorId: usersByEmail[post.authorEmail],
            categoryId: categoriesByName[post.categoryName],
            tags: {
              create: post.tagSlugs.map((tagSlug) => ({
                tagId: tagsBySlug[tagSlug],
              })),
            },
          },
        });
      }
      console.log(`✅ Post "${post.title}" (${post.status}) ready`);
    }

    // 5. Organization + members + pending invitation
    const orgId = "org_demo_acme";
    const org = await prisma.organization.upsert({
      where: { id: orgId },
      update: { name: "Acme Inc." },
      create: { id: orgId, name: "Acme Inc.", slug: "acme-inc" },
    });

    await prisma.member.upsert({
      where: { organizationId_userId: { organizationId: orgId, userId: usersByEmail["admin@example.com"] } },
      update: { role: "owner" },
      create: {
        id: `member_${orgId}_admin`,
        organizationId: orgId,
        userId: usersByEmail["admin@example.com"],
        role: "owner",
      },
    });
    await prisma.member.upsert({
      where: { organizationId_userId: { organizationId: orgId, userId: usersByEmail["editor@example.com"] } },
      update: { role: "member" },
      create: {
        id: `member_${orgId}_editor`,
        organizationId: orgId,
        userId: usersByEmail["editor@example.com"],
        role: "member",
      },
    });
    console.log(`✅ Organization "${org.name}" ready (1 owner, 1 member)`);

    const invitationExists = await prisma.invitation.findFirst({
      where: { organizationId: orgId, email: "newhire@example.com" },
    });
    if (!invitationExists) {
      await prisma.invitation.create({
        data: {
          id: `invitation_${orgId}_pending`,
          organizationId: orgId,
          email: "newhire@example.com",
          role: "member",
          status: "pending",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          invitedById: usersByEmail["admin@example.com"],
        },
      });
    }
    console.log("✅ Pending invitation for newhire@example.com ready");

    // 6. Idempotent activity data scoped to demo users only
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.systemMetric.deleteMany();

    for (const [email, userId] of Object.entries(usersByEmail)) {
      await prisma.auditLog.create({
        data: {
          action: "REGISTER",
          entityType: "User",
          entityId: userId,
          title: `Demo seed: registered ${email}`,
          description: "Created by database seeder",
          newValues: { email, source: "seed" },
          ipAddress: "127.0.0.1",
          userAgent: "seed-script",
          createdById: userId,
        },
      });
      await prisma.notification.create({
        data: {
          title: "Welcome to the starter kit",
          description:
            "Your demo account was seeded. Explore the admin panel or the blog.",
          type: "system",
          read: false,
          userId,
        },
      });
    }
    console.log(`✅ Audit logs + notifications created for ${DEMO_USERS.length} demo users`);

    const services = ["database", "auth", "api", "email", "upload"];
    const now = Date.now();
    let metricCount = 0;
    for (let hour = 0; hour < 24; hour++) {
      for (const service of services) {
        const ok = (hour * services.length + metricCount) % 9 !== 0;
        await prisma.systemMetric.create({
          data: {
            service,
            status: ok ? "ok" : (hour % 2 === 0 ? "degraded" : "down"),
            responseTime: ok ? 40 + ((metricCount * 37) % 260) : 800 + metricCount * 11,
            metadata: { check: `seed-hourly-${hour}`, region: "us-east" },
            recordedAt: new Date(now - (23 - hour) * 60 * 60 * 1000),
          },
        });
        metricCount++;
      }
    }
    console.log(`✅ ${metricCount} system metrics created`);

    console.log("\n🎉 Seed completed successfully!");
    console.log("\n🔑 Demo logins (password: demo1234)");
    for (const u of DEMO_USERS) {
      console.log(`   - ${u.email} → ${u.role}`);
    }
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

main()
  .catch(() => process.exit(1))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
