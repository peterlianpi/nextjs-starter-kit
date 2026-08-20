"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  className?: string;
  loading?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  className,
  loading,
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      <Button onClick={onSearch} disabled={loading || !value.trim()}>
        {loading ? "Searching..." : "Search"}
      </Button>
    </div>
  );
}

interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  entityType: string;
}

interface SearchResultsProps {
  results: SearchResultItem[];
  loading?: boolean;
  onSelect?: (item: SearchResultItem) => void;
  emptyMessage?: string;
}

export function SearchResults({
  results,
  loading,
  onSelect,
  emptyMessage = "No results found",
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="space-y-2 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="h-4 w-48 animate-pulse bg-muted rounded mb-2" />
            <div className="h-3 w-64 animate-pulse bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground mt-4">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-4">
      {results.map((item) => (
        <button
          key={item.id}
          className="w-full text-left p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          onClick={() => onSelect?.(item)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.title}</p>
              <p className="text-sm text-muted-foreground truncate">
                {item.description}
              </p>
            </div>
            <Badge variant="secondary" className="flex-shrink-0">
              {item.entityType}
            </Badge>
          </div>
        </button>
      ))}
    </div>
  );
}
