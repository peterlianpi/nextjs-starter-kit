import { Hono } from "hono";
import { handle } from "hono/vercel";

import admin from "./admin";
import health from "./health";
import search from "./search";
import upload from "./upload";
import apiKeys from "./api-keys";
import webhooks from "./webhooks";

// ============================================
// MAIN APP ROUTER
// ============================================

const app = new Hono().basePath("/api")

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const route = app
  .route("/admin", admin)
  .route("/health", health)
  .route("/search", search)
  .route("/upload", upload)
  .route("/keys", apiKeys)
  .route("/webhooks", webhooks);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const PUT = handle(app);
export const OPTIONS = handle(app);

export type AppType = typeof route;
