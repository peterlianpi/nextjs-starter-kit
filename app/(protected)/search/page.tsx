import type { Metadata } from "next";
import { SearchPage } from "@/app/(protected)/search/search-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Search — ${site.name}`,
  description: "Search posts, users, and audit log entries.",
};

import { Suspense } from "react";

export default function Search() {
  return (
    <Suspense fallback={null}>
      <SearchPage />
    </Suspense>
  );
}
