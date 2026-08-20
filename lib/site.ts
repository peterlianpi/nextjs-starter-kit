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
    "A production-ready Next.js starter kit with authentication, admin panel, and modular architecture.",

  // URL configuration
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  // Language
  lang: "en" as const,

  // Branding
  creator: "Starter Kit Team",
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
    "starter kit",
    "authentication",
    "admin panel",
    "typescript",
    "prisma",
    "postgresql",
  ],
} as const;

export type SiteConfig = typeof site;

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
