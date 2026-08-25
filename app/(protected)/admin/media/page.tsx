"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Upload,
  Image as ImageIcon,
  File,
  Video,
  Trash2,
  Eye,
  Download,
  Search,
  Grid3X3,
  List,
  Loader2,
  X,
} from "lucide-react";
import { formatBytes } from "@/lib/services/file-upload";
import { toast } from "sonner";
import { UploadWithCrop } from "@/features/media/components/upload-with-crop";

interface MediaItem {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  url: string;
  storageType: string;
  isPublic: boolean;
  createdAt: string;
  description?: string;
  tags?: string[];
}

type ViewMode = "grid" | "list";

export default function MediaManagementPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [cropFile, setCropFile] = useState<File | null>(null);

  // Fetch media on mount
  useEffect(() => {
    async function fetchMedia() {
      try {
        const response = await fetch("/api/upload");
        if (!response.ok) throw new Error("Failed to fetch media");
        const result = await response.json();
        if (result.success) {
          setMedia(result.data);
        }
      } catch {
        toast.error("Failed to load media library");
      } finally {
        setLoading(false);
      }
    }
    fetchMedia();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    for (const file of acceptedFiles) {
      // Route images through the crop pipeline (Unit 13); other files upload directly.
      if (file.type.startsWith("image/")) {
        setCropFile(file);
        continue;
      }
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const result = await response.json();
        if (result.success) {
          setMedia((prev) => [result.data, ...prev]);
          toast.success(`Uploaded ${file.name}`);
        }
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024,
  });

  const handleDelete = async (item: MediaItem) => {
    try {
      const response = await fetch(`/api/upload/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      setMedia((prev) => prev.filter((m) => m.id !== item.id));
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete file");
    }
    setDeleteTarget(null);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="h-5 w-5" />;
    if (mimeType.startsWith("video/")) return <Video className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const getFileType = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "Image";
    if (mimeType.startsWith("video/")) return "Video";
    if (mimeType === "application/pdf") return "PDF";
    return "File";
  };

  const filteredMedia = media.filter((item) => {
    const matchesSearch =
      item.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "all" || getFileType(item.mimeType) === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-0">
      {/* Header with CardHeader */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Media Library</CardTitle>
              <CardDescription>
                Upload and manage images, videos, and files
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Upload Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            } ${uploading ? "pointer-events-none opacity-50" : ""}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              {isDragActive
                ? "Drop files here"
                : "Drag & drop files here, or click to select"}
            </p>
            <p className="text-xs text-muted-foreground">
              Max size: 50MB per file
            </p>
          </div>
          {uploading && (
            <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </div>
          )}
          <div className="mt-4">
            <UploadWithCrop
              externalFile={cropFile}
              onExternalFileConsumed={() => setCropFile(null)}
              onUploaded={(rec) =>
                setMedia((prev) => [
                  {
                    id: rec.id,
                    originalName: rec.originalName,
                    fileName: rec.fileName ?? rec.originalName,
                    mimeType: rec.mimeType ?? "image/jpeg",
                    fileSize: rec.fileSize ?? 0,
                    url: rec.url,
                    storageType: rec.storageType ?? "unknown",
                    isPublic: rec.isPublic ?? true,
                    createdAt: rec.createdAt ?? new Date().toISOString(),
                  },
                  ...prev,
                ])
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {["all", "Image", "Video", "PDF", "File"].map((f) => (
            <Badge
              key={f}
              variant={filter === f ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter(f)}
            >
              {f}
            </Badge>
          ))}
        </div>
      </div>

      {/* Media Grid/List */}
      {filteredMedia.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>No media files</CardTitle>
            <CardDescription>
              Upload files using the drop zone above
            </CardDescription>
          </CardHeader>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredMedia.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedMedia(item)}
            >
              <div className="aspect-square bg-muted flex items-center justify-center">
                {item.mimeType.startsWith("image/") ? (
                  <img
                    src={item.url}
                    alt={item.originalName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    {getFileIcon(item.mimeType)}
                    <p className="text-xs text-muted-foreground mt-2">
                      {getFileType(item.mimeType)}
                    </p>
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">
                  {item.originalName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(item.fileSize)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => setSelectedMedia(item)}
            >
              <div className="h-12 w-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                {getFileIcon(item.mimeType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.originalName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(item.fileSize)} •{" "}
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="secondary">{getFileType(item.mimeType)}</Badge>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(item.url, "_blank");
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(item);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Detail Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMedia?.originalName}</DialogTitle>
            <DialogDescription>
              {selectedMedia && (
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                  <div>
                    <span className="text-muted-foreground">Type:</span>{" "}
                    {getFileType(selectedMedia.mimeType)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Size:</span>{" "}
                    {formatBytes(selectedMedia.fileSize)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Storage:</span>{" "}
                    {selectedMedia.storageType}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uploaded:</span>{" "}
                    {new Date(selectedMedia.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedMedia?.mimeType.startsWith("image/") && (
            <div className="aspect-video bg-muted rounded overflow-hidden">
              <img
                src={selectedMedia.url}
                alt={selectedMedia.originalName}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => window.open(selectedMedia?.url, "_blank")}
            >
              <Eye className="mr-2 h-4 w-4" /> View
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const link = document.createElement("a");
                link.href = selectedMedia?.url || "";
                link.download = selectedMedia?.originalName || "";
                link.click();
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setSelectedMedia(null);
                setDeleteTarget(selectedMedia);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
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
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
