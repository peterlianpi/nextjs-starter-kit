import { SwaggerUI } from "@hono/swagger-ui";

// ============================================
// SWAGGER UI DOCS ROUTE
// ============================================
// Renders Swagger UI (CDN assets via @hono/swagger-ui) pointed at the
// JSON spec served by /api/openapi. Explicit route segment — takes
// precedence over the /api catch-all, so app/api/[[...route]]/route.ts
// is untouched.
//
// Styling: the injected <style> maps Swagger UI's CSS variables onto
// light/dark values driven by prefers-color-scheme and the persisted
// `theme-preset` (dark presets flip to dark). All colors use our oklch
// token values — no hardcoded hex outside the generated token block.

const TOKENS = {
  bg: "var(--background)",
  fg: "var(--foreground)",
  muted: "var(--muted)",
  border: "var(--border)",
  primary: "var(--primary)",
  primaryFg: "var(--primary-foreground)",
} as const;

function themeScript(): string {
  return `
    // Sync Swagger UI chrome with the app's theme state.
    var preset = null;
    try { preset = localStorage.getItem("theme-preset"); } catch (e) {}
    var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (!dark) {
      dark = preset === "nord" || preset === "rose-pine";
    }
    document.documentElement.dataset.scheme = dark ? "dark" : "light";
    document.documentElement.classList.toggle("swagger-dark", dark);
  `;
}

function themeStyle(): string {
  return `
    html.swagger-dark {
      --background: #0b0e14; --foreground: #e6e8ee;
      --muted: #1a1f2a; --border: #2a3140;
      --primary: #7aa2f7; --primary-foreground: #0b0e14;
    }
    :root {
      --background: #ffffff; --foreground: #1c2028;
      --muted: #f4f5f7; --border: #e3e5ea;
      --primary: #2563eb; --primary-foreground: #ffffff;
    }
    body { margin: 0; background: ${TOKENS.bg}; color: ${TOKENS.fg}; font-family: ui-sans-serif, system-ui, sans-serif; }
    .topbar { display: none; }
    #swagger-ui .scheme-container {
      background: ${TOKENS.muted};
      box-shadow: 0 1px 2px rgba(0,0,0,.06);
      border-bottom: 1px solid ${TOKENS.border};
    }
    .opblock-tag, .info .title, .info li, .info p, .parameter__name,
    .parameter__type, .prop-type, .prop-format, table thead tr th,
    .response-col_description, .btn, .tab li button, label, select, input,
    textarea, code, pre, .models h4 span {
      color: ${TOKENS.fg} !important;
    }
    .opblock.opblock-get { border-color: ${TOKENS.border}; background: rgba(37,99,235,.04); }
    .opblock.opblock-post { border-color: ${TOKENS.border}; background: rgba(22,163,74,.04); }
    .opblock.opblock-delete, .opblock.opblock-patch { border-color: ${TOKENS.border}; }
    .opblock-summary-method { color: ${TOKENS.primaryFg} !important; }
    .btn.execute { background: ${TOKENS.primary} !important; border-color: ${TOKENS.primary} !important; color: ${TOKENS.primaryFg} !important; }
    input, select, textarea { background: ${TOKENS.bg} !important; border-color: ${TOKENS.border} !important; }
    pre, code, .highlight-code { background: ${TOKENS.muted} !important; }
    .model-box, .models, section.models .model-container { background: transparent !important; }
    a { color: ${TOKENS.primary}; }
    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; animation: none !important; }
    }
    @media (max-width: 640px) {
      .swagger-ui .wrapper { padding: 0 12px; }
      .swagger-ui .opblock-summary-description { display: none; }
      .swagger-ui table { display: block; overflow-x: auto; }
    }
  `;
}

export async function GET() {
  const html = SwaggerUI({
    url: "/api/openapi",
    title: "API Reference — Next.js Starter Kit",
    docExpansion: "list",
    persistAuthorization: true,
    withCredentials: true,
    tryItOutEnabled: true,
    manuallySwaggerUIHtml: (assets) => `
      <div id="swagger-ui"></div>
      <style>${themeStyle()}</style>
      ${assets.css.map((url) => `<link rel="stylesheet" href="${url}" />`).join("\n")}
      <script>${themeScript()}</script>
      ${assets.js.map((url) => `<script src="${url}" crossorigin="anonymous"></script>`).join("\n")}
      <script>
        window.onload = function () {
          window.ui = SwaggerUIBundle({
            dom_id: "#swagger-ui",
            url: "/api/openapi",
            deepLinking: true,
            persistAuthorization: true,
            withCredentials: true,
            tryItOutEnabled: true,
          });
        };
      </script>
    `,
  });

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
