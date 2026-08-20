import type { Metadata } from "next";
import { StarterHome } from "@/features/starter/components/starter-home";
import { metadata as siteMetadata, site } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [...site.keywords],
  openGraph: siteMetadata.openGraph,
  twitter: siteMetadata.twitter,
};

export default function Home() {
  return <StarterHome />;
}
