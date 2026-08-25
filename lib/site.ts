import type { Metadata } from "next";

// ============================================
// SITE CONFIGURATION
// ============================================
// Centralized site configuration for the entire application.
// Import this module wherever you need site metadata, branding, or URLs.

export const site = {
  // Basic identity
  name: "Next.js Starter Kit",
  shortName: "StarterKit",
  description:
    "Production-ready Next.js 16 starter kit with Better Auth, RBAC, admin panel, organizations, blog CMS, multi-provider uploads and email, theme presets, Hono RPC API, and Prisma 7 + PostgreSQL.",

  // URL configuration
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  // Language
  lang: "en" as const,

  // Branding
  creator: "Peter Lianpi",
  publisher: "Next.js Starter Kit",

  // Social / Open Graph defaults
  ogImage: "/og.png",
  ogImageType: "image/png" as const,
  ogImageWidth: 1200,
  ogImageHeight: 630,

  // Twitter
  twitterHandle: "@nextjsstarter",

  // Icons
  icon: "/favicon.ico",
  appleIcon: "/apple-icon.png",

  // Keywords
  keywords: [
    "nextjs",
    "nextjs starter kit",
    "next.js 16",
    "react 19",
    "starter kit",
    "boilerplate",
    "authentication",
    "better auth",
    "rbac",
    "admin panel",
    "admin dashboard",
    "multi-tenant organizations",
    "blog cms",
    "rich text editor",
    "file uploads",
    "theme presets",
    "hono api",
    "hono rpc",
    "typescript",
    "prisma",
    "prisma 7",
    "postgresql",
    "tailwind css",
    "shadcn ui",
    "tanstack query",
    "vercel deployment",
  ],
} as const;

export type SiteConfig = typeof site;

// ============================================
// THEME PRESETS
// ============================================
// Single source of truth for named color themes applied via the
// `data-theme` attribute on <html>. Each entry's swatch colors are used
// in the theme picker UI. Token definitions live in app/globals.css
// under `[data-theme="..."]` selectors.

export type ThemePreset = {
  id: string;
  label: string;
  /** Two colors shown as a swatch: [background, accent] */
  swatch: [string, string];
};

export const themePresets: ThemePreset[] = [
  { id: "default", label: "Default", swatch: ["#ffffff", "#18181b"] },
  { id: "sepia", label: "Sepia", swatch: ["#f5ecd9", "#8a5a2b"] },
  { id: "nord", label: "Nord", swatch: ["#2e3440", "#88c0d0"] },
  { id: "rose-pine", label: "Rosé Pine", swatch: ["#191724", "#c4a7e7"] },
];

export const themeIds = themePresets.map((t) => t.id) as [string, ...string[]];

// ============================================
// DERIVED VALUES
// ============================================

export const siteUrl = site.url;

// ============================================
// METADATA EXPORT
// ============================================

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.shortName,
  authors: [{ name: site.creator }],
  generator: "Next.js",
  keywords: [...site.keywords],
  creator: site.creator,
  publisher: site.publisher,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(site.url),
  alternates: {
    canonical: site.url,
  },
  openGraph: {
    type: "website",
    locale: site.lang,
    url: site.url,
    title: site.name,
    description: site.description,
    siteName: site.name,
    images: [
      {
        url: site.ogImage,
        width: site.ogImageWidth,
        height: site.ogImageHeight,
        alt: site.name,
        type: site.ogImageType,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    creator: site.twitterHandle,
    images: [site.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: site.icon,
    apple: site.appleIcon,
  },
  manifest: "/site.webmanifest",
};

// ============================================
// JSON-LD STRUCTURED DATA
// ============================================

export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  description: site.description,
  url: site.url,
  publisher: {
    "@type": "Organization",
    name: site.publisher,
  },
};
