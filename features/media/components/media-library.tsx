"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { File, Image as ImageIcon, Loader2, Trash2, Video } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBytes } from "@/lib/services/file-upload";

export interface MediaLibraryItem {
  id: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  url: string;
  createdAt: string;
}

const PAGE_SIZE = 12;

interface MediaLibraryProps {
  /** Extra items to show at the top (e.g. just-uploaded records). */
  extraItems?: MediaLibraryItem[];
  /** Called after a successful delete so parents can sync their own state. */
  onDeleted?: (id: string) => void;
}

/**
 * Paginated grid of existing uploads from the FileUpload-backed
 * `GET /api/upload` endpoint, with thumbnails and a delete action.
 */
export function MediaLibrary({ extraItems = [], onDeleted }: MediaLibraryProps) {
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<MediaLibraryItem | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch("/api/upload");
      if (!res.ok) throw new Error("Failed to fetch media");
      const payload = (await res.json()) as {
        success: boolean;
        data?: MediaLibraryItem[];
      };
      if (payload.success && payload.data) setItems(payload.data);
    } catch {
      toast.error("Failed to load media library");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMedia();
  }, [fetchMedia]);

  const combined = useMemo(() => {
    const seen = new Set(extraItems.map((item) => item.id));
    return [...extraItems, ...items.filter((item) => !seen.has(item.id))];
  }, [items, extraItems]);

  const totalPages = Math.max(1, Math.ceil(combined.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = combined.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/upload/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      onDeleted?.(deleteTarget.id);
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete file");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const getIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="h-5 w-5" />;
    if (mimeType.startsWith("video/")) return <Video className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Library</CardTitle>
        <CardDescription>
          {combined.length} file{combined.length === 1 ? "" : "s"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {pageItems.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No uploads yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {pageItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="flex aspect-square items-center justify-center bg-muted">
                  {item.mimeType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.originalName}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      {getIcon(item.mimeType)}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatBytes(item.fileSize)}
                      </p>
                    </div>
                  )}
                </div>
                <CardContent className="flex items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {item.originalName}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {formatBytes(item.fileSize)}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${item.originalName}`}
                    onClick={() => setDeleteTarget(item)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Select
              value={String(currentPage)}
              onValueChange={(value) => setPage(Number(value))}
            >
              <SelectTrigger className="w-24" aria-label="Page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number_) => (
                    <SelectItem key={number_} value={String(number_)}>
                      Page {number_}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleteTarget?.originalName}. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
