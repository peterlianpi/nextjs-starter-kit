"use client";

import * as React from "react";
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  LinkedinIcon,
  XIcon as ShareXIcon,
  WhatsappIcon,
} from "react-share";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  return (
    <div className="flex items-center gap-2 print:hidden">
      <TwitterShareButton url={url} title={title} aria-label="Share on X">
        <ShareXIcon size={32} round />
      </TwitterShareButton>
      <FacebookShareButton url={url} aria-label="Share on Facebook">
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <LinkedinShareButton url={url} title={title} aria-label="Share on LinkedIn">
        <LinkedinIcon size={32} round />
      </LinkedinShareButton>
      <WhatsappShareButton url={url} title={title} aria-label="Share on WhatsApp">
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>
    </div>
  );
}
