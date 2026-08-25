import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/features/search/hooks/use-debounce";

export type SearchEntityTypeFilter = "" | "post" | "user" | "auditlog";

export interface SearchParams {
  query: string;
  entityType?: SearchEntityTypeFilter;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  entityType: string;
  entityId: string;
  title: string;
  description: string;
  url?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiEnvelope {
  success: boolean;
  data?: SearchResponse;
  error?: { code: string; message: string };
}

async function fetchSearch(params: SearchParams): Promise<SearchResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("q", params.query);
  if (params.entityType) searchParams.set("type", params.entityType);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  const res = await fetch(`/api/search?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Search failed");
  const body: unknown = await res.json();

  // Unwrap the { success, data } envelope
  const parsed = body as ApiEnvelope;
  if (!parsed.success || !parsed.data) {
    throw new Error(parsed.error?.message ?? "Search failed");
  }
  return parsed.data;
}

export function useSearch({ query, entityType = "", page = 1, limit = 10 }: SearchParams) {
  const debouncedQuery = useDebounce(query.trim(), 300);
  const enabled = debouncedQuery.length >= 2;

  return useQuery({
    queryKey: ["search", debouncedQuery, entityType, page, limit],
    queryFn: () => fetchSearch({ query: debouncedQuery, entityType, page, limit }),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    // Return a stable empty shape when disabled so consumers don't special-case undefined
    select: (data) => data ?? { results: [], total: 0, page, limit, totalPages: 0 },
  });
}
