import { PrismaClient, Prisma } from "../lib/generated/prisma/client";
import { AuditAction, PostStatus, UserRole } from "../lib/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

// Helper to generate random data
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const slugify = (input: string) =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Sample data
const FIRST_NAMES = [
  "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry",
  "Ivy", "Jack", "Kate", "Leo", "Mia", "Noah", "Olivia", "Peter",
  "Quinn", "Rose", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xavier",
  "Yara", "Zack", "Anna", "Brian", "Chloe", "David", "Emma", "Felix",
  "Gina", "Hugo", "Iris",
];
const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
  "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright",
];

const POST_TITLES = [
  "Getting Started with Next.js 16",
  "Mastering TypeScript Strict Mode",
  "Authentication Patterns with Better Auth",
  "Scaling PostgreSQL with Prisma 7",
  "Building Reusable UI Components",
  "Designing Clean REST APIs with Hono",
  "The Complete Guide to Testing",
  "Optimizing Bundle Size in Production",
  "Server Components Deep Dive",
  "Real-Time Features with WebSockets",
  "State Management in 2026",
  "Building a Design System from Scratch",
  "Database Migrations Without Fear",
  "Monitoring and Observability 101",
  "Accessibility for Modern Web Apps",
];

const CATEGORIES = [
  { name: "Next.js", description: "Framework guides and tutorials" },
  { name: "TypeScript", description: "Type-safe development practices" },
  { name: "Authentication", description: "Auth flows and security" },
  { name: "Database", description: "Data modeling and optimization" },
  { name: "UI/UX", description: "Design and component patterns" },
  { name: "DevOps", description: "Deployment and operations" },
];

const TAGS = [
  "tutorial", "guide", "beginner", "advanced", "best-practices",
  "performance", "security", "architecture", "open-source", "tips",
];

const AUDIT_ACTIONS: AuditAction[] = [
  "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "REGISTER",
  "SETTINGS_UPDATE", "ROLE_CHANGE", "FILE_UPLOAD", "BAN",
];

const ENTITY_TYPES = ["User", "Post", "Category", "Tag", "Settings", "Notification"];

const generateUser = (
  firstName: string,
  lastName: string,
  role: UserRole = "USER",
): Prisma.UserCreateInput => ({
  id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: `${firstName} ${lastName}`,
  email: generateEmail(firstName, lastName),
  emailVerified: true,
  role,
});

const generateEmail = (firstName: string, lastName: string) =>
  `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

const generatePostContent = (title: string) => {
  const sections = [
    {
      heading: "Introduction",
      body: `Every great product starts with a clear understanding of the problem it solves. In this guide, we explore how "${title}" fits into a modern, production-ready stack and the decisions that make it scalable, maintainable, and pleasant to work with.`,
    },
    {
      heading: "Why This Matters",
      body: "The ecosystem moves fast. By grounding our choices in established patterns and real-world constraints, we avoid churn and keep our foundations stable for years to come.",
    },
    {
      heading: "Implementation",
      body: "We walk through a practical implementation step by step: setting up the environment, modeling the domain, wiring the API layer, and finally composing the user interface with accessibility and performance in mind.",
    },
    {
      heading: "Testing & Verification",
      body: "No feature is complete until it is verified. We cover unit tests, integration tests, and end-to-end checks that give us confidence to ship with every deploy.",
    },
    {
      heading: "Conclusion",
      body: "Great software is the result of small, deliberate decisions compounding over time. Apply these patterns to your own projects and iterate relentlessly.",
    },
  ];

  return sections
    .map(
      (s, i) =>
        `${i + 1}. **${s.heading}**\n\n${s.body}\n\n---\n`,
    )
    .join("\n");
};

export async function main() {
  console.log("🌱 Starting database seed...\n");

  // 1. Create superuser admin
  const ADMIN_EMAIL = "admin@demo.com";
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "Admin Demo",
      role: "ADMIN",
      emailVerified: true,
    },
    create: {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: "Admin Demo",
      email: ADMIN_EMAIL,
      emailVerified: true,
      role: "ADMIN",
    },
  });
  console.log(`✅ Created admin: ${admin.email} (${admin.role})`);

  // 2. Create additional admin users
  const adminNames = [
    { first: "Admin", last: "User" },
    { first: "System", last: "Admin" },
    { first: "Super", last: "Admin" },
    { first: "Master", last: "Admin" },
    { first: "Head", last: "Admin" },
  ];

  const admins: string[] = [admin.id];
  for (const { first, last } of adminNames) {
    const email = generateEmail(first, last);
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: generateUser(first, last, "ADMIN"),
    });
    admins.push(user.id);
    console.log(`✅ Created admin: ${user.email}`);
  }

  // 3. Create regular users (50 users)
  console.log("\n📋 Creating users...");
  const users: string[] = [];
  for (let i = 0; i < 50; i++) {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const user = await prisma.user.upsert({
      where: { email: generateEmail(firstName, lastName) },
      update: {},
      create: generateUser(firstName, lastName),
    });
    users.push(user.id);
  }
  console.log(`✅ Created ${users.length} users`);

  const allUserIds = [...admins, ...users];

  // 4. Create categories
  console.log("\n🏷️ Creating categories...");
  const categoryIds: Record<string, string> = {};
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
    categoryIds[category.name] = created.id;
  }
  console.log(`✅ Created ${CATEGORIES.length} categories`);

  // 5. Create tags
  console.log("\n🔖 Creating tags...");
  const tagIds: Record<string, string> = {};
  for (const tag of TAGS) {
    const created = await prisma.tag.upsert({
      where: { slug: tag },
      update: {},
      create: { name: tag.replace(/-/g, " "), slug: tag },
    });
    tagIds[tag] = created.id;
  }
  console.log(`✅ Created ${TAGS.length} tags`);

  // 6. Create blog posts
  console.log("\n📝 Creating blog posts...");
  const categoryNames = Object.keys(categoryIds);
  const postAuthors = [...admins, ...users.slice(0, 10)];
  let postCount = 0;

  for (let i = 0; i < POST_TITLES.length; i++) {
    const title = POST_TITLES[i];
    const slug = slugify(title);
    const categoryName = randomElement(categoryNames);
    const authorId = randomElement(postAuthors);
    const published = i % 4 !== 0; // 75% published
    const tagSubset = TAGS.slice(0, randomInt(2, 5));

    const post = await prisma.post.upsert({
      where: { slug },
      update: {},
      create: {
        title,
        slug,
        excerpt: `A practical, in-depth look at ${title.toLowerCase()}, covering patterns, pitfalls, and production-ready examples.`,
        content: generatePostContent(title),
        status: published ? "PUBLISHED" : "DRAFT",
        publishedAt: published ? randomDate(new Date(2025, 0, 1), new Date()) : null,
        featured: i < 3,
        viewCount: randomInt(100, 5000),
        authorId,
        categoryId: categoryIds[categoryName],
        metaTitle: `${title} | Starter Kit Blog`,
        metaDescription: `Learn about ${title.toLowerCase()} with practical examples and production patterns.`,
        tags: {
          create: tagSubset.map((tag) => ({ tagId: tagIds[tag] })),
        },
      },
    });
    postCount++;
    console.log(`✅ Created post: ${post.title} (${post.status})`);
  }
  console.log(`✅ Created ${postCount} posts`);

  // 7. Create audit logs
  console.log("\n📝 Creating audit logs...");
  let auditCount = 0;
  for (const userId of allUserIds) {
    const numLogs = randomInt(3, 10);
    for (let i = 0; i < numLogs; i++) {
      const action = randomElement(AUDIT_ACTIONS);
      const entityType = randomElement(ENTITY_TYPES);
      await prisma.auditLog.create({
        data: {
          action,
          entityType,
          entityId: `entity_${Math.random().toString(36).substr(2, 8)}`,
          title: `${action} ${entityType}`,
          description: `Automated seed entry: ${action} performed on ${entityType.toLowerCase()} ${i + 1}`,
          oldValues: Math.random() > 0.5 ? { previous: "value" } : undefined,
          newValues: Math.random() > 0.5 ? { new: "value" } : undefined,
          ipAddress: `192.168.${randomInt(0, 255)}.${randomInt(1, 254)}`,
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          createdById: userId,
        },
      });
      auditCount++;
    }
  }
  console.log(`✅ Created ${auditCount} audit logs`);

  // 8. Create notifications
  console.log("\n🔔 Creating notifications...");
  const notificationTypes = ["system", "update", "alert", "info"];
  let notificationCount = 0;
  for (const userId of allUserIds) {
    const numNotifications = randomInt(3, 8);
    for (let i = 0; i < numNotifications; i++) {
      await prisma.notification.create({
        data: {
          title: `Notification ${i + 1}`,
          description: `This is notification number ${i + 1} for user`,
          type: randomElement(notificationTypes),
          read: Math.random() > 0.4,
          readAt:
            Math.random() > 0.6
              ? randomDate(new Date(2025, 0, 1), new Date())
              : null,
          userId,
        },
      });
      notificationCount++;
    }
  }
  console.log(`✅ Created ${notificationCount} notifications`);

  // 9. Create system metrics (monitoring demo data)
  console.log("\n📊 Creating system metrics...");
  const services = ["database", "auth", "api", "email", "upload"];
  let metricCount = 0;
  const now = Date.now();
  for (let hour = 0; hour < 24; hour++) {
    for (const service of services) {
      const ok = Math.random() > 0.08;
      await prisma.systemMetric.create({
        data: {
          service,
          status: ok ? "ok" : Math.random() > 0.5 ? "degraded" : "down",
          responseTime: ok ? randomInt(20, 400) : randomInt(400, 3000),
          metadata: { check: `hourly-${hour}`, region: "us-east" },
          recordedAt: new Date(now - (23 - hour) * 60 * 60 * 1000),
        },
      });
      metricCount++;
    }
  }
  console.log(`✅ Created ${metricCount} system metrics`);

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("🎉 Seed completed successfully!");
  console.log("=".repeat(50));
  console.log(`📊 Total records created:`);
  console.log(
    `   - Users: ${allUserIds.length} (${admins.length} admins, ${users.length} regular)`,
  );
  console.log(`   - Categories: ${CATEGORIES.length}`);
  console.log(`   - Tags: ${TAGS.length}`);
  console.log(`   - Posts: ${postCount}`);
  console.log(`   - Audit Logs: ${auditCount}`);
  console.log(`   - Notifications: ${notificationCount}`);
  console.log(`   - System Metrics: ${metricCount}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });