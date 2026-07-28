"use client";

import { Car, FileText } from "lucide-react";

import type { ListingDocumentUpload, ListingMediaItem } from "@/features/vendor/data/vendor-add-listing";

type ListingMediaThumbnailProps = {
  item: ListingMediaItem;
  className?: string;
};

export function ListingMediaThumbnail({ item, className = "" }: ListingMediaThumbnailProps) {
  if (item.kind === "video") {
    return (
      <video
        src={item.previewUrl}
        className={className}
        muted
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.previewUrl} alt={item.name} className={className} />
  );
}

type ListingMediaPreviewProps = {
  items: ListingMediaItem[];
  fallbackIcon?: typeof Car;
  className?: string;
};

export function ListingMediaPreview({
  items,
  fallbackIcon: FallbackIcon = Car,
  className = "",
}: ListingMediaPreviewProps) {
  const primary = items[0];

  return (
    <div
      className={`relative aspect-[16/10] w-full min-h-[140px] overflow-hidden bg-[#F5F5F5] ${className}`}
    >
      {primary ? (
        <ListingMediaThumbnail
          item={primary}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full min-h-[140px] items-center justify-center">
          <FallbackIcon className="h-10 w-10 text-[#CFCFCF]" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}

type DocumentUploadPreviewProps = {
  upload: ListingDocumentUpload;
  className?: string;
};

export function DocumentUploadPreview({ upload, className = "" }: DocumentUploadPreviewProps) {
  if (upload.previewUrl) {
    return (
      <div className={`overflow-hidden rounded-lg border border-[#E8F5E9] bg-[#F1FAF3] ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={upload.previewUrl}
          alt={upload.name}
          className="aspect-[4/3] w-full object-cover"
        />
        <p className="truncate px-3 py-2 text-xs font-semibold font-satoshi text-[#2E7D32]">
          {upload.name}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-[#E8F5E9] bg-[#F1FAF3] px-3 py-3 ${className}`}
    >
      <FileText className="h-5 w-5 shrink-0 text-[#2E7D32]" />
      <p className="truncate text-xs font-semibold font-satoshi text-[#2E7D32]">{upload.name}</p>
    </div>
  );
}
