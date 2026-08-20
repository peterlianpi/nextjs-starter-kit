import { useQuery } from "@tanstack/react-query";

interface SearchParams {
  query: string;
  entityType?: string;
  page?: number;
  limit?: number;
}

interface SearchResult {
  id: string;
  entityType: string;
  entityId: string;
  title: string;
  description: string;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function fetchSearch(params: SearchParams): Promise<SearchResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("q", params.query);
  if (params.entityType) searchParams.set("type", params.entityType);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  const res = await fetch(`/api/search?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: ["search", params.query, params.entityType, params.page],
    queryFn: () => fetchSearch(params),
    enabled: params.query.length >= 2,
  });
}
