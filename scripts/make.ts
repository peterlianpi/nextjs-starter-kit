/**
 * Artisan-style generator CLI (Laravel DX for this stack).
 *
 * Usage:
 *   bun scripts/make.ts <generator> <name>
 *   bun run make:model User
 *   bun run make:migration add_index_to_posts
 *
 * Generators:
 *   make:model       <PascalCaseName>   → Prisma model stub + feature service module
 *   make:migration   <snake_case_name>  → wraps `bunx prisma migrate dev --create-only`
 *   make:controller  <name>             → Hono sub-router (app/api/[[...route]]/)
 *   make:component   <PascalCaseName>   → Server Component (--client for client component)
 *   make:action      <name>             → Server Action with Zod + revalidatePath
 *   make:seeder      <name>             → Prisma seeder stub (prisma/seeders/)
 *   make:hook        <name>             → TanStack Query hook
 *   make:schema      <name>             → Zod schema
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

// ---------------------------------------------------------------------------
// Colored output helpers (ANSI)
// ---------------------------------------------------------------------------

type ColorCode = 32 | 33 | 36 | 31;

function colorize(text: string, code: ColorCode): string {
  return `\x1b[${code}m${text}\x1b[0m`;
}

const info = (msg: string): void => console.log(colorize(msg, 36)); // cyan
const success = (msg: string): void => console.log(colorize(msg, 32)); // green
const warn = (msg: string): void => console.log(colorize(msg, 33)); // yellow
const fail = (msg: string): void => console.error(colorize(msg, 31)); // red

function die(msg: string, hint?: string): never {
  fail(`ERROR: ${msg}`);
  if (hint) console.error(hint);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Naming helpers
// ---------------------------------------------------------------------------

/** "UserProfile" → "user-profile" */
function toKebabCase(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/** "user-profile" → "userProfile" */
function toCamelCase(kebab: string): string {
  return kebab.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** Naive English pluralization for table names / migration suffixes. */
function pluralize(word: string): string {
  if (/s$|x$|z$|ch$|sh$/.test(word)) return `${word}es`;
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  return `${word}s`;
}

interface NameValidationError {
  valid: boolean;
}

function validateModelName(name: string): NameValidationError & { reason?: string } {
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
    return {
      valid: false,
      reason: `Model names must be PascalCase (e.g. "BlogPost"), got "${name}".`,
    };
  }
  return { valid: true };
}

function validateMigrationName(name: string): NameValidationError & { reason?: string } {
  if (!/^[a-z][a-z0-9_]*$/.test(name)) {
    return {
      valid: false,
      reason: `Migration names must be snake_case (e.g. "add_soft_delete_to_post"), got "${name}".`,
    };
  }
  return { valid: true };
}

interface NameParts {
  pascal: string;
  kebab: string;
  camel: string;
}

/** Accepts PascalCase or kebab-case input and normalizes to all casings. */
function normalizeName(name: string): NameParts | null {
  if (!/^(?:[A-Z][A-Za-z0-9]*|[a-z][a-z0-9]*(?:-[a-z0-9]+)*)$/.test(name)) return null;
  const kebab = toKebabCase(name);
  const camel = toCamelCase(kebab);
  const pascal = kebab
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return { pascal, kebab, camel };
}

function validateComponentName(name: string): NameValidationError & { reason?: string } {
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
    return {
      valid: false,
      reason: `Component names must be PascalCase (e.g. "UserProfile"), got "${name}".`,
    };
  }
  return { valid: true };
}

function validateGenericName(name: string): NameValidationError & { reason?: string } {
  if (!normalizeName(name)) {
    return {
      valid: false,
      reason: `Names must be PascalCase or kebab-case (e.g. "BlogPost" or "blog-post"), got "${name}".`,
    };
  }
  return { valid: true };
}

/** Refuses to overwrite an existing file (duplicate-file refusal). */
function assertNotExists(filePath: string, label: string): void {
  if (existsSync(filePath)) {
    die(
      `${label} already exists at ${path.relative(process.cwd(), filePath)}.`,
      "Refusing to duplicate. Pick another name or edit the existing file."
    );
  }
}

/** Writes a file after creating its directory tree. */
function writeGeneratedFile(filePath: string, content: string): void {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
  success(`  ✔ created ${path.relative(process.cwd(), filePath)}`);
}

// ---------------------------------------------------------------------------
// Templates (pure string builders)
// ---------------------------------------------------------------------------

interface ModelTemplateContext {
  pascal: string;
  snakeTable: string;
}

/** Builds the Prisma model stub appended to prisma/schema.prisma. */
function buildPrismaModelStub(ctx: ModelTemplateContext): string {
  const { pascal, snakeTable } = ctx;
  return `
model ${pascal} {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("${snakeTable}")
}
`;
}

interface ServiceTemplateContext {
  pascal: string;
  kebab: string;
  camel: string;
}

/** Builds the feature service module with CRUD wrappers over the singleton. */
function buildServiceModule(ctx: ServiceTemplateContext): string {
  const { pascal, kebab, camel } = ctx;
  return `import prisma from "@/lib/prisma";

/**
 * CRUD service for the ${pascal} model.
 *
 * Generated by \`bun run make:model ${pascal}\`. Extend with domain-specific
 * queries as needed. All database calls follow the try-catch pattern from
 * context/code-standards.md.
 */

export interface FindMany${pascal}Options {
  skip?: number;
  take?: number;
}

export const ${camel}Service = {
  async findMany(options: FindMany${pascal}Options = {}) {
    try {
      return await prisma.${camel}.findMany({
        skip: options.skip,
        take: options.take,
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("[${kebab}-service] findMany failed:", error);
      throw new Error("Failed to fetch ${camel} records.");
    }
  },

  async findById(id: string) {
    try {
      return await prisma.${camel}.findUnique({ where: { id } });
    } catch (error) {
      console.error("[${kebab}-service] findById failed:", error);
      throw new Error("Failed to fetch ${camel} record.");
    }
  },

  async create(data: Parameters<typeof prisma.${camel}.create>[0]["data"]) {
    try {
      return await prisma.${camel}.create({ data });
    } catch (error) {
      console.error("[${kebab}-service] create failed:", error);
      throw new Error("Failed to create ${camel} record.");
    }
  },

  async update(id: string, data: Parameters<typeof prisma.${camel}.update>[0]["data"]) {
    try {
      return await prisma.${camel}.update({ where: { id }, data });
    } catch (error) {
      console.error("[${kebab}-service] update failed:", error);
      throw new Error("Failed to update ${camel} record.");
    }
  },

  async delete(id: string) {
    try {
      return await prisma.${camel}.delete({ where: { id } });
    } catch (error) {
      console.error("[${kebab}-service] delete failed:", error);
      throw new Error("Failed to delete ${camel} record.");
    }
  },
};
`;
}

interface ControllerTemplateContext {
  kebab: string;
  camel: string;
}

/** Builds the Hono sub-router stub (not auto-mounted — user wires it up). */
function buildControllerModule(ctx: ControllerTemplateContext): string {
  const { kebab, camel } = ctx;
  const Pascal = camel.charAt(0).toUpperCase() + camel.slice(1);
  return `import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

/**
 * Hono sub-router for ${kebab}.
 *
 * Generated by \`bun run make:controller ${kebab}\`. NOT auto-mounted.
 * Wire it into app/api/[[...route]]/route.ts:
 *
 *   import ${camel}Router from "./${kebab}";
 *
 *   const routes = app.route("/${kebab}", ${camel}Router);
 *
 * All endpoints validate input with @hono/zod-validator and return the
 * consistent response shape: { success, data?, error?: { code, message } }.
 */

const create${Pascal}Schema = z.object({
  name: z.string().min(1),
});

const ${camel} = new Hono()
  .get("/", (c) => {
    return c.json({ success: true, data: [] });
  })
  .post("/", zValidator("json", create${Pascal}Schema), async (c) => {
    const data = c.req.valid("json");
    // TODO: enforce auth/session, then persist via prisma singleton.
    return c.json({ success: true, data }, 201);
  });

export default ${camel};
`;
}

interface ComponentTemplateContext {
  pascal: string;
}

/** Builds the Server Component stub ("use client" only with --client flag). */
function buildComponentModule(ctx: ComponentTemplateContext, client: boolean): string {
  const { pascal } = ctx;
  const directive = client ? `"use client";\n\n` : "";
  return `${directive}/**
 * Generated by \`bun run make:component ${pascal}\`.
 */
export function ${pascal}() {
  return (
    <section>
      <h2 className="text-lg font-semibold">${pascal}</h2>
      {/* TODO: implement ${pascal}. */}
    </section>
  );
}
`;
}

interface ActionTemplateContext {
  kebab: string;
  camel: string;
}

/** Builds the Server Action stub with Zod validation + revalidatePath. */
function buildActionModule(ctx: ActionTemplateContext): string {
  const { kebab, camel } = ctx;
  const Pascal = camel.charAt(0).toUpperCase() + camel.slice(1);
  return `"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Server Actions for ${kebab}.
 *
 * Generated by \`bun run make:action ${kebab}\`. Validate all input with Zod,
 * enforce auth at every mutation boundary, and revalidate affected paths.
 */

const create${Pascal}Input = z.object({
  name: z.string().min(1),
  // TODO: extend fields to match your form schema.
});

export type Create${Pascal}Input = z.infer<typeof create${Pascal}Input>;

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export async function create${Pascal}(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = create${Pascal}Input.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message ?? "Invalid input.",
      },
    };
  }

  try {
    // TODO: session check via lib/auth.ts, then persist via prisma singleton.
    console.log("create${Pascal}", parsed.data);

    revalidatePath("/dashboard");
    return { success: true, data: { id: crypto.randomUUID() } };
  } catch (error) {
    console.error("[${kebab}-action] failed:", error);
    return { success: false, error: { code: "SERVER_ERROR", message: "Something went wrong." } };
  }
}
`;
}

interface SeederTemplateContext {
  camel: string;
}

/** Builds the Prisma seeder stub using the singleton. */
function buildSeederModule(ctx: SeederTemplateContext): string {
  const { camel } = ctx;
  const Pascal = camel.charAt(0).toUpperCase() + camel.slice(1);
  return `import prisma from "@/lib/prisma";

/**
 * Seeder for ${camel}.
 *
 * Generated by \`bun run make:seeder ${camel}\`. NOT auto-registered.
 * Wire it into prisma/seed.ts:
 *
 *   import { seed${Pascal} } from "./seeders/${camel}.seeder";
 *   await seed${Pascal}();
 */

export async function seed${Pascal}(): Promise<void> {
  try {
    console.log("Seeding ${camel}...");
    // TODO: insert records via prisma.${camel}.create / createMany.
  } catch (error) {
    console.error("[seed:${camel}] failed:", error);
    throw error;
  }
}
`;
}

interface HookTemplateContext {
  kebab: string;
  camel: string;
}

/** Builds the TanStack Query hook stub. */
function buildHookModule(ctx: HookTemplateContext): string {
  const { kebab, camel } = ctx;
  const Pascal = camel.charAt(0).toUpperCase() + camel.slice(1);
  return `"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * TanStack Query hook for ${kebab}.
 *
 * Generated by \`bun run make:hook ${kebab}\`.
 */

interface ${Pascal}Item {
  id: string;
  name: string;
}

async function fetch${Pascal}s(): Promise<${Pascal}Item[]> {
  const res = await fetch("/api/${kebab}");
  if (!res.ok) throw new Error("Failed to fetch ${kebab}");
  const body: { success: boolean; data?: ${Pascal}Item[] } = await res.json();
  if (!body.success || !body.data) throw new Error("Failed to fetch ${kebab}");
  return body.data;
}

export function use${Pascal}s() {
  return useQuery({
    queryKey: ["${kebab}"],
    queryFn: fetch${Pascal}s,
  });
}
`;
}

interface SchemaTemplateContext {
  kebab: string;
}

/** Builds the Zod schema stub. */
function buildSchemaModule(ctx: SchemaTemplateContext): string {
  const { kebab } = ctx;
  const Pascal = kebab
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  const camel = toCamelCase(kebab);
  return `import { z } from "zod";

/**
 * Zod schemas for ${kebab}.
 *
 * Generated by \`bun run make:schema ${kebab}\`. Use on both client and
 * server (defense in depth per context/code-standards.md).
 */

export const ${camel}Schema = z.object({
  name: z.string().min(1),
  // TODO: extend fields.
});

export type Create${Pascal}Input = z.infer<typeof ${camel}Schema>;
export type ${Pascal} = z.infer<typeof ${camel}Schema>;
`;
}

// ---------------------------------------------------------------------------
// Schema manipulation
// ---------------------------------------------------------------------------

const SCHEMA_PATH = path.resolve(process.cwd(), "prisma", "schema.prisma");

/** Returns true when a `model <name>` declaration already exists. */
function schemaHasModel(pascal: string): boolean {
  if (!existsSync(SCHEMA_PATH)) die("prisma/schema.prisma not found.");
  const schema = readFileSync(SCHEMA_PATH, "utf8");
  return new RegExp(`^model ${pascal}\\b`, "m").test(schema);
}

/**
 * Inserts the stub after the LAST existing model block (i.e. after all
 * models, but before anything declared after them such as trailing enums).
 */
function appendModelToSchema(stub: string): void {
  const schema = readFileSync(SCHEMA_PATH, "utf8");
  const modelBlockRe = /^model\s+\w+[\s\S]*?\n}/gm;
  let lastEnd = -1;
  let match: RegExpExecArray | null;
  while ((match = modelBlockRe.exec(schema)) !== null) {
    lastEnd = match.index + match[0].length;
  }
  if (lastEnd === -1) {
    // No existing models — append at end of file.
    writeFileSync(SCHEMA_PATH, schema.trimEnd() + "\n" + stub);
  } else {
    const next = schema.slice(lastEnd);
    const updated = schema.slice(0, lastEnd) + "\n" + stub + next;
    writeFileSync(SCHEMA_PATH, updated);
  }
}

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

interface GeneratorResult {
  ranMigration: boolean;
}

function generateModel(rawName: string, flags: string[]): GeneratorResult {
  const check = validateModelName(rawName);
  if (!check.valid) {
    die(check.reason ?? "Invalid model name.", 'Usage: bun run make:model <PascalCaseName>');
  }
  const pascal = rawName;
  if (schemaHasModel(pascal)) {
    die(
      `Model "${pascal}" already exists in prisma/schema.prisma.`,
      "Refusing to duplicate. Pick another name or edit the existing model."
    );
  }

  const kebab = toKebabCase(pascal);
  const snakeTable = kebab.replace(/-/g, "_");
  const serviceDir = path.resolve(process.cwd(), "features", kebab, "lib");
  const servicePath = path.join(serviceDir, `${kebab}.service.ts`);

  info(`Creating Prisma model ${pascal} (@@map("${snakeTable}"))...`);
  appendModelToSchema(buildPrismaModelStub({ pascal, snakeTable }));
  success(`  ✔ updated prisma/schema.prisma`);

  if (existsSync(servicePath)) {
    warn(`  ⚠ features/${kebab}/lib/${kebab}.service.ts already exists — skipped.`);
  } else {
    mkdirSync(serviceDir, { recursive: true });
    writeFileSync(
      servicePath,
      buildServiceModule({ pascal, kebab, camel: toCamelCase(kebab) })
    );
    success(`  ✔ created features/${kebab}/lib/${kebab}.service.ts`);
  }

  const wantsMigration = flags.includes("--migration") || flags.includes("-m");
  if (wantsMigration) {
    runPrismaMigration(`create_${pluralize(snakeTable)}_table`);
  } else {
    info("");
    info("Next steps:");
    info(`  bunx prisma migrate dev --name create_${pluralize(snakeTable)}_table`);
    info(`  bunx prisma generate`);
  }

  return { ranMigration: wantsMigration };
}

function runPrismaMigration(name: string): void {
  info(`Running: bunx prisma migrate dev --create-only --name ${name}`);
  const result = spawnSync("bunx", ["prisma", "migrate", "dev", "--create-only", "--name", name], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    die(`prisma migrate exited with code ${result.status ?? "unknown"}.`);
  }
  success(`  ✔ migration "${name}" created.`);
  info("Review the SQL, then apply with: bunx prisma migrate dev");
}

function generateMigration(rawName: string): GeneratorResult {
  const check = validateMigrationName(rawName);
  if (!check.valid) {
    die(
      check.reason ?? "Invalid migration name.",
      "Usage: bun run make:migration <snake_case_name>"
    );
  }
  warn("NOTE: Edit prisma/schema.prisma FIRST — it is the single source of truth.");
  warn("This creates an empty migration file you can adjust before applying.");
  runPrismaMigration(rawName);
  return { ranMigration: true };
}

function generateController(rawName: string): GeneratorResult {
  const check = validateGenericName(rawName);
  if (!check.valid) {
    die(check.reason ?? "Invalid name.", "Usage: bun run make:controller <name>");
  }
  const parts = normalizeName(rawName);
  if (!parts) die("Invalid name.");
  const filePath = path.resolve(
    process.cwd(),
    "app",
    "api",
    "[[...route]]",
    `${parts.kebab}.ts`
  );
  assertNotExists(filePath, `Controller "${parts.kebab}"`);
  info(`Creating Hono sub-router for ${parts.kebab}...`);
  writeGeneratedFile(filePath, buildControllerModule(parts));
  info("");
  info("Next steps (manual mount in app/api/[[...route]]/route.ts):");
  info(`  import ${parts.camel}Router from "./${parts.kebab}";`);
  info(`  app.route("/${parts.kebab}", ${parts.camel}Router); // add to typed chain`);
  return { ranMigration: false };
}

function generateComponent(rawName: string, flags: string[]): GeneratorResult {
  const check = validateComponentName(rawName);
  if (!check.valid) {
    die(check.reason ?? "Invalid component name.", "Usage: bun run make:component <PascalCaseName> [--client]");
  }
  const parts = normalizeName(rawName);
  if (!parts) die("Invalid component name.");
  const client = flags.includes("--client");
  const filePath = path.resolve(
    process.cwd(),
    "features",
    parts.kebab,
    "components",
    `${parts.kebab}.tsx`
  );
  assertNotExists(filePath, `Component "${rawName}"`);
  info(`Creating ${client ? "Client" : "Server"} Component ${rawName}...`);
  writeGeneratedFile(filePath, buildComponentModule({ pascal: rawName }, client));
  return { ranMigration: false };
}

function generateAction(rawName: string): GeneratorResult {
  const check = validateGenericName(rawName);
  if (!check.valid) {
    die(check.reason ?? "Invalid name.", "Usage: bun run make:action <name>");
  }
  const parts = normalizeName(rawName);
  if (!parts) die("Invalid name.");
  const filePath = path.resolve(process.cwd(), "action", `${parts.kebab}.ts`);
  assertNotExists(filePath, `Action "${parts.kebab}"`);
  info(`Creating Server Action for ${parts.kebab}...`);
  writeGeneratedFile(filePath, buildActionModule(parts));
  return { ranMigration: false };
}

function generateSeeder(rawName: string): GeneratorResult {
  const check = validateGenericName(rawName);
  if (!check.valid) {
    die(check.reason ?? "Invalid name.", "Usage: bun run make:seeder <name>");
  }
  const parts = normalizeName(rawName);
  if (!parts) die("Invalid name.");
  const filePath = path.resolve(process.cwd(), "prisma", "seeders", `${parts.camel}.seeder.ts`);
  assertNotExists(filePath, `Seeder "${parts.camel}"`);
  info(`Creating seeder for ${parts.camel}...`);
  writeGeneratedFile(filePath, buildSeederModule({ camel: parts.camel }));
  info("");
  info("Next steps (manual registration in prisma/seed.ts):");
  info(`  import { seed${parts.pascal} } from "./seeders/${parts.camel}.seeder";`);
  info(`  await seed${parts.pascal}();`);
  return { ranMigration: false };
}

function generateHook(rawName: string): GeneratorResult {
  const check = validateGenericName(rawName);
  if (!check.valid) {
    die(check.reason ?? "Invalid name.", "Usage: bun run make:hook <name>");
  }
  const parts = normalizeName(rawName);
  if (!parts) die("Invalid name.");
  const filePath = path.resolve(
    process.cwd(),
    "features",
    parts.kebab,
    "hooks",
    `use-${parts.kebab}.ts`
  );
  assertNotExists(filePath, `Hook "use-${parts.kebab}"`);
  info(`Creating TanStack Query hook use-${parts.kebab}...`);
  writeGeneratedFile(filePath, buildHookModule(parts));
  return { ranMigration: false };
}

function generateSchema(rawName: string): GeneratorResult {
  const check = validateGenericName(rawName);
  if (!check.valid) {
    die(check.reason ?? "Invalid name.", "Usage: bun run make:schema <name>");
  }
  const parts = normalizeName(rawName);
  if (!parts) die("Invalid name.");
  const filePath = path.resolve(
    process.cwd(),
    "features",
    parts.kebab,
    "schemas",
    `${parts.kebab}.schema.ts`
  );
  assertNotExists(filePath, `Schema "${parts.kebab}"`);
  info(`Creating Zod schema for ${parts.kebab}...`);
  writeGeneratedFile(filePath, buildSchemaModule({ kebab: parts.kebab }));
  return { ranMigration: false };
}

// ---------------------------------------------------------------------------
// Registry + CLI dispatch
// ---------------------------------------------------------------------------

type GeneratorFn = (name: string, flags: string[]) => GeneratorResult;

interface GeneratorEntry {
  description: string;
  usage: string;
  run: GeneratorFn;
  deferred?: boolean;
}

const GENERATORS: Record<string, GeneratorEntry> = {
  "make:model": {
    description: "Prisma model stub + feature service module (features/<kebab>/lib/)",
    usage: "make:model <PascalCaseName> [--migration|-m]",
    run: generateModel,
  },
  "make:migration": {
    description: "Create-only Prisma migration (edit schema first)",
    usage: "make:migration <snake_case_name>",
    run: (name) => generateMigration(name),
  },
  "make:controller": {
    description: "Hono sub-router stub (app/api/[[...route]]/, manual mount)",
    usage: "make:controller <name>",
    run: (name) => generateController(name),
  },
  "make:component": {
    description: "Server Component in features/<kebab>/components/ (--client for client component)",
    usage: "make:component <PascalCaseName> [--client]",
    run: (name, flags) => generateComponent(name, flags),
  },
  "make:action": {
    description: "Server Action with Zod validation + revalidatePath (action/)",
    usage: "make:action <name>",
    run: (name) => generateAction(name),
  },
  "make:seeder": {
    description: "Prisma seeder stub (prisma/seeders/, manual registration in seed.ts)",
    usage: "make:seeder <name>",
    run: (name) => generateSeeder(name),
  },
  "make:hook": {
    description: "TanStack Query hook in features/<kebab>/hooks/",
    usage: "make:hook <name>",
    run: (name) => generateHook(name),
  },
  "make:schema": {
    description: "Zod schema in features/<kebab>/schemas/",
    usage: "make:schema <name>",
    run: (name) => generateSchema(name),
  },
};

const DEFERRED: string[] = [];

function printHelp(): void {
  console.log("\nArtisan-style generators\n");
  console.log("Usage: bun scripts/make.ts <generator> <name>\n");
  console.log("Available:");
  for (const [key, entry] of Object.entries(GENERATORS)) {
    console.log(`  ${key.padEnd(16)} ${entry.description}`);
    console.log(`${"".padEnd(18)}usage: ${entry.usage}`);
  }
  if (DEFERRED.length > 0) {
    console.log(`\nDeferred (not implemented): ${DEFERRED.join(", ")}`);
  }
  console.log();
}

function main(argv: string[]): void {
  const [generator, ...rest] = argv;

  if (!generator || generator === "--help" || generator === "-h" || generator === "help") {
    printHelp();
    process.exit(generator ? 0 : 1);
  }

  const entry = GENERATORS[generator];
  if (!entry) {
    if (DEFERRED.includes(generator)) {
      die(`Generator "${generator}" is planned but not implemented yet.`, undefined);
    }
    die(`Unknown generator "${generator}".`, `Available: ${Object.keys(GENERATORS).join(", ")}`);
  }

  const name = rest.find((arg) => !arg.startsWith("-"));
  const flags = rest.filter((arg) => arg.startsWith("-"));
  if (!name) {
    die(`Missing name argument.`, `Usage: bun run ${entry.usage}`);
  }

  entry.run(name, flags);
  success("\nDone.");
}

main(process.argv.slice(2));
