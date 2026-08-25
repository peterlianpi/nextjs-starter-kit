"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Link2,
  Unlink,
  ImagePlus,
  Highlighter,
  Braces,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { ImageCropper } from "@/features/media/components/image-cropper";
import { getCroppedBlob, readFileAsDataUrl, validateImageFile } from "@/features/media/hooks/use-crop";

import { uploadImageFile } from "../hooks/use-editor";

interface ToolbarProps {
  editor: Editor | null;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("h-9 w-9 sm:h-8 sm:w-8", active && "bg-accent text-accent-foreground")}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      {children}
    </Button>
  );
}

export function Toolbar({ editor }: ToolbarProps) {
  // Pending image going through the crop pipeline: file name + data URL.
  const [pendingImage, setPendingImage] = useState<
    { name: string; src: string } | null
  >(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  if (!editor) {
    return <div className="h-9 rounded-t-md border border-input bg-muted/50" />;
  }

  const setLink = () => {
    const url = window.prompt("Link URL");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  /**
   * Image insertion runs through the Unit 13 crop pipeline (spec
   * context/specs/13-image-crop.md): pick → validate → cropper modal →
   * canvas export → upload processed blob → insert returned URL.
   */
  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const validationError = validateImageFile(file);
      if (validationError) {
        setImageError(validationError);
        return;
      }

      readFileAsDataUrl(file)
        .then((src) => setPendingImage({ name: file.name, src }))
        .catch((error: unknown) => {
          console.error("[Toolbar] Failed to read image:", error);
          setImageError("Failed to read image file.");
        });
    };
    input.click();
  };

  const handleCropConfirm = async (croppedAreaPixels: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    if (!pendingImage) return;

    setUploadingImage(true);
    setImageError(null);
    try {
      const blob = await getCroppedBlob(pendingImage.src, croppedAreaPixels);
      const file = new File([blob], pendingImage.name, {
        type: blob.type || "image/jpeg",
      });
      const url = await uploadImageFile(file);
      editor.chain().focus().setImage({ src: url }).run();
      setPendingImage(null);
    } catch (error) {
      console.error("[Toolbar] Image upload failed:", error);
      setImageError(
        error instanceof Error ? error.message : "Image upload failed.",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex flex-wrap items-center gap-0.5 rounded-t-md border border-input bg-muted/50 px-1 py-1"
    >
      <ToolbarButton title="Bold" active={editor.isActive("bold")} disabled={!editor.can().chain().focus().toggleBold().run()} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Highlight" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}>
        <Highlighter className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Ordered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Braces className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton title="Insert link" active={editor.isActive("link")} onClick={setLink}>
        <Link2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Remove link" disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()}>
        <Unlink className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Insert image" onClick={addImage}>
        <ImagePlus className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton title="Undo" disabled={!editor.can().chain().focus().undo().run()} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Redo" disabled={!editor.can().chain().focus().redo().run()} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>

      {imageError && (
        <span role="alert" className="ml-2 text-xs text-destructive">
          {imageError}
        </span>
      )}

      {pendingImage && (
        <ImageCropper
          imageSrc={pendingImage.src}
          open={!!pendingImage && !uploadingImage}
          onConfirm={handleCropConfirm}
          onCancel={() => {
            if (!uploadingImage) setPendingImage(null);
          }}
        />
      )}
    </div>
  );
}
