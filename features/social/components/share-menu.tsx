"use client";

import * as React from "react";
import { Check, Link2, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShareButtons } from "./share-buttons";

interface ShareMenuProps {
  url: string;
  title: string;
  className?: string;
}

export function ShareMenu({ url, title, className }: ShareMenuProps) {
  const [copied, setCopied] = React.useState(false);
  const [canNativeShare, setCanNativeShare] = React.useState(false);

  React.useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      // user cancelled or share failed — no-op
    }
  };

  return (
    <section
      className={cn(
        "flex flex-wrap items-center gap-3 print:hidden",
        className
      )}
      aria-label="Share this post"
    >
      <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Share2 aria-hidden className="h-4 w-4" />
        Share
      </span>

      {/* Desktop / non-Web-Share devices: explicit network buttons + copy link */}
      {!canNativeShare ? (
        <>
          <ShareButtons url={url} title={title} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
          >
            {copied ? (
              <Check aria-hidden className="h-4 w-4" />
            ) : (
              <Link2 aria-hidden className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy link"}
          </Button>
        </>
      ) : (
        /* Mobile devices with Web Share API: native share sheet */
        <Button type="button" size="sm" onClick={handleNativeShare}>
          <Share2 aria-hidden className="h-4 w-4" />
          Share this post
        </Button>
      )}
    </section>
  );
}
