import { z } from "zod";

import {
  createPostSchema,
  updatePostSchema,
} from "@/features/editor/schemas/post";

// ============================================
// OPENAPI 3.1 SPECIFICATION
// ============================================
// Hand-authored spec describing the Hono routes mounted at
// app/api/[[...route]]/route.ts plus the Better Auth endpoints.
// Served as JSON at /api/openapi and rendered by Swagger UI at /api/docs.

/**
 * Convert a Zod schema into a JSON Schema fragment for use in
 * `components.requestBodies` / `components.schemas`. Zod v4 ships
 * `z.toJSONSchema`, so no extra dependency is needed.
 */
function jsonSchema(schema: z.ZodType): Record<string, unknown> {
  return z.toJSONSchema(schema, { io: "input" }) as Record<string, unknown>;
}

const errorResponse = {
  description: "Error response",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          success: { type: "boolean", const: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
            },
            required: ["code", "message"],
          },
        },
        required: ["success", "error"],
      },
    },
  },
};

const unauthorized = {
  ...errorResponse,
  description: "Authentication required",
};

const forbidden = {
  ...errorResponse,
  description: "Insufficient permissions",
};

const sessionCookieSecurity = [{ sessionCookie: [] }];
const bearerOrSession = [{ sessionCookie: [] }, { apiKey: [] }];

export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Next.js Starter Kit API",
    version: "0.1.0",
    description:
      "Type-safe REST API built with Hono and mounted via the catch-all route handler at `/api`. " +
      "All responses share the envelope `{ success, data?, error?: { code, message } }`. " +
      "Interactive documentation lives at [/api/docs](/api/docs); this raw document at [/api/openapi](/api/openapi).",
  },
  servers: [{ url: "/", description: "Current deployment" }],
  tags: [
    { name: "Health", description: "Service liveness and auth-context checks" },
    { name: "Auth", description: "Better Auth endpoints (sign-in/up/out, sessions, OAuth)" },
    { name: "Posts", description: "Blog post CRUD backed by TipTap JSON content" },
    { name: "Admin", description: "Admin-only user management, stats and audit logs" },
    { name: "Upload", description: "File uploads (Cloudinary / R2 / S3 / local)" },
    { name: "Search", description: "Full-text search across entities" },
    { name: "API Keys", description: "API key management (hashed storage, permissions)" },
    { name: "Webhooks", description: "Outgoing webhooks with delivery tracking" },
  ],
  components: {
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "better-auth.session_token",
        description: "Better Auth session cookie set by sign-in.",
      },
      apiKey: {
        type: "http",
        scheme: "bearer",
        description: "Project API key issued via /api/keys (stored hashed).",
      },
    },
    schemas: {
      CreatePost: jsonSchema(createPostSchema),
      UpdatePost: jsonSchema(updatePostSchema),
      ApiEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {},
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
            },
          },
        },
        required: ["success"],
      },
    },
  },
  security: sessionCookieSecurity,
  paths: {
    // ---------- Health ----------
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Simple health check",
        security: [],
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", const: true },
                    status: { type: "string", const: "ok" },
                    timestamp: { type: "string", format: "date-time" },
                    uptime: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/health/auth": {
      get: {
        tags: ["Health"],
        summary: "Health check with auth context",
        security: [],
        responses: {
          "200": {
            description: "Returns whether the caller has a valid session",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
        },
      },
    },
    "/api/health/echo": {
      post: {
        tags: ["Health"],
        summary: "Echo endpoint for testing",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { message: { type: "string", minLength: 1 } },
                required: ["message"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Echoed message",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
        },
      },
    },

    // ---------- Auth (Better Auth) ----------
    "/api/auth/{...action}": {
      parameters: [
        {
          name: "...action",
          in: "path",
          required: true,
          description:
            "Better Auth action path, e.g. `sign-in/email`, `sign-up/email`, `sign-out`, `get-session`. Full list: https://www.better-auth.com/docs/reference",
          schema: { type: "string" },
        },
      ],
      post: {
        tags: ["Auth"],
        summary: "Auth actions (sign-in/sign-up/sign-out/OAuth callbacks)",
        security: [],
        requestBody: {
          description:
            "Action-specific JSON body (e.g. `{ email, password }` for credential flows).",
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          "200": { description: "Action result; sets/clears the session cookie" },
          "401": unauthorized,
        },
      },
      get: {
        tags: ["Auth"],
        summary: "Read auth state (e.g. get-session)",
        security: [],
        responses: {
          "200": { description: "Session or user data for the current cookie" },
        },
      },
    },

    // ---------- Posts ----------
    "/api/posts": {
      get: {
        tags: ["Posts"],
        summary: "List posts (paginated, searchable)",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" }, description: "Title/excerpt search term" },
          { name: "page", in: "query", schema: { type: "string", default: "1" } },
          { name: "limit", in: "query", schema: { type: "string", default: "10" } },
        ],
        responses: {
          "200": {
            description: "Paginated post summaries (drafts only visible to permitted roles)",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
        },
      },
      post: {
        tags: ["Posts"],
        summary: "Create a post",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreatePost" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created post",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "400": errorResponse,
          "401": unauthorized,
          "403": forbidden,
        },
      },
    },
    "/api/posts/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Post ID" },
      ],
      get: {
        tags: ["Posts"],
        summary: "Get a single post",
        responses: {
          "200": {
            description: "Full post including TipTap content JSON string",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "404": errorResponse,
        },
      },
      patch: {
        tags: ["Posts"],
        summary: "Update a post",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdatePost" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated post",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
          "403": forbidden,
          "404": errorResponse,
        },
      },
      delete: {
        tags: ["Posts"],
        summary: "Delete a post",
        responses: {
          "200": {
            description: "Deletion confirmation",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
          "403": forbidden,
          "404": errorResponse,
        },
      },
    },

    // ---------- Admin ----------
    "/api/admin/check-admin": {
      get: {
        tags: ["Admin"],
        summary: "Check whether the current session has an admin role",
        responses: {
          "200": {
            description: "`{ success, isAdmin }`",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
        },
      },
    },
    "/api/admin/stats": {
      get: {
        tags: ["Admin"],
        summary: "Dashboard statistics (users, posts, uploads, metrics)",
        responses: {
          "200": {
            description: "Aggregated counts",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
          "403": forbidden,
        },
      },
    },
    "/api/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List users (paginated)",
        parameters: [
          { name: "page", in: "query", schema: { type: "string", default: "1" } },
          { name: "limit", in: "query", schema: { type: "string", default: "10" } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Paginated user list",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
          "403": forbidden,
        },
      },
    },
    "/api/admin/users/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" },
      ],
      get: {
        tags: ["Admin"],
        summary: "Get a single user",
        responses: {
          "200": {
            description: "User record",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
          "403": forbidden,
          "404": errorResponse,
        },
      },
      patch: {
        tags: ["Admin"],
        summary: "Update user role / ban state",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  role: {
                    type: "string",
                    enum: ["USER", "VIEWER", "EDITOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"],
                  },
                  banned: { type: "boolean" },
                  banReason: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated user",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
          "403": forbidden,
        },
      },
    },
    "/api/admin/users/{id}/audit-logs": {
      get: {
        tags: ["Admin"],
        summary: "Audit logs for a user",
        responses: {
          "200": {
            description: "Audit log entries",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
          "403": forbidden,
        },
      },
    },
    "/api/admin/users/{id}/notifications": {
      get: {
        tags: ["Admin"],
        summary: "Notifications for a user",
        responses: {
          "200": {
            description: "Notification entries",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
          "403": forbidden,
        },
      },
    },
    "/api/admin/users/{id}/sessions": {
      get: {
        tags: ["Admin"],
        summary: "Active sessions for a user",
        responses: {
          "200": {
            description: "Session records",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
          "403": forbidden,
        },
      },
    },

    // ---------- Upload ----------
    "/api/upload": {
      get: {
        tags: ["Upload"],
        summary: "List uploaded files (metadata grid)",
        responses: {
          "200": {
            description: "FileUpload records",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
        },
      },
      post: {
        tags: ["Upload"],
        summary: "Upload a file (multipart/form-data)",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" },
                },
                required: ["file"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Created FileUpload record incl. public URL",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "400": errorResponse,
          "401": unauthorized,
        },
      },
    },
    "/api/upload/{id}": {
      delete: {
        tags: ["Upload"],
        summary: "Delete an uploaded file (storage object + metadata)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Deletion confirmation",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
          "404": errorResponse,
        },
      },
    },

    // ---------- Search ----------
    "/api/search": {
      get: {
        tags: ["Search"],
        summary: "Search across entities (posts, users, etc.)",
        parameters: [
          { name: "q", in: "query", required: true, schema: { type: "string", minLength: 2 } },
          { name: "type", in: "query", schema: { type: "string" }, description: "Entity type filter" },
          { name: "page", in: "query", schema: { type: "string", default: "1" } },
          { name: "limit", in: "query", schema: { type: "string", default: "10" } },
        ],
        responses: {
          "200": {
            description: "Paginated search results",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
        },
      },
    },

    // ---------- API Keys ----------
    "/api/keys": {
      get: {
        tags: ["API Keys"],
        summary: "List API keys for the current user",
        security: sessionCookieSecurity,
        responses: {
          "200": {
            description: "Key metadata (prefix only — hashes are never returned)",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
        },
      },
      post: {
        tags: ["API Keys"],
        summary: "Create an API key (plaintext shown once)",
        security: sessionCookieSecurity,
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  permissions: { type: "object", additionalProperties: true },
                  expiresAt: { type: "string", format: "date-time" },
                },
                required: ["name"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Created key incl. one-time plaintext value",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
        },
      },
    },
    "/api/keys/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      patch: {
        tags: ["API Keys"],
        summary: "Revoke or update an API key",
        security: sessionCookieSecurity,
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  revoked: { type: "boolean" },
                  expiresAt: { type: "string", format: "date-time", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated key metadata",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
          "404": errorResponse,
        },
      },
      delete: {
        tags: ["API Keys"],
        summary: "Delete an API key permanently",
        security: sessionCookieSecurity,
        responses: {
          "200": {
            description: "Deletion confirmation",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
          "404": errorResponse,
        },
      },
    },

    // ---------- Webhooks ----------
    "/api/webhooks": {
      get: {
        tags: ["Webhooks"],
        summary: "List registered outgoing webhooks",
        security: bearerOrSession,
        responses: {
          "200": {
            description: "Webhook records with subscribed events",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
        },
      },
      post: {
        tags: ["Webhooks"],
        summary: "Register an outgoing webhook",
        security: bearerOrSession,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  url: { type: "string", format: "uri" },
                  events: {
                    type: "array",
                    items: { type: "string" },
                    description: "Event types to subscribe to",
                  },
                },
                required: ["url", "events"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Created webhook incl. signing secret",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "400": errorResponse,
          "401": unauthorized,
        },
      },
    },
    "/api/webhooks/{id}": {
      delete: {
        tags: ["Webhooks"],
        summary: "Delete a webhook",
        security: bearerOrSession,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Deletion confirmation",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
          "404": errorResponse,
        },
      },
    },
    "/api/webhooks/{id}/deliveries": {
      get: {
        tags: ["Webhooks"],
        summary: "Delivery history for a webhook",
        security: bearerOrSession,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "WebhookDelivery records with retry counts",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiEnvelope" } } },
          },
          "401": unauthorized,
        },
      },
    },
  },
} as const;
