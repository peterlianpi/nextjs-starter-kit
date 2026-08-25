import { NextResponse } from "next/server";

import { openApiSpec } from "@/lib/openapi";

// ============================================
// OPENAPI JSON SPEC ROUTE
// ============================================
// Serves the OpenAPI 3.1 document consumed by Swagger UI at /api/docs.
// Explicit route segment — takes precedence over the /api catch-all.

export async function GET() {
  return NextResponse.json(openApiSpec);
}
