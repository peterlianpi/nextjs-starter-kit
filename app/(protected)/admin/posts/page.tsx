"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, MoreHorizontal, Plus, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { client } from "@/lib/api/hono-client";

interface PostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  featured: boolean;
  viewCount: number;
  createdAt: string;
  author: { id: string; name: string | null };
}

interface PostsListResponse {
  success: boolean;
  data?: {
    posts: PostListItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
  error?: { code: string; message: string };
}

export default function AdminPostsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-posts", search, page],
    queryFn: async (): Promise<PostsListResponse> => {
      const res = await client.api.posts.$get({
        query: { search: search || undefined, page: String(page), limit: String(limit) },
      });
      return (await res.json()) as PostsListResponse;
    },
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.posts[":id"].$delete({ param: { id } });
      if (!res.ok) throw new Error("Failed to delete post");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    },
  });

  const posts = data?.data?.posts ?? [];
  const meta = data?.data?.meta;

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            Failed to load posts. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-0">
      {/* Page Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Posts Management</CardTitle>
              <CardDescription>Create and manage blog posts</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9"
                />
              </div>
              <Button asChild>
                <Link href="/admin/posts/new">
                  <Plus className="h-4 w-4 mr-1" />
                  New Post
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-62.5" />
                    <Skeleton className="h-4 w-50" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{post.title}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-64">
                                /{post.slug}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              post.status === "PUBLISHED"
                                ? "default"
                                : post.status === "DRAFT"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{post.author.name || "Unknown"}</TableCell>
                        <TableCell>
                          {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/posts/${post.id}/edit`}>Edit</Link>
                              </DropdownMenuItem>
                              {post.status === "PUBLISHED" && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/blog/${post.slug}`} target="_blank">
                                    View
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  if (confirm(`Delete "${post.title}"?`)) {
                                    deletePost.mutate(post.id);
                                  }
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * meta.limit + 1} to{" "}
                    {Math.min(page * meta.limit, meta.total)} of {meta.total} posts
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= meta.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardHeader className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle>No posts found</CardTitle>
                <CardDescription>
                  {search ? "Try adjusting your search" : "No posts have been created yet"}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
